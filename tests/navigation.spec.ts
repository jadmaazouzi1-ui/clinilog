import { test, expect } from "@playwright/test";

test.describe("Public navigation", () => {
  test("logo on about page links to /", async ({ page }) => {
    await page.goto("/about");
    const logoLink = page.locator("a[href='/']").first();
    await expect(logoLink).toBeVisible();
    await logoLink.click();
    // After clicking, the path should be the root "/"
    await expect.poll(() => new URL(page.url()).pathname).toBe("/");
  });

  test("About page loads with hero headline", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /the pre-med journey deserves better tools/i })).toBeVisible();
  });

  test("About page shows the three values cards", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: /accessibility/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /clarity/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /community/i })).toBeVisible();
  });

  test("About page closing CTA links to signup", async ({ page }) => {
    await page.goto("/about");
    const cta = page.getByRole("link", { name: /get started free/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/auth/signup");
  });

  test("protected routes redirect to /auth/login when not signed in", async ({ page }) => {
    const protectedRoutes = ["/dashboard", "/schools", "/profile", "/archetype", "/specialties", "/gapyear", "/postbacc", "/resources", "/fee-tracker", "/stories"];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
    }
  });
});
