import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("PRE-MED PLATFORM eyebrow text is visible", async ({ page }) => {
    await expect(page.getByText(/PRE-MED PLATFORM/i).first()).toBeVisible();
  });

  test("hero headline is visible", async ({ page }) => {
    // Headline reads: Your Pre-Med Journey, Organized
    await expect(page.getByRole("heading", { name: /your pre-med journey, organized/i })).toBeVisible();
  });

  test("Get Started Free button links to /auth/signup", async ({ page }) => {
    const cta = page.getByRole("link", { name: /get started free/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/auth/signup");
  });

  test("Sign In link is visible in hero navbar", async ({ page }) => {
    const signIn = page.getByRole("link", { name: /^sign in$/i }).first();
    await expect(signIn).toBeVisible();
    await expect(signIn).toHaveAttribute("href", "/auth/login");
  });

  test("all 12 feature cards are visible", async ({ page }) => {
    const titles = [
      "Track Every Hour",
      "Explore 150+ Schools",
      "Export to PDF",
      "Narrative Builder",
      "AI Pre-Med Advisor",
      "Reframe Engine",
      "Pre-Med Archetype",
      "Specialty Explorer",
      "Resource Library",
      "Gap Year Planner",
      "Post-bacc Tracker",
      "First-Gen Stories",
    ];
    for (const title of titles) {
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
    }
  });

  test("How It Works section is present", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /how it works/i })).toBeVisible();
  });

  test("footer link columns exist", async ({ page }) => {
    await expect(page.getByText(/^Product$/).first()).toBeVisible();
    await expect(page.getByText(/^Planning$/).first()).toBeVisible();
    await expect(page.getByText(/^Community$/).first()).toBeVisible();
  });

  test("About link in navbar navigates to /about", async ({ page }) => {
    await page.getByRole("link", { name: /^about$/i }).first().click();
    await expect(page).toHaveURL(/\/about/);
  });

  test("Floating stat cards show 149 / 015 / 012", async ({ page }) => {
    await expect(page.getByText("149").first()).toBeVisible();
    await expect(page.getByText("015").first()).toBeVisible();
    await expect(page.getByText("012").first()).toBeVisible();
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
