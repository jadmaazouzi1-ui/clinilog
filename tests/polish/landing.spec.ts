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
  expect(/[\u2013\u2014]|&mdash;|&ndash;/.test(html), "dash found").toBe(false);
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
  expect(html).toContain("<title>ClinicLog MD</title>");
  expect(html).toMatch(/<meta name="description" content="Log clinical hours, shadowing, research and volunteering/);
  expect(html).toMatch(/<meta property="og:image"/);
});

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("one promise, one action, real screenshots labelled as sample", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Keep every hour ready for AMCAS." })).toBeVisible();
    // The only button-style action is Create an account; Sign in is a text link.
    const ctas = page.locator(".lp .btn");
    expect(await ctas.count()).toBeGreaterThan(0);
    for (const el of await ctas.all()) {
      await expect(el).toHaveText("Create an account");
      await expect(el).toHaveAttribute("href", "/auth/signup");
    }
    for (const link of await page.getByRole("link", { name: "Sign in" }).all()) {
      await expect(link).toHaveAttribute("href", "/auth/login");
    }
    await expect(page.getByRole("img", { name: /^The ClinicLog MD Overview page/ })).toBeVisible();
    await expect(page.getByText("The Overview page, filled with sample data.")).toBeVisible();
    await expect(page.getByText("The Log hours form, with a sample entry.")).toBeVisible();
  });

  test("figures match the app's own data", async ({ page }) => {
    const { SCHOOLS, MD_SCHOOLS, DO_SCHOOLS, CARIBBEAN_SCHOOLS } = await import("../../src/lib/schools");
    const { SPECIALTIES } = await import("../../src/lib/specialties");
    const text = await page.locator(".lp-facts").innerText();
    expect(text).toContain(`${SCHOOLS.length}\nmedical schools`);
    expect(text).toContain(`${MD_SCHOOLS.length} MD, ${DO_SCHOOLS.length} DO and ${CARIBBEAN_SCHOOLS.length} Caribbean`);
    expect(text).toContain(`${SPECIALTIES.length}\nspecialties`);
  });

  test("sections do not repeat a layout back to back", async ({ page }) => {
    const classes = await page.locator(".lp > main > section").evaluateAll((els) => els.map((e) => e.className));
    for (let i = 1; i < classes.length; i++) expect(classes[i], `section ${i}`).not.toBe(classes[i - 1]);
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

  test("links and buttons are at least 44px tall", async ({ page }) => {
    for (const el of await page.locator(".lp a").all()) {
      const box = await el.boundingBox();
      if (box) expect(box.height, await el.innerText()).toBeGreaterThanOrEqual(44);
    }
  });

  for (const width of [390, 768, 1024, 1440, 1920]) {
    test(`no horizontal scroll and no text under 13px at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      const small = await page.evaluate(() =>
        [...document.querySelectorAll(".lp *")]
          .filter((e) => e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()))
          .map((e) => parseFloat(getComputedStyle(e).fontSize))
          .filter((s) => s < 13),
      );
      expect(small).toEqual([]);
    });
  }
});
