// One way to write a date or an hour count, everywhere in the app.
// Dates: "Nov 12, 2026". Times: "Nov 12, 2026, 11:22 AM". Hours: "212 hrs",
// with at most one decimal. Ranges use "to", never a dash.

import { formatHours } from "@/lib/types";

const DATE = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });
const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" });
const TIME = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

/** Parse YYYY-MM-DD as a local date, so it never slips a day across timezones. */
function parse(input: string | Date | null | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map((s) => parseInt(s, 10));
    return new Date(y, m - 1, d);
  }
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "Nov 12, 2026", or an empty string for a missing date. */
export function formatDate(input: string | Date | null | undefined): string {
  const d = parse(input);
  return d ? DATE.format(d) : "";
}

/** "Nov 2026" */
export function formatMonth(input: string | Date | null | undefined): string {
  const d = parse(input);
  return d ? MONTH.format(d) : "";
}

/** "Nov 12, 2026, 11:22 AM" */
export function formatTimestamp(input: string | Date | null | undefined): string {
  const d = parse(input);
  return d ? `${DATE.format(d)}, ${TIME.format(d)}` : "";
}

/** "Jan 22, 2026 to Nov 12, 2026", or "Sep 24, 2025 to now" while ongoing. */
export function formatDateRange(start: string | null | undefined, end: string | null | undefined): string {
  return `${formatDate(start)} to ${end ? formatDate(end) : "now"}`;
}

/** "212 hrs", "1 hr", "2.5 hrs". The count itself comes from formatHours in
 *  lib/types, which rounds to one decimal and never pads. */
export function formatHoursLabel(value: number): string {
  const n = formatHours(value);
  return `${n} ${n === "1" ? "hr" : "hrs"}`;
}
