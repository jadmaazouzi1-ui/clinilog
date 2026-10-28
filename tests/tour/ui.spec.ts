import { test, expect, type Page } from "@playwright/test";
import { HAVE_USERS, NO_USERS_MSG, USER_A, clientAs, uiLogin } from "../security/env";
import { TOUR_MODULES } from "../../src/lib/tour/modules";

// Signed-in checks against the real UI. Needs the throwaway accounts in
// .env.test.local (see .env.test.local.example); skipped without them.
test.describe.configure({ mode: "serial" });
test.skip(!HAVE_USERS, NO_USERS_MSG);

function overlaps(a: { x: number; y: number; width: number; height: number }, b: typeof a) {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

async function dataSnapshot() {
  const { db } = await clientAs(USER_A);
  const [exp, prof, refs] = await Promise.all([
    db.from("experiences").select("id, hours, title, updated_at").order("id"),
    db.from("profiles").select("archetype_id, archetype_generated_at, graduation_year, updated_at").single(),
    db.from("referrals").select("id", { count: "exact", head: true }),
  ]);
  return JSON.stringify({ exp: exp.data, prof: prof.data, refs: refs.count });
}

async function openHelp(page: Page) {
  const visible = page.locator("[data-tour='help-button']:visible, [data-tour='help-sidebar']:visible").first();
  await visible.click();
  await expect(page.getByRole("dialog", { name: "Help Center" })).toBeVisible();
}

test("Help never overlaps the AI Advisor or the tab bar, at 390px and desktop", async ({ page }) => {
  await uiLogin(page, USER_A);
  for (const size of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(size);
    await page.goto("/dashboard");
    const advisor = await page.getByRole("button", { name: "Open AI advisor" }).boundingBox();
    const tabbar = await page.locator(".app-bottomnav").boundingBox().catch(() => null);
    for (const sel of ["[data-tour='help-button']", "[data-tour='help-sidebar']"]) {
      const el = page.locator(sel);
      if (!(await el.isVisible())) continue;
      const box = (await el.boundingBox())!;
      if (advisor) expect(overlaps(box, advisor), `${sel} vs advisor at ${size.width}`).toBe(false);
      if (tabbar && size.width < 768) expect(overlaps(box, tabbar), `${sel} vs tab bar`).toBe(false);
    }
    // No horizontal scroll.
    const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollW).toBeLessThanOrEqual(size.width);
  }
  // Mobile: Help sits at the top of Tools and in Profile.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Tools" }).click();
  await expect(page.locator("[data-tour='help-tools']")).toBeVisible();
  await page.goto("/profile");
  await expect(page.locator("[data-tour='help-profile']")).toBeVisible();
});

test("replaying from Help works for every module, and Skip tour changes no data", async ({ page }) => {
  await uiLogin(page, USER_A);
  const before = await dataSnapshot();
  for (const m of TOUR_MODULES) {
    await page.goto("/dashboard");
    await openHelp(page);
    await page.getByRole("dialog", { name: "Help Center" }).getByRole("button", { name: new RegExp(`^${m.title}`) }).click();
    const card = page.locator(".tour-card");
    // A module whose every target is absent for this account ends silently.
    const shown = await card.waitFor({ timeout: 8000 }).then(() => true).catch(() => false);
    if (shown) {
      await expect(card).toContainText(m.title.toUpperCase());
      await card.getByRole("button", { name: "Skip tour" }).click();
      await expect(card).toHaveCount(0);
    }
  }
  expect(await dataSnapshot()).toBe(before);
});

test("keyboard alone can finish a tour, and Escape closes one", async ({ page }) => {
  await uiLogin(page, USER_A);
  await page.goto("/profile");
  await page.locator("[data-tour='help-button']:visible, [data-tour='help-profile']:visible").first().focus();
  await page.keyboard.press("Enter");
  const help = page.getByRole("dialog", { name: "Help Center" });
  await expect(help).toBeVisible();
  await help.getByRole("button", { name: /^Profile and settings/ }).focus();
  await page.keyboard.press("Enter");
  const card = page.locator(".tour-card");
  await expect(card).toBeVisible();
  for (let i = 0; i < 10 && (await card.count()) > 0; i++) {
    // Focus starts on Next/Done; Enter advances.
    await expect(card.getByRole("button", { name: /^(Next|Done)$/ })).toBeFocused();
    await page.keyboard.press("Enter");
  }
  await expect(card).toHaveCount(0);

  // Tab stays inside the card.
  await page.locator("[data-tour='help-button']:visible, [data-tour='help-profile']:visible").first().click();
  await help.getByRole("button", { name: /^Profile and settings/ }).click();
  await expect(card).toBeVisible();
  for (let i = 0; i < 8; i++) await page.keyboard.press("Tab");
  expect(await card.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(card).toHaveCount(0);
});

test("progress persists after a reload and on a second device", async ({ page, browser }) => {
  await uiLogin(page, USER_A);
  await page.goto("/profile");
  await page.locator("[data-tour='help-button']:visible, [data-tour='help-profile']:visible").first().click();
  await page.getByRole("dialog", { name: "Help Center" }).getByRole("button", { name: /^Profile and settings/ }).click();
  const card = page.locator(".tour-card");
  await card.getByRole("button", { name: "Next" }).click();
  await card.getByRole("button", { name: "Done" }).or(card.getByRole("button", { name: "Next" })).first().click();
  await card.getByRole("button", { name: "Skip tour" }).click().catch(() => {});

  const status = async (p: Page) => {
    const r = await p.request.get("/api/tour");
    const data = await r.json();
    return data.rows.find((x: { module_id: string }) => x.module_id === "profile");
  };
  await page.reload();
  const afterReload = await status(page);
  expect(afterReload).toBeTruthy();

  const other = await browser.newContext();
  const page2 = await other.newPage();
  await uiLogin(page2, USER_A);
  expect(await status(page2)).toEqual(afterReload);
  await other.close();
});

test("an existing account with entries gets no auto-start", async ({ page }) => {
  await uiLogin(page, USER_A);
  const r = await (await page.request.get("/api/tour")).json();
  test.skip(r.ctx.isNew, "User A was created after launch; auto-start rules are covered by logic.spec.ts");
  for (const p of ["/dashboard", "/import", "/profile", "/schools", "/applications"]) {
    await page.goto(p);
    await page.waitForTimeout(1200);
    await expect(page.locator(".tour-card"), p).toHaveCount(0);
  }
});
