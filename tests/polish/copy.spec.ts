import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { cleanAiText, cleanAiDeep } from "../../src/lib/aiText";

// Fails if machine-sounding copy creeps back in.

const DASH = /[–—]/;
const BANNED = /\b(unlock\w*|elevate[sd]?|empower\w*|seamless\w*|streamlin\w+|supercharg\w+|leverag\w+|robust|cutting-edge|revolutioni\w+|game-changer|journey|delve\w*|tapestry|all-in-one|lorem ipsum|your text here)\b/i;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
const SOURCES = walk("src").filter((p) => /\.(tsx?|css)$/.test(p));
// These files hold the banned-word list itself, as instructions to the model.
const RULE_FILES = new Set(["src/lib/aiText.ts"]);
const isPrompt = (p: string) => p.startsWith("src/app/api/") && /route\.ts$/.test(p);

test("no em or en dashes anywhere in the source", () => {
  for (const p of SOURCES) {
    readFileSync(p, "utf8").split("\n").forEach((line, i) => {
      expect(DASH.test(line), `${p}:${i + 1} ${line.trim().slice(0, 80)}`).toBe(false);
    });
  }
});

test("no banned stock phrases or lorem in user-facing source", () => {
  for (const p of SOURCES) {
    if (RULE_FILES.has(p) || isPrompt(p)) continue;
    readFileSync(p, "utf8").split("\n").forEach((line, i) => {
      const t = line.trim();
      if (t.startsWith("//") || t.startsWith("*") || t.startsWith("/*")) return;
      expect(BANNED.test(line), `${p}:${i + 1} ${t.slice(0, 80)}`).toBe(false);
    });
  }
});

test("the weekly email template is clean", () => {
  const src = readFileSync("src/app/api/cron/weekly-digest/route.ts", "utf8");
  expect(DASH.test(src)).toBe(false);
  expect(BANNED.test(src)).toBe(false);
});

test("every page has a title and description under the length limits", () => {
  const pages = walk("src/app").filter((p) => p.endsWith("page.tsx"));
  for (const p of pages) {
    const own = readFileSync(p, "utf8");
    const layout = join(p, "..", "layout.tsx");
    const src = /export const metadata|generateMetadata/.test(own) ? own : existsSync(layout) ? readFileSync(layout, "utf8") : "";
    expect(/export const metadata|generateMetadata/.test(src), `${p} has no metadata`).toBe(true);
    const title = src.match(/title:\s*"([^"]+)"/)?.[1];
    expect(title, `${p} title`).toBeTruthy();
    expect(title!.length, `${p} title length`).toBeLessThan(60);
    const desc = src.match(/description:\s*"([^"]+)"/)?.[1];
    if (desc) expect(desc.length, `${p} description length`).toBeLessThan(155);
  }
});

test("public pages render a title, a description and clean copy", async ({ request }) => {
  for (const path of ["/", "/about", "/privacy", "/terms", "/changelog", "/auth/login", "/auth/signup"]) {
    const html = await (await request.get(path)).text();
    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
    const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
    expect(title.length, `${path} title`).toBeGreaterThan(0);
    expect(title.length, `${path} title`).toBeLessThan(60);
    expect(desc.length, `${path} description`).toBeGreaterThan(0);
    expect(desc.length, `${path} description`).toBeLessThan(155);
    const text = html.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ");
    expect(DASH.test(text), `${path} dash`).toBe(false);
    expect(BANNED.test(text), `${path} banned phrase: ${text.match(BANNED)?.[0]}`).toBe(false);
  }
});

test("sitemap and robots exclude signed-in routes and /admin", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/about");
  for (const p of ["/dashboard", "/admin", "/profile", "/api/"]) expect(sitemap, p).not.toContain(p);
  const robots = await (await request.get("/robots.txt")).text();
  for (const p of ["/admin", "/dashboard", "/api/"]) expect(robots, p).toContain(`Disallow: ${p}`);
});

test("AI responses are cleaned before they reach the user", () => {
  expect(cleanAiText("Certainly! Great question. You have 40 hours—a solid base.")).toBe("You have 40 hours, a solid base.");
  expect(cleanAiText("Aim for 100–150 hours.")).toBe("Aim for 100-150 hours.");
  expect(cleanAiText("Log research next.\n\nIn summary, research matters.")).toBe("Log research next.");
  expect(cleanAiText("Only one paragraph. Overall fine.")).toBe("Only one paragraph. Overall fine.");
  expect(cleanAiDeep({ archetype_id: "scientist", why: ["Sure! It fits — clearly."] })).toEqual({ archetype_id: "scientist", why: ["It fits, clearly."] });
});
