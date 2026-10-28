import { test, expect } from "@playwright/test";

// Words that describe price or plan on the landing page. Matched as whole
// words, case-insensitive, against the full server HTML, which includes the
// <head> tags, hidden text, aria-labels and the hydration payload.
const COST_TERMS = [
  "free", "free forever", "no cost", "no credit card", "credit card", "always free",
  "forever", "pricing", "price", "cost", "plans", "upgrade", "premium", "pro",
  "subscription", "unlimited", "founding member",
];

test.describe("Landing page copy", () => {
  test("HTML contains no cost wording and no em dash", async ({ request }) => {
    const res = await request.get("/");
    expect(res.ok()).toBeTruthy();
    const html = await res.text();

    const hits = COST_TERMS.filter((t) => new RegExp(`\\b${t}\\b`, "i").test(html));
    if (html.includes("$0")) hits.push("$0");
    expect(hits, `cost wording found: ${hits.join(", ")}`).toEqual([]);

    expect(html.includes("\u2014"), "em dash found").toBe(false);
    expect(html.includes("&mdash;"), "em dash entity found").toBe(false);
  });
});

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hero headline is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: /track your clinical hours for amcas/i })).toBeVisible();
  });

  test("Create account links to /auth/signup", async ({ page }) => {
    const cta = page.getByRole("link", { name: /^create account$/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/auth/signup");
  });

  test("Sign in links to /auth/login", async ({ page }) => {
    const signIn = page.getByRole("link", { name: /^sign in$/i }).first();
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", "/auth/login");
  });

  test("sample dashboard is labelled", async ({ page }) => {
    await expect(page.getByText(/sample dashboard/i)).toBeVisible();
  });

  test("section headings are present", async ({ page }) => {
    for (const name of [/hours, schools and your story/i, /tools for the rest of the cycle/i, /see the pattern in your experiences/i, /start with the hours you already have/i]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
  });

  test("footer links resolve", async ({ page }) => {
    const footer = page.getByRole("navigation", { name: "Footer" });
    for (const label of ["About", "Changelog", "Privacy", "Terms"]) {
      await expect(footer.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
  });

  test("About link in navbar navigates to /about", async ({ page }) => {
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: /^about$/i }).click();
    await expect(page).toHaveURL(/\/about/);
  });

  test("mobile menu opens and shows sign in", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByLabel("Menu").click();
    const menu = page.getByRole("navigation", { name: "Mobile" });
    await expect(menu.getByRole("link", { name: /^create account$/i })).toBeVisible();
    await expect(menu.getByRole("link", { name: /^sign in$/i })).toBeVisible();
  });

  test("no horizontal scroll at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Visual screenshots", () => {
  test("homepage screenshot", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "tests/screenshots/landing.png", fullPage: true });
  });

  test("login page screenshot", async ({ page }) => {
    await page.goto("/auth/login");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "tests/screenshots/login.png", fullPage: true });
  });

  test("signup page screenshot", async ({ page }) => {
    await page.goto("/auth/signup");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "tests/screenshots/signup.png", fullPage: true });
  });

  test("about page screenshot", async ({ page }) => {
    await page.goto("/about");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "tests/screenshots/about.png", fullPage: true });
  });
});
