// Application check: deterministic rules over a user's own entries. No AI.
// The dashboard panel and the reminder email both read from here so they
// can never disagree. Pure functions only: no I/O, no clock unless passed.

import type { ExperienceType } from "../types";
import { BENCHMARKS, BENCHMARK_LABEL } from "../benchmarks";

export type Severity = "important" | "heads_up" | "note";

export type RuleType =
  | "zero_category"
  | "below_pace"
  | "clinical_gap"
  | "org_concentration"
  | "stale_ongoing"
  | "implausible_hours"
  | "missing_descriptions"
  | "no_leadership"
  | "date_problem";

export interface Finding {
  id: string;
  type: RuleType;
  severity: Severity;
  /** One plain sentence with real numbers. */
  message: string;
  href?: string;
  /** Stable key used for dismissal. Lowercase, [a-z0-9:_-]. */
  key: string;
  /** Overlap with Experience Insights; the panel owns this topic when shown. */
  topic?: string;
}

export interface CheckEntry {
  id: string;
  title: string;
  organization: string;
  type: ExperienceType;
  start_date: string;
  end_date: string | null;
  hours: number;
  hasDescription: boolean;
  updated_at: string;
}

export interface CheckBreak {
  start_date: string;
  end_date: string;
}

export interface ChecksInput {
  entries: CheckEntry[];
  graduationYear: number | null;
  /** The user's AMCAS target date if they set one. */
  targetDate: string | null;
  breaks: CheckBreak[];
  now: Date;
}

const DAY = 86_400_000;
const SEVERITY_ORDER: Record<Severity, number> = { important: 0, heads_up: 1, note: 2 };
const RULE_ORDER: RuleType[] = [
  "date_problem", "implausible_hours", "zero_category", "clinical_gap", "below_pace",
  "missing_descriptions", "stale_ongoing", "org_concentration", "no_leadership",
];
const CORE: Exclude<ExperienceType, "other">[] = ["clinical_work", "shadowing", "research", "volunteer"];
const LEADERSHIP = /\b(lead|leader|leadership|president|vice president|founder|co-founder|captain|chair|director|coordinator|officer|manager|organizer)\b/i;

/* ── Dates ──────────────────────────────────────────────────────────────── */

/** "2026-05-01" as a UTC midnight timestamp, ignoring any time part. */
function day(iso: string): number {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
function today(now: Date): number {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function formatDay(ms: number): string {
  const d = new Date(ms);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}
function fmtHours(n: number): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}
function plural(n: number, one: string, many = one + "s"): string {
  return `${n} ${n === 1 ? one : many}`;
}
function quoteList(items: string[]): string {
  const q = items.map((t) => `"${t}"`);
  return q.length <= 2 ? q.join(" and ") : `${q.slice(0, -1).join(", ")} and ${q[q.length - 1]}`;
}
export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "x";
}

/** Days in [from, to) that fall inside any saved break. */
export function breakDaysBetween(breaks: CheckBreak[], from: number, to: number): number {
  if (to <= from) return 0;
  // Merge overlapping breaks first so a day is never counted twice.
  const spans = breaks
    .map((b) => [day(b.start_date), day(b.end_date) + DAY] as [number, number])
    .filter(([s, e]) => e > s)
    .sort((a, b) => a[0] - b[0]);
  let total = 0;
  let curS = -Infinity;
  let curE = -Infinity;
  const flush = () => {
    const s = Math.max(curS, from);
    const e = Math.min(curE, to);
    if (e > s) total += e - s;
  };
  for (const [s, e] of spans) {
    if (s > curE) {
      flush();
      curS = s;
      curE = e;
    } else curE = Math.max(curE, e);
  }
  flush();
  return Math.round(total / DAY);
}

export function inBreak(breaks: CheckBreak[], now: Date): boolean {
  const t = today(now);
  return breaks.some((b) => day(b.start_date) <= t && t <= day(b.end_date));
}

/** The application target: the user's AMCAS date, else May 1 of the year before graduation. */
export function targetFor(graduationYear: number | null, targetDate: string | null): number | null {
  if (targetDate) return day(targetDate);
  if (graduationYear) return Date.UTC(graduationYear - 1, 4, 1);
  return null;
}

/* ── Rules ──────────────────────────────────────────────────────────────── */

export function computeFindings(input: ChecksInput): Finding[] {
  const { entries, breaks } = input;
  const now = today(input.now);
  const target = targetFor(input.graduationYear, input.targetDate);
  const out: Finding[] = [];
  if (entries.length === 0) return out;

  const monthsLeft = target === null ? null : Math.max(0, Math.round((target - now) / (30.44 * DAY)));
  const within12 = monthsLeft !== null && monthsLeft <= 12;
  const targetText = target === null ? "" : formatDay(target);

  const hoursBy = new Map<ExperienceType, number>();
  for (const e of entries) hoursBy.set(e.type, (hoursBy.get(e.type) ?? 0) + e.hours);

  // 9. Impossible dates. One finding, however many entries.
  const badDates = entries.filter((e) => {
    const s = day(e.start_date);
    const end = e.end_date ? day(e.end_date) : null;
    return (end !== null && end < s) || s > now || (end !== null && end > now);
  });
  if (badDates.length > 0) {
    const first = badDates[0];
    const s = day(first.start_date);
    const end = first.end_date ? day(first.end_date) : null;
    const message =
      badDates.length === 1
        ? end !== null && end < s
          ? `The entry "${first.title}" ends on ${formatDay(end)}, before it starts on ${formatDay(s)}.`
          : `The entry "${first.title}" has a date in the future (${formatDay(end !== null && end > now ? end : s)}).`
        : `${badDates.length} entries have an end date before the start date or a date in the future: ${quoteList(badDates.slice(0, 3).map((e) => e.title))}${badDates.length > 3 ? " and others" : ""}.`;
    out.push({
      id: "date_problem",
      type: "date_problem",
      severity: "important",
      message,
      href: badDates.length === 1 ? `/dashboard/${first.id}/edit` : "/dashboard#recent-experiences",
      key: `dates:${badDates.map((e) => slug(e.id)).sort().join("+").slice(0, 150)}`,
    });
  }
  const badIds = new Set(badDates.map((e) => e.id));

  // 6. Hours that do not fit the dates.
  const implausible = entries.filter((e) => {
    if (badIds.has(e.id)) return false;
    const s = day(e.start_date);
    const end = e.end_date ? day(e.end_date) : now;
    const days = Math.max(1, Math.round((end - s) / DAY) + 1);
    const singleDay = e.end_date !== null && day(e.end_date) === s;
    return (singleDay && e.hours > 24) || e.hours > days * 24;
  });
  if (implausible.length > 0) {
    const e = implausible[0];
    const s = day(e.start_date);
    const end = e.end_date ? day(e.end_date) : now;
    const days = Math.max(1, Math.round((end - s) / DAY) + 1);
    out.push({
      id: "implausible_hours",
      type: "implausible_hours",
      severity: "important",
      message:
        implausible.length === 1
          ? `The entry "${e.title}" has ${fmtHours(e.hours)} hours across ${plural(days, "day")}, which is more than the dates allow, so check the dates or hours.`
          : `${implausible.length} entries have more hours than their dates allow, including "${e.title}" with ${fmtHours(e.hours)} hours across ${plural(days, "day")}.`,
      href: implausible.length === 1 ? `/dashboard/${e.id}/edit` : "/dashboard#recent-experiences",
      key: `hours:${implausible.map((x) => slug(x.id)).sort().join("+").slice(0, 150)}`,
    });
  }

  // 1 and 2. Category totals against the benchmark, scaled to time left.
  for (const cat of CORE) {
    const hours = hoursBy.get(cat) ?? 0;
    const bench = BENCHMARKS[cat];
    const label = BENCHMARK_LABEL[cat];
    if (within12 && hours === 0) {
      out.push({
        id: `zero_category:${cat}`,
        type: "zero_category",
        severity: "important",
        message: `You have no ${label} hours logged and ${plural(monthsLeft!, "month")} until your target application date of ${targetText} (${bench} hours is a common benchmark, not a requirement).`,
        href: "/dashboard/new",
        key: `zero:${cat}`,
        topic: `hours:${cat}`,
      });
      continue;
    }
    if (target === null || input.graduationYear === null) continue;
    // A steady pace from the start of college (August, four years before
    // graduation) to the target date.
    const start = Date.UTC(input.graduationYear - 4, 7, 15);
    const frac = Math.min(1, Math.max(0, (now - start) / (target - start)));
    const expected = bench * frac;
    if (expected >= 10 && hours < expected * 0.6) {
      out.push({
        id: `below_pace:${cat}`,
        type: "below_pace",
        severity: "heads_up",
        message: `You have ${fmtHours(hours)} ${label} hours, and a steady pace toward the ${bench}-hour common benchmark by ${targetText} would put you near ${Math.round(expected)} by now.`,
        href: "/dashboard/new",
        key: `pace:${cat}`,
        topic: `hours:${cat}`,
      });
    }
  }

  // 3. No clinical activity for over 90 days, not counting saved breaks.
  const clinical = entries.filter((e) => e.type === "clinical_work" && !badIds.has(e.id));
  if (clinical.length > 0) {
    const last = Math.max(...clinical.map((e) => (e.end_date ? day(e.end_date) : Math.max(day(e.start_date), day(e.updated_at)))));
    const gap = Math.round((now - last) / DAY) - breakDaysBetween(breaks, last + DAY, now + DAY);
    if (gap > 90) {
      out.push({
        id: "clinical_gap",
        type: "clinical_gap",
        severity: "heads_up",
        message:
          gap === Math.round((now - last) / DAY)
            ? `Your most recent clinical activity was ${formatDay(last)}, ${plural(gap, "day")} ago.`
            : `Your most recent clinical activity was ${formatDay(last)}, which is ${plural(gap, "day")} ago once your saved breaks are left out.`,
        href: "/dashboard/new",
        key: `clinical-gap:${new Date(last).toISOString().slice(0, 10)}`,
      });
    }
  }

  // 4. One organization holds most of a category. A note, since depth is good.
  for (const cat of CORE) {
    const inCat = entries.filter((e) => e.type === cat);
    const total = hoursBy.get(cat) ?? 0;
    if (inCat.length < 2 || total < 10) continue;
    const byOrg = new Map<string, { name: string; hours: number }>();
    for (const e of inCat) {
      const k = e.organization.trim().toLowerCase();
      const cur = byOrg.get(k) ?? { name: e.organization.trim(), hours: 0 };
      cur.hours += e.hours;
      byOrg.set(k, cur);
    }
    const top = [...byOrg.values()].sort((a, b) => b.hours - a.hours)[0];
    const share = top.hours / total;
    if (share > 0.6) {
      out.push({
        id: `org_concentration:${cat}`,
        type: "org_concentration",
        severity: "note",
        message: `${fmtHours(top.hours)} of your ${fmtHours(total)} ${BENCHMARK_LABEL[cat]} hours (${Math.round(share * 100)}%) are at ${top.name}, which shows depth, and some applicants also add a second setting.`,
        key: `org:${cat}:${slug(top.name)}`,
      });
    }
  }

  // 5. Ongoing entries with no update in over 120 days.
  const stale = entries.filter((e) => e.end_date === null && !badIds.has(e.id) && (now - Math.max(day(e.start_date), day(e.updated_at))) / DAY > 120);
  if (stale.length > 0) {
    const e = stale[0];
    const ago = Math.round((now - Math.max(day(e.start_date), day(e.updated_at))) / DAY);
    out.push({
      id: "stale_ongoing",
      type: "stale_ongoing",
      severity: "heads_up",
      message:
        stale.length === 1
          ? `Your ongoing entry "${e.title}" was last updated ${ago} days ago, so add an end date if it has finished.`
          : `${stale.length} ongoing entries have not been updated in over 120 days (${quoteList(stale.slice(0, 3).map((x) => x.title))}${stale.length > 3 ? " and others" : ""}), so add end dates to any that have finished.`,
      href: stale.length === 1 ? `/dashboard/${e.id}/edit` : "/dashboard#recent-experiences",
      key: `ongoing:${stale.map((x) => slug(x.id)).sort().join("+").slice(0, 150)}`,
    });
  }

  // 7. Missing descriptions, once applying is within a year.
  const missing = entries.filter((e) => !e.hasDescription).length;
  if (within12 && entries.length >= 3 && missing / entries.length > 0.25) {
    out.push({
      id: "missing_descriptions",
      type: "missing_descriptions",
      severity: "heads_up",
      message: `${missing} of your ${entries.length} entries (${Math.round((missing / entries.length) * 100)}%) have no description, and AMCAS asks for one for every activity.`,
      href: "/dashboard#recent-experiences",
      key: "descriptions",
      topic: "descriptions",
    });
  }

  // 8. No leadership or Other entries, once applying is within a year.
  if (within12 && !entries.some((e) => e.type === "other" || LEADERSHIP.test(e.title))) {
    out.push({
      id: "no_leadership",
      type: "no_leadership",
      severity: "note",
      message: `None of your ${plural(entries.length, "entry", "entries")} is a leadership role or in the Other category, and AMCAS has room for leadership, teaching, jobs and hobbies too.`,
      href: "/dashboard/new",
      key: "leadership",
    });
  }

  return out.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || RULE_ORDER.indexOf(a.type) - RULE_ORDER.indexOf(b.type)
  );
}

/* ── Dismissals ─────────────────────────────────────────────────────────── */

export interface Dismissal {
  finding_key: string;
  dismissed_until: string | null;
  permanent: boolean;
}

export function isDismissed(key: string, dismissals: Dismissal[], now: Date): boolean {
  const d = dismissals.find((x) => x.finding_key === key);
  if (!d) return false;
  if (d.permanent) return true;
  return !!d.dismissed_until && new Date(d.dismissed_until).getTime() > now.getTime();
}

/** What the panel shows: undismissed findings, at most `limit`. */
export function visibleFindings(findings: Finding[], dismissals: Dismissal[], now: Date, limit = 3): Finding[] {
  return findings.filter((f) => !isDismissed(f.key, dismissals, now)).slice(0, limit);
}

/** Dismissal keys are built only from slugs, so they always match this. */
export const FINDING_KEY = /^[a-z0-9:_+-]{1,200}$/;
