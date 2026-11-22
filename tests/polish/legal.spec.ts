import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { LEGAL_VERSION } from "../../src/lib/legal";

// The Privacy Policy and Terms: required sections, anchors the app links to,
// version shown, and the consent wiring around them.

const PRIVACY_IDS = ["who", "collect", "use", "ai", "sharing", "patients", "choices", "retention", "security", "cookies", "age", "international", "rights", "changes", "contact"];
const TERMS_IDS = ["acceptance", "eligibility", "service", "content", "use", "ai", "data", "changes-service", "termination", "ip", "links", "disclaimer", "liability", "indemnity", "law", "changes", "general", "contact"];

for (const [path, ids, h1] of [["/privacy", PRIVACY_IDS, "Privacy Policy"], ["/terms", TERMS_IDS, "Terms of Service"]] as const) {
  test(`${path} has a summary, contents that resolve, and the current version`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1, name: h1 })).toBeVisible();
    await expect(page.getByRole("region", { name: "Summary" })).toBeVisible();
    await expect(page.locator("main")).toContainText(`Version ${LEGAL_VERSION}`);
    const toc = page.getByRole("navigation", { name: "Contents" });
    for (const id of ids) {
      await expect(toc.locator(`a[href="#${id}"]`), id).toHaveCount(1);
      await expect(page.locator(`section#${id}`), id).toHaveCount(1);
    }
  });
}

test("privacy policy states the facts the app depends on", async ({ page }) => {
  await page.goto("/privacy");
  const main = page.locator("main");
  for (const phrase of [
    "We do not sell your data",
    "improve its products",
    "not covered by HIPAA",
    "18 or older",
    "first 300 characters",
    "We never send your name, email address or school to Google",
  ]) {
    await expect(main).toContainText(phrase);
  }
});

test("terms name the operator, the governing law and the age limit", async ({ page }) => {
  await page.goto("/terms");
  const main = page.locator("main");
  for (const phrase of ["Jad Maazouzi", "State of North Carolina", "18 or older", "does not verify your hours", "as is"]) {
    await expect(main).toContainText(phrase);
  }
});

test("both pages carry the attorney review note in source", () => {
  for (const f of ["src/app/privacy/page.tsx", "src/app/terms/page.tsx"]) {
    expect(readFileSync(f, "utf8").split("\n")[0]).toBe(
      "// Draft generated from a code audit. Have a licensed attorney review before relying on it."
    );
  }
});

test("sign-up requires agreeing to the terms", async ({ page }) => {
  await page.goto("/auth/signup");
  const box = page.getByRole("checkbox", { name: /18 or older, and I agree/ });
  await expect(box).toBeVisible();
  await expect(box).toHaveAttribute("required", "");
  await expect(page.locator('a[href="/terms"]').first()).toBeVisible();
  await expect(page.locator('a[href="/privacy"]').first()).toBeVisible();
});

test("the acceptance page is not reachable signed out", async ({ request }) => {
  const res = await request.get("/legal/accept", { maxRedirects: 0 });
  expect(res.status()).toBe(307);
  expect(res.headers()["location"]).toContain("/auth/login");
});

test("footers link to both policies", async ({ page }) => {
  for (const path of ["/", "/about", "/data-sources"]) {
    await page.goto(path);
    const footer = page.getByRole("navigation", { name: "Footer" });
    await expect(footer.getByRole("link", { name: "Privacy" }), path).toHaveAttribute("href", "/privacy");
    await expect(footer.getByRole("link", { name: "Terms" }), path).toHaveAttribute("href", "/terms");
  }
});
