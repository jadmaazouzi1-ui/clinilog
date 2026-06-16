import { test, expect } from "@playwright/test";

// Schools is a protected route. These tests only run when test credentials
// are provided via env vars TEST_USER_EMAIL + TEST_USER_PASSWORD.
const TEST_EMAIL = process.env.TEST_USER_EMAIL;
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;
const hasCreds = !!(TEST_EMAIL && TEST_PASSWORD);

test.describe(hasCreds ? "Schools page (authenticated)" : "Schools page (skipped — no test creds)", () => {
  test.skip(!hasCreds, "Set TEST_USER_EMAIL and TEST_USER_PASSWORD to run schools tests.");

  test.beforeEach(async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill("input[type='email'], input[name='email']", TEST_EMAIL!);
    await page.fill("input[type='password'], input[name='password']", TEST_PASSWORD!);
    await page.getByRole("button", { name: /^sign in$/i }).first().click();
    await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
    await page.goto("/schools");
  });

  test("loads with school cards visible", async ({ page }) => {
    await expect(page.getByText(/medical school explorer/i)).toBeVisible();
    // At least one well-known school should render
    await expect(page.getByText("Harvard Medical School").first()).toBeVisible();
  });

  test("shows 149 schools total", async ({ page }) => {
    await expect(page.locator("text=/of 149 schools/i").first()).toBeVisible();
  });

  test("Primary Care filter narrows the count", async ({ page }) => {
    const beforeText = await page.locator("text=/Showing.*of 149/i").first().textContent();
    await page.getByRole("button", { name: /primary care.*underserved/i }).click();
    const afterText = await page.locator("text=/Showing.*of 149/i").first().textContent();
    expect(beforeText).not.toEqual(afterText);
  });

  test("GPA + MCAT match highlight works", async ({ page }) => {
    await page.fill("#gpa-input", "3.7");
    await page.fill("#mcat-input", "515");
    // At least one Good Match badge should appear
    await expect(page.getByText(/good match/i).first()).toBeVisible();
  });

  test("Home state filter applies", async ({ page }) => {
    await page.selectOption("#home-state", "CA");
    await expect(page.getByText(/in-state for you/i).first()).toBeVisible();
  });
});

test.describe("Schools page — unauthenticated", () => {
  test("redirects to /auth/login", async ({ page }) => {
    await page.goto("/schools");
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
  });
});
