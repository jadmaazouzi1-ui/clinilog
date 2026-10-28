import { test, expect } from "@playwright/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

// The tour must never change hours, totals, archetype, streak, referrals or
// exports. Checked on the source: tour code may only talk to /api/tour and
// /api/feedback, and those routes may only write their own tables.

const read = (p: string) => readFileSync(p, "utf8");
const tourDir = "src/components/tour";
const tourFiles = readdirSync(tourDir).map((f) => join(tourDir, f));

test("tour components only call the tour and feedback endpoints", () => {
  for (const f of tourFiles) {
    const src = read(f);
    for (const m of src.matchAll(/fetch\(\s*["'`]([^"'`]+)["'`]/g)) {
      expect(["/api/tour", "/api/feedback"], `${f} calls ${m[1]}`).toContain(m[1]);
    }
    expect(src, f).not.toMatch(/supabase|\.from\(|\.rpc\(|server actions?|"use server"/i);
  }
});

test("the tour API writes tour_progress and nothing else", () => {
  const src = read("src/app/api/tour/route.ts");
  const tables = [...src.matchAll(/\.from\("([a-z_]+)"\)/g)].map((m) => m[1]);
  const writes = [...src.matchAll(/\.from\("([a-z_]+)"\)\s*\.(insert|upsert|update|delete)/g)].map((m) => m[1]);
  expect(new Set(writes)).toEqual(new Set(["tour_progress"]));
  // Reads of other tables are counts and flags only.
  expect(tables.filter((t) => t !== "tour_progress").sort()).toEqual(["experiences", "profiles", "school_applications"]);
  expect(src).not.toMatch(/\.rpc\(/);
});

test("the feedback API writes only feedback, validates and caps input", () => {
  const src = read("src/app/api/feedback/route.ts");
  const writes = [...src.matchAll(/\.from\("([a-z_]+)"\)\s*\.(insert|upsert|update|delete)/g)].map((m) => m[1]);
  expect(writes).toEqual(["feedback"]);
  expect(src).toContain("max(1000)");
  expect(src).toContain("sanitizeText");
  expect(src).toContain('checkUserRateLimit(supabase, "feedback")');
  expect(src).toContain("isSameOrigin");
});

test("tooltips render static copy only", () => {
  const src = read(join(tourDir, "Spotlight.tsx"));
  expect(src).not.toContain("dangerouslySetInnerHTML");
  // Every text node in the card comes from the static modules file.
  expect(src).toMatch(/step\.title/);
  expect(src).toMatch(/step\.body/);
});
