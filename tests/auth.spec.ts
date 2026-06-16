import { test, expect } from "@playwright/test";

test.describe("Auth pages — unauthenticated", () => {
  test("login page renders email, password fields and Sign In button", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator("input[type='email'], input[name='email']").first()).toBeVisible();
    await expect(page.locator("input[type='password'], input[name='password']").first()).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i }).first()).toBeVisible();
  });

  test("login page shows Forgot password link", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("link", { name: /forgot password/i })).toBeVisible();
  });

  test("login page links to signup", async ({ page }) => {
    await page.goto("/auth/login");
    // "Don't have an account? Sign up" or similar
    const link = page.locator("a[href='/auth/signup']").first();
    await expect(link).toBeVisible();
  });

  test("signup page has name, email, and password fields", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.locator("input[name='name'], input[id='name']").first()).toBeVisible();
    await expect(page.locator("input[type='email'], input[name='email']").first()).toBeVisible();
    await expect(page.locator("input[type='password'], input[name='password']").first()).toBeVisible();
  });

  test("signup page has submit button", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.getByRole("button", { name: /create account|sign up/i }).first()).toBeVisible();
  });

  test("signup page links to login", async ({ page }) => {
    await page.goto("/auth/signup");
    const link = page.locator("a[href='/auth/login']").first();
    await expect(link).toBeVisible();
  });
});
