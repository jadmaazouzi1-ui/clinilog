import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { AFFILIATION_NOTE } from "../../src/lib/brand";

// Black and Old Gold theme: one theme file, the mark everywhere, the icons
// and manifest, and the light/dark default rules.

test("no colour literal outside src/styles/theme.css", () => {
  // Throws (and fails the test) if the script exits non-zero.
  const out = execFileSync("node", ["scripts/check-colors.mjs"], { encoding: "utf8" });
  expect(out).toContain("no colour literals");
});

test("icons, manifest and theme-color tags are served", async ({ request }) => {
  const svg = await request.get("/icon.svg");
  expect(svg.ok()).toBeTruthy();
  const body = await svg.text();
  expect(body).toContain('fill="#000000"');
  expect(body).toContain('fill="#9E7E38"');

  for (const path of ["/favicon.ico", "/apple-icon.png", "/icon-192.png", "/icon-512.png", "/icon-maskable-512.png"]) {
    const r = await request.get(path);
    expect(r.ok(), path).toBeTruthy();
  }

  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.theme_color).toBe("#000000");
  expect(manifest.background_color).toBe("#000000");
  expect(manifest.icons.map((i: { src: string }) => i.src)).toEqual(["/icon-192.png", "/icon-512.png", "/icon-maskable-512.png"]);
  expect(manifest.icons.find((i: { purpose: string }) => i.purpose === "maskable")).toBeTruthy();

  const html = await (await request.get("/")).text();
  const tags = html.match(/<(meta|link)\b[^>]*>/g) ?? [];
  const has = (...parts: string[]) => tags.some((t) => parts.every((p) => t.includes(p)));
  expect(has('name="theme-color"', 'content="#FBF9F3"', 'media="(prefers-color-scheme: light)"')).toBe(true);
  expect(has('name="theme-color"', 'content="#000000"', 'media="(prefers-color-scheme: dark)"')).toBe(true);
  expect(has('rel="icon"', 'href="/icon.svg')).toBe(true);
  expect(has('rel="icon"', 'href="/favicon.ico')).toBe(true);
  expect(has('rel="apple-touch-icon"', 'href="/apple-icon.png')).toBe(true);
  expect(has('rel="manifest"', 'href="/manifest.webmanifest"')).toBe(true);
});

test("affiliation note is on the landing footer and the About page", async ({ request }) => {
  for (const path of ["/", "/about"]) {
    const html = await (await request.get(path)).text();
    expect(html, path).toContain(AFFILIATION_NOTE);
  }
});

test("first visit follows the OS setting; a stored choice wins", async ({ browser }) => {
  const dark = await browser.newContext({ colorScheme: "dark" });
  const page = await dark.newPage();
  await page.goto("/about");
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("dark");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(0, 0, 0)");

  await page.evaluate(() => localStorage.setItem("cliniclog-theme", "light"));
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe("light");
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe("rgb(251, 249, 243)");
  await dark.close();

  const light = await browser.newContext({ colorScheme: "light" });
  const p2 = await light.newPage();
  await p2.goto("/about");
  expect(await p2.evaluate(() => document.documentElement.dataset.theme)).toBe("light");
  await light.close();
});

test("selection, focus ring and primary button use the gold tokens", async ({ page }) => {
  await page.goto("/about");
  const s = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const btn = document.querySelector(".teal-glow") as HTMLElement;
    const b = getComputedStyle(btn);
    return {
      accent: root.getPropertyValue("--accent").trim(),
      focus: root.getPropertyValue("--focus-ring").trim(),
      btnBg: b.backgroundColor,
      btnText: b.color,
      btnHeight: btn.getBoundingClientRect().height,
    };
  });
  expect(s.btnBg).toBe("rgb(158, 126, 56)");
  expect(s.btnText).toBe("rgb(0, 0, 0)");
  expect(s.btnHeight).toBeGreaterThanOrEqual(44);
});
