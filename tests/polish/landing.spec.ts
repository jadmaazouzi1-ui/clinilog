import { test, expect } from "@playwright/test";

// Logged-out home page. Matched against the full server HTML, which includes
// <head> tags, hidden text, aria-labels and the hydration payload.
const COST_TERMS = [
  "free", "free forever", "no cost", "no credit card", "credit card", "always free",
  "forever", "pricing", "price", "cost", "plans", "upgrade", "premium", "pro",
  "subscription", "unlimited", "founding member", "for now", "coming soon",
];

test("landing HTML has no cost wording, dashes or user counts", async ({ request }) => {
  const res = await request.get("/");
  expect(res.ok()).toBeTruthy();
  const html = await res.text();
  const hits = COST_TERMS.filter((t) => new RegExp(`\\b${t}\\b`, "i").test(html));
  if (html.includes("$0")) hits.push("$0");
  expect(hits, `cost wording found: ${hits.join(", ")}`).toEqual([]);
  expect(/[–—]|&mdash;|&ndash;/.test(html), "dash found").toBe(false);
  // "Join 1,000+ students" style counts, or any number of users/students/members.
  expect(html).not.toMatch(/\b\d[\d,.]*\+?\s*(students|users|members|pre-?meds|people)\b/i);
  expect(html).not.toMatch(/\bjoin\b[^<]{0,30}\d/i);
});

// Other pages a logged-out visitor can open. Same cost wording rule, so the
// About, Terms and sign-in pages cannot drift back to a price claim. Only
// the strongest terms are checked here: "free" and "pro" appear legitimately
// in unrelated sentences on legal pages.
for (const path of ["/about", "/terms", "/privacy", "/auth/login", "/auth/signup"]) {
  test(`${path} makes no price claim`, async ({ request }) => {
    const res = await request.get(path);
    expect(res.ok()).toBeTruthy();
    const html = await res.text();
    const hits = ["free", "forever", "no cost", "credit card", "pricing", "premium", "subscription", "unlimited"]
      .filter((t) => new RegExp(`\\b${t}\\b`, "i").test(html));
    expect(hits, `price wording on ${path}: ${hits.join(", ")}`).toEqual([]);
  });
}

test("title and description match the brief", async ({ request }) => {
  const html = await (await request.get("/")).text();
  expect(html).toContain("<title>ClinicLog MD | Pre-med hours tracker</title>");
  expect(html).toMatch(/<meta name="description" content="Log clinical hours, shadowing, research and volunteering/);
  expect(html).toMatch(/<meta property="og:image"/);
});

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("headline, actions and sample label", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Watch your experience grow into a record." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Start logging hours" })).toHaveAttribute("href", "/auth/signup");
    for (const link of await page.getByRole("link", { name: "Create account" }).all()) {
      await expect(link).toHaveAttribute("href", "/auth/signup");
    }
    for (const link of await page.getByRole("link", { name: "Sign in" }).all()) {
      await expect(link).toHaveAttribute("href", "/auth/login");
    }
    await expect(page.getByText("SAMPLE DATA / 118 HRS / 14 ENTRIES")).toBeVisible();
    await expect(page.getByRole("img", { name: /^Sample Your Path tree, not real data/ })).toBeVisible();
  });

  test("four numbered rows and the closing band", async ({ page }) => {
    for (const name of ["Hours that stay organized", "Schools that fit your numbers", "A story drawn from your record", "The rest of the cycle", "Log your first entry in under a minute."]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
  });

  test("footer links only to pages that exist", async ({ page, request }) => {
    const footer = page.getByRole("navigation", { name: "Footer" });
    for (const label of ["About", "Privacy", "Terms", "Changelog"]) {
      const href = await footer.getByRole("link", { name: label, exact: true }).getAttribute("href");
      expect((await request.get(href!)).status(), label).toBe(200);
    }
  });

  test("no AI Advisor button and no BETA badge", async ({ page }) => {
    await expect(page.getByRole("button", { name: /advisor/i })).toHaveCount(0);
    await expect(page.getByText(/^beta$/i)).toHaveCount(0);
  });

  test("buttons are at least 44px tall", async ({ page }) => {
    for (const name of ["Start logging hours", "Create account", "Sign in"]) {
      for (const el of await page.getByRole("link", { name }).all()) {
        const box = await el.boundingBox();
        expect(box!.height, name).toBeGreaterThanOrEqual(44);
      }
    }
  });

  for (const width of [390, 768, 1024, 1440, 1920]) {
    test(`no horizontal scroll and readable labels at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const sizes = await page.locator(".lp-path-label").evaluateAll((els) => els.map((e) => parseFloat(getComputedStyle(e).fontSize)));
      for (const s of sizes) expect(s).toBeGreaterThanOrEqual(14);
      // Legend items never overlap each other.
      const boxes = await page.locator(".lp-path-legend li").evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()));
      for (let i = 0; i < boxes.length; i++)
        for (let j = i + 1; j < boxes.length; j++) {
          const a = boxes[i], b = boxes[j];
          const hit = a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
          expect(hit, `legend ${i} overlaps ${j}`).toBe(false);
        }
    });
  }
});
