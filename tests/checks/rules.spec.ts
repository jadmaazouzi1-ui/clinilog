import { test, expect } from "@playwright/test";
import { computeFindings, visibleFindings, breakDaysBetween, isDismissed, FINDING_KEY, type Finding } from "../../src/lib/checks";
import { NOW, AVA, BEN, CARA, entry } from "./fixtures";

const run = (u: { entries: Parameters<typeof computeFindings>[0]["entries"]; graduationYear: number | null; targetDate: string | null; breaks: { start_date: string; end_date: string }[] }, now = NOW) =>
  computeFindings({ ...u, now });
const types = (f: Finding[]) => f.map((x) => x.type);

test.describe("rules: fixture users", () => {
  test("Ava: zero shadowing, concentration note, stale ongoing, missing descriptions, no leadership", () => {
    const f = run(AVA);
    expect(types(f)).toContain("zero_category");
    expect(f.find((x) => x.type === "zero_category")!.message).toBe(
      "You have no shadowing hours logged and 6 months until your target application date of May 1, 2027 (40 hours is a common benchmark, not a requirement)."
    );
    expect(f.find((x) => x.type === "org_concentration")!.message).toMatch(/^80 of your 90 clinical hours \(89%\) are at Atrium Health/);
    expect(f.find((x) => x.type === "stale_ongoing")!.message).toContain('"Lab assistant" was last updated');
    expect(f.find((x) => x.type === "missing_descriptions")!.message).toBe(
      "3 of your 6 entries (50%) have no description, and AMCAS asks for one for every activity."
    );
    expect(types(f)).toContain("no_leadership");
  });

  test("Ben: a first-year with one entry gets nothing urgent", () => {
    const f = run(BEN);
    expect(f.filter((x) => x.severity === "important")).toEqual([]);
    expect(types(f)).not.toContain("zero_category");
    expect(types(f)).not.toContain("missing_descriptions");
  });

  test("Cara: bad dates, impossible hours, clinical gap that only crosses 90 with the break removed", () => {
    const f = run(CARA);
    expect(f[0].type).toBe("date_problem");
    expect(f[0].message).toBe('The entry "Research poster" ends on Apr 1, 2026, before it starts on May 1, 2026.');
    expect(f.find((x) => x.type === "implausible_hours")!.message).toContain('"Cardiology shadowing" has 30 hours across 1 day');
    const gap = f.find((x) => x.type === "clinical_gap")!;
    expect(gap.message).toBe("Your most recent clinical activity was Jun 1, 2026, which is 91 days ago once your saved breaks are left out.");
    expect(types(f)).not.toContain("no_leadership"); // has an Other entry and a president role
  });
});

test.describe("rules: each rule and edge cases", () => {
  const base = { graduationYear: 2028, targetDate: "2027-05-01", breaks: [] as { start_date: string; end_date: string }[] };

  test("no entries: no findings at all", () => {
    expect(run({ ...base, entries: [] })).toEqual([]);
  });

  test("one entry: only the rules that make sense fire", () => {
    const f = run({ ...base, entries: [entry({ type: "clinical_work", hours: 10, start_date: "2026-10-01" })] });
    expect(types(f).filter((t) => t === "zero_category")).toHaveLength(3);
    expect(types(f)).not.toContain("org_concentration");
  });

  test("all entries in one category: three zero findings, one concentration note at most", () => {
    const entries = [1, 2, 3].map((i) => entry({ type: "volunteer", hours: 20, start_date: `2026-0${i}-01`, organization: "Same Org" }));
    const f = run({ ...base, entries });
    expect(f.filter((x) => x.type === "zero_category").map((x) => x.key).sort()).toEqual(["zero:clinical_work", "zero:research", "zero:shadowing"]);
    expect(f.filter((x) => x.type === "org_concentration")).toHaveLength(1);
  });

  test("zero category only fires within 12 months of the target", () => {
    const entries = [entry({ type: "clinical_work", hours: 10, start_date: "2026-10-01" })];
    expect(types(run({ ...base, targetDate: "2028-05-01", entries }))).not.toContain("zero_category");
  });

  test("below pace scales with time remaining and never repeats a zero finding", () => {
    const entries = [entry({ type: "clinical_work", hours: 10, start_date: "2026-01-01", end_date: "2026-10-01" }), entry({ type: "shadowing", hours: 40, start_date: "2026-01-01", end_date: "2026-10-01" }), entry({ type: "research", hours: 20, start_date: "2026-01-01", end_date: "2026-10-01" }), entry({ type: "volunteer", hours: 40, start_date: "2026-01-01", end_date: "2026-10-01" })];
    const f = run({ ...base, entries });
    const pace = f.filter((x) => x.type === "below_pace");
    expect(pace.map((x) => x.key)).toEqual(["pace:clinical_work"]);
    expect(pace[0].message).toMatch(/^You have 10 clinical hours, and a steady pace toward the 100-hour common benchmark by May 1, 2027 would put you near \d+ by now\.$/);
  });

  test("clinical gap ignores days inside saved breaks, including overlapping breaks", () => {
    const entries = [entry({ type: "clinical_work", hours: 50, start_date: "2026-05-01", end_date: "2026-07-01" })];
    expect(types(run({ ...base, entries }))).toContain("clinical_gap"); // 123 days
    const breaks = [{ start_date: "2026-07-10", end_date: "2026-08-20" }, { start_date: "2026-08-01", end_date: "2026-08-31" }];
    expect(breakDaysBetween(breaks, Date.UTC(2026, 6, 2), Date.UTC(2026, 10, 2))).toBe(53);
    expect(types(run({ ...base, breaks, entries }))).not.toContain("clinical_gap"); // 123 - 53 = 70
  });

  test("concentration is a note and needs more than 60 percent", () => {
    const even = [entry({ type: "research", hours: 30, start_date: "2026-01-01", organization: "A" }), entry({ type: "research", hours: 30, start_date: "2026-02-01", organization: "B" })];
    expect(types(run({ ...base, entries: even }))).not.toContain("org_concentration");
    const skew = [entry({ type: "research", hours: 50, start_date: "2026-01-01", organization: "A" }), entry({ type: "research", hours: 10, start_date: "2026-02-01", organization: "B" })];
    expect(run({ ...base, entries: skew }).find((x) => x.type === "org_concentration")!.severity).toBe("note");
  });

  test("ongoing entry stale after 120 days; recent ones are fine", () => {
    const fresh = entry({ type: "volunteer", hours: 10, start_date: "2026-01-01", end_date: null, updated_at: "2026-10-01" });
    const old = entry({ type: "volunteer", hours: 10, start_date: "2026-01-01", end_date: null, updated_at: "2026-06-01" });
    expect(types(run({ ...base, entries: [fresh] }))).not.toContain("stale_ongoing");
    expect(run({ ...base, entries: [old] }).find((x) => x.type === "stale_ongoing")!.message).toContain("153 days ago");
  });

  test("implausible hours: single day over 24, or more hours than days allow; ongoing ranges are fine", () => {
    expect(types(run({ ...base, entries: [entry({ type: "volunteer", hours: 25, start_date: "2026-10-01" })] }))).toContain("implausible_hours");
    expect(types(run({ ...base, entries: [entry({ type: "volunteer", hours: 100, start_date: "2026-10-01", end_date: "2026-10-03" })] }))).toContain("implausible_hours");
    expect(types(run({ ...base, entries: [entry({ type: "volunteer", hours: 100, start_date: "2026-01-01", end_date: null, updated_at: "2026-10-30" })] }))).not.toContain("implausible_hours");
  });

  test("future dates are flagged", () => {
    const f = run({ ...base, entries: [entry({ type: "volunteer", hours: 5, start_date: "2026-12-01" })] });
    expect(f[0].type).toBe("date_problem");
    expect(f[0].message).toBe('The entry "Entry ' + f[0].message.match(/Entry (\d+)/)![1] + '" has a date in the future (Dec 1, 2026).');
  });

  test("a bad-date entry is not also reported as implausible hours", () => {
    const f = run({ ...base, entries: [entry({ type: "volunteer", hours: 500, start_date: "2026-05-01", end_date: "2026-04-30" })] });
    expect(types(f)).toContain("date_problem");
    expect(types(f)).not.toContain("implausible_hours");
  });

  test("several stale ongoing entries merge into one finding", () => {
    const entries = [1, 2, 3, 4].map((i) => entry({ title: `Ongoing ${i}`, type: "volunteer", hours: 5, start_date: "2026-01-01", end_date: null, updated_at: "2026-03-01" }));
    const stale = run({ ...base, entries }).filter((x) => x.type === "stale_ongoing");
    expect(stale).toHaveLength(1);
    expect(stale[0].message).toMatch(/^4 ongoing entries have not been updated in over 120 days \("Ongoing 1", "Ongoing 2" and "Ongoing 3" and others\)/);
  });

  test("ordering: important, then heads up, then note", () => {
    const sev = run(AVA).map((x) => x.severity);
    const rank = { important: 0, heads_up: 1, note: 2 } as const;
    expect(sev).toEqual([...sev].sort((a, b) => rank[a] - rank[b]));
  });
});

test.describe("copy and keys", () => {
  test("every message is one plain sentence with no dashes, exclamation marks or judgments", () => {
    for (const u of [AVA, BEN, CARA]) {
      for (const f of run(u)) {
        expect(f.message.split(/(?<=[.?])\s+(?=[A-Z"])/).length, f.message).toBe(1);
        expect(f.message).not.toMatch(/[–—!]/);
        expect(f.message).not.toMatch(/\b(behind|failing|bad|must|should have|guarantee|admit|accept)\b/i);
        expect(FINDING_KEY.test(f.key), f.key).toBe(true);
      }
    }
  });

  test("benchmarks are always labelled as common benchmarks", () => {
    for (const f of run(AVA).filter((x) => /benchmark/.test(x.message))) expect(f.message).toContain("common benchmark");
  });
});

test.describe("dismissals and the 3-finding limit", () => {
  test("the panel never shows more than 3", () => {
    const all = run(AVA);
    expect(all.length).toBeGreaterThan(3);
    expect(visibleFindings(all, [], NOW)).toHaveLength(3);
  });

  test("30-day dismissals expire; permanent ones do not", () => {
    const key = run(AVA)[0].key;
    const in30 = new Date(NOW.getTime() + 30 * 86_400_000).toISOString();
    const d = [{ finding_key: key, dismissed_until: in30, permanent: false }];
    expect(isDismissed(key, d, NOW)).toBe(true);
    expect(isDismissed(key, d, new Date(NOW.getTime() + 31 * 86_400_000))).toBe(false);
    expect(isDismissed(key, [{ finding_key: key, dismissed_until: null, permanent: true }], new Date("2030-01-01"))).toBe(true);
    expect(visibleFindings(run(AVA), d, NOW).map((x) => x.key)).not.toContain(key);
  });
});
