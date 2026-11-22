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

  test("About page loads with its heading", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1, name: "About ClinicLog MD" })).toBeVisible();
  });

  test("About page says what it does and does not do", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "What it does", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "What it does not do" })).toBeVisible();
  });

  test("About page closing CTA links to signup", async ({ page }) => {
    await page.goto("/about");
    const cta = page.getByRole("main").getByRole("link", { name: "Create an account" });
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
