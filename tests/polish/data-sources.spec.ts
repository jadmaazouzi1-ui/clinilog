import { test, expect } from "@playwright/test";
import { SCHOOLS } from "../../src/lib/schools";
import { SPECIALTIES } from "../../src/lib/specialties";
import { DATA_SOURCES } from "../../src/lib/data-sources";

// Every school or specialty figure the app shows must carry its source.

test("every shown school figure has a source page, a class year from 2022 on, and a sane value", () => {
  for (const s of SCHOOLS) {
    if (s.avgGpa === null && s.avgMcat === null) continue;
    expect(s.sourceUrl, s.name).toMatch(/^https:\/\//);
    expect(s.enteringYear, s.name).not.toBeNull();
    expect(s.enteringYear!, s.name).toBeGreaterThanOrEqual(2022);
    expect(s.checked, s.name).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    if (s.avgGpa !== null) expect(s.avgGpa >= 2.5 && s.avgGpa <= 4, `${s.name} GPA ${s.avgGpa}`).toBe(true);
    if (s.avgMcat !== null) expect(s.avgMcat >= 490 && s.avgMcat <= 528, `${s.name} MCAT ${s.avgMcat}`).toBe(true);
  }
});

test("school names are unique and decoded", () => {
  const names = SCHOOLS.map((s) => s.name);
  expect(new Set(names).size).toBe(names.length);
  for (const n of names) expect(n, n).not.toMatch(/\\u[0-9a-f]{4}/i);
});

test("NRMP counts are whole and consistent", () => {
  for (const s of SPECIALTIES) {
    if (!s.md || !s.do) {
      expect(s.nrmpName, s.name).toBeNull();
      continue;
    }
    for (const r of [s.md, s.do]) {
      expect(Number.isInteger(r.matched) && Number.isInteger(r.total), s.name).toBe(true);
      expect(r.matched <= r.total, s.name).toBe(true);
    }
  }
  // Table 12A totals for U.S. MD seniors who ranked only one specialty.
  const dermatology = SPECIALTIES.find((s) => s.id === "dermatology")!;
  expect(dermatology.md).toEqual({ matched: 75, total: 97 });
});

test("the data sources page is public and lists every source", async ({ request, page }) => {
  const res = await request.get("/data-sources", { maxRedirects: 0 });
  expect(res.status()).toBe(200);
  await page.goto("/data-sources");
  await expect(page.getByRole("heading", { level: 1, name: "About this data" })).toBeVisible();
  for (const d of DATA_SOURCES) await expect(page.getByRole("cell", { name: d.name })).toBeVisible();
  for (const phrase of ["not a prediction", "change every cycle", "not affiliated with or endorsed by", "AI model"]) {
    await expect(page.locator("main")).toContainText(phrase);
  }
});

test("footers link to the data sources page", async ({ page }) => {
  for (const path of ["/", "/about", "/privacy"]) {
    await page.goto(path);
    const link = page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "Data sources" });
    await expect(link, path).toHaveAttribute("href", "/data-sources");
  }
});
