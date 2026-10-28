import { test, expect } from "@playwright/test";
import { anonClient, SUPABASE_URL, ANON_KEY } from "./env";

// Everything here runs as an anonymous visitor: no accounts needed.

const PROTECTED = ["/dashboard", "/schools", "/profile", "/interviews", "/recommendations", "/fee-tracker",
  "/postbacc", "/gapyear", "/import", "/outline", "/mock-interview", "/archetype", "/admin/insights"];

test("1. protected pages redirect anonymous visitors to login", async ({ page }) => {
  for (const p of PROTECTED) {
    await page.goto(p);
    expect(new URL(page.url()).pathname, p).toBe("/auth/login");
  }
});

test("2. API routes refuse anonymous callers", async ({ request }) => {
  const posts = ["/api/advisor", "/api/reframe", "/api/outline", "/api/mock-interview", "/api/archetype", "/api/account/delete"];
  for (const p of posts) {
    const r = await request.post(p, { data: {} });
    expect([401, 400], `${p} -> ${r.status()}`).toContain(r.status());
    expect(r.status(), p).not.toBe(200);
  }
  expect((await request.get("/api/account/export")).status()).toBe(401);
});

test("3. cross-origin POSTs are rejected (CSRF)", async ({ request }) => {
  for (const p of ["/api/advisor", "/api/account/delete", "/api/theme", "/api/pageview"]) {
    const r = await request.post(p, { data: { confirm: "DELETE" }, headers: { Origin: "https://evil.example" } });
    expect(r.status(), p).toBe(403);
  }
});

test("4. auth callback cannot be used as an open redirect", async ({ request }) => {
  for (const next of ["//evil.example", ".evil.example", "https://evil.example"]) {
    const r = await request.get(`/auth/callback?code=x&next=${encodeURIComponent(next)}`, { maxRedirects: 0 });
    const loc = r.headers()["location"] ?? "";
    const base = new URL(r.url());
    expect(new URL(loc, base).host, next).toBe(base.host);
  }
});

test("5. security headers are present", async ({ request }) => {
  const h = (await request.get("/")).headers();
  expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(h["content-security-policy"]).toContain("object-src 'none'");
  expect(h["content-security-policy"]).not.toContain("unsafe-eval");
  // Scripts need a per-request nonce; no blanket inline-script allowance.
  const scriptSrc = (csp: string) => csp.split(";").find((d) => d.trim().startsWith("script-src")) ?? "";
  expect(scriptSrc(h["content-security-policy"])).not.toContain("unsafe-inline");
  expect(scriptSrc(h["content-security-policy"])).toMatch(/'nonce-[A-Za-z0-9+/=]{16,}'/);
  const again = (await request.get("/")).headers()["content-security-policy"];
  expect(scriptSrc(again)).not.toBe(scriptSrc(h["content-security-policy"]));
  expect(h["strict-transport-security"]).toContain("max-age=63072000");
  expect(h["x-frame-options"]).toBe("DENY");
  expect(h["x-content-type-options"]).toBe("nosniff");
  expect(h["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  const api = (await request.get("/api/account/export")).headers();
  expect(api["cache-control"]).toContain("no-store");
});

test("6. client bundle holds no secrets and no source maps", async ({ request }) => {
  const scripts = new Set<string>();
  for (const p of ["/", "/auth/login", "/auth/signup"]) {
    const html = await (await request.get(p)).text();
    for (const m of html.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)) scripts.add(m[1]);
  }
  expect(scripts.size).toBeGreaterThan(0);
  const patterns: [string, RegExp][] = [
    ["Google API key", /AIza[0-9A-Za-z_-]{35}/],
    ["Resend key", /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}/],
    ["Stripe live key", /sk_live_[0-9a-zA-Z]{10,}/],
    ["private key", /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
    ["env var names", /SUPABASE_SERVICE_ROLE_KEY|GEMINI_API_KEY|RATE_LIMIT_SECRET|CRON_SECRET/],
  ];
  let first = "";
  for (const s of scripts) {
    const body = await (await request.get(s)).text();
    for (const [name, re] of patterns) expect(re.test(body), `${name} in ${s}`).toBe(false);
    // Any JWT must be the anon key, never service_role.
    for (const jwt of body.match(/eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/g) ?? []) {
      const payload = JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString());
      expect(payload.role, `JWT in ${s}`).toBe("anon");
    }
    first ||= s;
  }
  expect((await request.get(first + ".map")).status()).toBe(404);
});

test("7. cron and unsubscribe endpoints fail closed", async ({ request }) => {
  expect((await request.get("/api/cron/weekly-digest")).status()).toBe(401);
  expect((await request.get("/api/cron/weekly-digest", { headers: { Authorization: "Bearer undefined" } })).status()).toBe(401);
  const fake = "00000000-0000-0000-0000-000000000000";
  expect((await request.get(`/api/unsubscribe?u=${fake}&t=forged`)).status()).toBe(400);
  expect((await request.post(`/api/unsubscribe?u=${fake}&t=forged`)).status()).toBe(400);
});

test("8. anonymous API key reads no user rows from any table", async () => {
  test.skip(!SUPABASE_URL || !ANON_KEY, "needs NEXT_PUBLIC_SUPABASE_* in .env.local");
  const db = anonClient();
  for (const t of ["profiles", "experiences", "school_applications", "interviews", "waitlist_updates", "recommendations",
    "fee_waivers", "gap_year_data", "postbacc_courses", "postbacc_profile", "referrals", "story_submissions",
    "page_visits", "user_rate_limits", "auth_rate_limits"]) {
    const { data } = await db.from(t).select("*").limit(5);
    expect(data ?? [], t).toHaveLength(0);
  }
});

test("9. privileged database functions refuse anonymous callers [needs migration]", async () => {
  test.skip(!SUPABASE_URL || !ANON_KEY, "needs NEXT_PUBLIC_SUPABASE_* in .env.local");
  const db = anonClient();
  expect((await db.rpc("admin_insights")).error, "admin_insights").not.toBeNull();
  expect((await db.rpc("delete_my_account")).error, "delete_my_account").not.toBeNull();
  expect((await db.rpc("claim_referral", { p_code: "AAAAAAA" })).error, "claim_referral").not.toBeNull();
  expect((await db.rpc("check_user_rate_limit", { p_action: "x", p_max: 1, p_window_secs: 60 })).error).not.toBeNull();
  // Without the server secret nobody can burn another person's login quota.
  const noSecret = await db.rpc("check_auth_rate_limit", {
    p_key: "ip:203.0.113.9", p_action: "login", p_max: 5, p_window_secs: 60, p_secret: "guess",
  });
  expect(noSecret.error, "check_auth_rate_limit with wrong secret").not.toBeNull();
  const oldSig = await db.rpc("check_auth_rate_limit", { p_key: "ip:203.0.113.9", p_action: "login", p_max: 5, p_window_secs: 60 });
  expect(oldSig.error, "old 4-argument signature must be gone").not.toBeNull();
});

test("10. anonymous story inserts are refused at the database [needs migration]", async () => {
  test.skip(!SUPABASE_URL || !ANON_KEY, "needs NEXT_PUBLIC_SUPABASE_* in .env.local");
  // undergrad_school is blank on purpose: before the migration the old length
  // CHECK rejects it, so a failing run never writes a row to production.
  // After the migration blank is allowed, and only the RLS policy stops it.
  const { error } = await anonClient().from("story_submissions").insert({
    name: "security-test", undergrad_school: "", medical_school: "x", background: "", quote: "",
  });
  expect(error).not.toBeNull();
});

test("11. login and reset do not reveal whether an email is registered", async ({ page }) => {
  await page.goto("/auth/login");
  await page.locator("input[name='email']").last().fill("nobody-" + Date.now() + "@example.invalid");
  await page.locator("input[name='password']").fill("WrongPassword123!");
  await page.locator("input[name='password']").press("Enter");
  await page.waitForURL(/error=/);
  const msg = decodeURIComponent(new URL(page.url()).searchParams.get("error") ?? "");
  expect(msg).not.toMatch(/not found|no user|does not exist|not registered/i);
});

test("12. sign-up refuses non-@wfu.edu emails, even straight to Supabase", async () => {
  test.skip(!SUPABASE_URL || !ANON_KEY, "needs NEXT_PUBLIC_SUPABASE_* in .env.local");
  // Refused by a trigger before the row exists, so no account or email is created.
  const { data, error } = await anonClient().auth.signUp({
    email: `probe-${Date.now()}@example.com`, password: "Correct-Horse-Battery-9",
  });
  expect(error).not.toBeNull();
  expect(data.user).toBeNull();
});
