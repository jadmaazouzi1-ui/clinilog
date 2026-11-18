import { test, expect } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Every tab, shared link and installed icon reads exactly "ClinicLog MD".

const NAME = "ClinicLog MD";

// Public pages render as-is. Signed-in pages redirect an anonymous visitor to
// /auth/login, so the source check below covers them: they inherit the root
// title because no file but the root layout sets one.
const PUBLIC = ["/", "/about", "/privacy", "/terms", "/stories", "/specialties", "/resources", "/changelog",
  "/badge", "/auth/login", "/auth/signup", "/auth/reset-password", "/auth/verify-email", "/no-such-page"];
const SIGNED_IN = ["/dashboard", "/dashboard/new", "/schools", "/profile", "/applications", "/archetype"];

const meta = (html: string, attr: string, key: string) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1];

for (const path of [...PUBLIC, ...SIGNED_IN]) {
  test(`tab title on ${path}`, async ({ page }) => {
    await page.goto(path);
    // Wait past hydration so a client-side title change would show up.
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    expect(await page.title()).toBe(NAME);
    const html = await page.content();
    expect((html.match(/<title>/g) ?? []).length).toBe(1);
    expect(meta(html, "property", "og:title")).toBe(NAME);
    expect(meta(html, "name", "twitter:title")).toBe(NAME);
  });
}

test("no page sets its own title and nothing writes document.title", () => {
  const grep = (args: string[]) => {
    try {
      return execFileSync("grep", args, { encoding: "utf8" }).trim();
    } catch {
      return ""; // grep exits 1 when nothing matches
    }
  };
  expect(grep(["-rnE", "\\| ClinicLog|ClinicLog MD \\|", "src", "tests/polish/landing.spec.ts"])).toBe("");
  expect(grep(["-rn", "document.title", "src"])).toBe("");
  expect(grep(["-rnE", "template:\\s*[\"'`%]", "src/app"])).toBe("");
  // Only the root layout's metadata may carry a title.
  const files = grep(["-rlE", "export const metadata", "src/app"]).split("\n").filter(Boolean);
  const withTitle = files.filter((f) => {
    const src = readFileSync(f, "utf8");
    const block = src.slice(src.indexOf("export const metadata"));
    return /^\s*title:/m.test(block.slice(0, block.search(/^\};?$/m)));
  });
  expect(withTitle).toEqual(["src/app/layout.tsx"]);
  expect(grep(["-rln", "generateMetadata", "src/app"])).toBe("");
});

test("manifest name and short name", async ({ request }) => {
  const m = await (await request.get("/manifest.webmanifest")).json();
  expect(m.name).toBe(NAME);
  expect(m.short_name).toBe(NAME);
});

test("unsubscribe page title", async ({ request }) => {
  const html = await (await request.get("/api/unsubscribe?u=00000000-0000-0000-0000-000000000000&t=forged")).text();
  expect(html).toContain(`<title>${NAME}</title>`);
});
