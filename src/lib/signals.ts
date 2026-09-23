/* Derived signals from a user's logged experiences: streaks, dormancy and
   anniversaries. All pure and date-injectable so they can be reasoned about
   without mocking the clock. */

import { Experience } from "./types";

/** Monday-based ISO week key, e.g. "2026-W39". */
function weekKey(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // ISO weeks run Monday to Sunday; shift Sunday (0) back to 7.
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function parseDate(s: string): Date {
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const [y, m, d] = s.slice(0, 10).split("-").map((n) => parseInt(n, 10));
    return new Date(y, m - 1, d);
  }
  return new Date(s);
}

/**
 * Consecutive weeks, counting back from the current week, in which at least
 * one entry was created. The current week not having an entry yet does not
 * break a streak, since the week is still in progress: counting starts from
 * last week in that case.
 */
export function weekStreak(experiences: Experience[], now: Date = new Date()): number {
  if (experiences.length === 0) return 0;

  const weeks = new Set(
    experiences
      .map((e) => (e.created_at ? parseDate(e.created_at) : null))
      .filter((d): d is Date => d !== null && !Number.isNaN(d.getTime()))
      .map(weekKey)
  );

  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!weeks.has(weekKey(cursor))) cursor.setDate(cursor.getDate() - 7);

  let streak = 0;
  // A 260-week ceiling keeps this bounded on pathological data.
  for (let i = 0; i < 260; i++) {
    if (!weeks.has(weekKey(cursor))) break;
    streak++;
    cursor.setDate(cursor.getDate() - 7);
  }
  return streak;
}

/** Whole days since the most recent entry was created, or null if none. */
export function daysSinceLastEntry(
  experiences: Experience[],
  now: Date = new Date()
): number | null {
  const stamps = experiences
    .map((e) => (e.created_at ? parseDate(e.created_at) : null))
    .filter((d): d is Date => d !== null && !Number.isNaN(d.getTime()))
    .map((d) => d.getTime());
  if (stamps.length === 0) return null;

  const latest = new Date(Math.max(...stamps));
  const a = new Date(latest.getFullYear(), latest.getMonth(), latest.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** Months between the earliest entry's start date and now. */
export function historyMonths(experiences: Experience[], now: Date = new Date()): number {
  if (experiences.length === 0) return 0;
  const earliest = Math.min(
    ...experiences.map((e) => parseDate(e.start_date).getTime()).filter((n) => !Number.isNaN(n))
  );
  if (!Number.isFinite(earliest)) return 0;
  const d = new Date(earliest);
  return (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
}

/**
 * An entry that started within a two-week window around today's date in a
 * previous year. Returns the closest such entry, or null.
 */
export function onThisDay(experiences: Experience[], now: Date = new Date()): Experience | null {
  const WINDOW_DAYS = 14;
  let best: { exp: Experience; distance: number } | null = null;

  for (const e of experiences) {
    const d = parseDate(e.start_date);
    if (Number.isNaN(d.getTime())) continue;
    if (d.getFullYear() >= now.getFullYear()) continue;

    // Project the entry's month/day onto the current year to measure distance.
    const projected = new Date(now.getFullYear(), d.getMonth(), d.getDate());
    const distance = Math.abs(
      Math.round(
        (projected.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) /
          86400000
      )
    );
    if (distance <= WINDOW_DAYS && (best === null || distance < best.distance)) {
      best = { exp: e, distance };
    }
  }
  return best?.exp ?? null;
}

/** Totals for the month before `now`, used by the monthly recap card. */
export function priorMonthSummary(experiences: Experience[], now: Date = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 1);

  const inMonth = experiences.filter((e) => {
    const d = e.created_at ? parseDate(e.created_at) : null;
    return d !== null && d >= start && d < end;
  });

  const byType: Record<string, number> = {};
  let hours = 0;
  for (const e of inMonth) {
    hours += Number(e.hours ?? 0);
    byType[e.type] = (byType[e.type] ?? 0) + Number(e.hours ?? 0);
  }
  const topCategory =
    Object.entries(byType).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    monthKey: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`,
    monthLabel: start.toLocaleString("en-US", { month: "long", year: "numeric" }),
    hours,
    entries: inMonth.length,
    topCategory,
  };
}
