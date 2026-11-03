// Gap reminder: whether to send, and what to say. Pure functions; the cron
// route supplies the data and does the I/O.

import { EMAIL_STYLE, button, emailShell, esc, para } from "../emailBrand";
import { PALETTE } from "../palette";
import { breakDaysBetween, formatDay, inBreak, type CheckBreak, type Finding } from "./index";

export const REMINDER_KIND = "gap_reminder";
export const MIN_DAYS_BETWEEN_SENDS = 14;
export const MAX_SENDS_WITHOUT_ENTRY = 3;
export const GAP_CHOICES = [7, 14, 30] as const;
export type GapDays = (typeof GAP_CHOICES)[number];

const DAY = 86_400_000;

export interface ReminderPrefs {
  reminders_enabled: boolean;
  gap_days: number;
  pause_in_breaks: boolean;
  unsubscribed_at: string | null;
}

export interface LogRow {
  kind: string;
  sent_at: string;
  status: "pending" | "sent" | "failed" | "skipped";
}

export interface ReminderInput {
  prefs: ReminderPrefs | null;
  emailConfirmed: boolean;
  /** When each entry was logged (created_at). */
  entryLoggedAt: string[];
  breaks: CheckBreak[];
  log: LogRow[];
  now: Date;
}

export type ReminderDecision =
  | { send: true; gapDays: number; lastLoggedAt: number }
  | { send: false; reason: string };

export function decideReminder(input: ReminderInput): ReminderDecision {
  const { prefs, now } = input;
  if (!prefs || !prefs.reminders_enabled) return { send: false, reason: "not_opted_in" };
  if (prefs.unsubscribed_at) return { send: false, reason: "unsubscribed" };
  if (!input.emailConfirmed) return { send: false, reason: "email_unconfirmed" };
  if (input.entryLoggedAt.length === 0) return { send: false, reason: "no_entries" };
  if (inBreak(input.breaks, now)) return { send: false, reason: "in_break" };

  const lastLoggedAt = Math.max(...input.entryLoggedAt.map((d) => new Date(d).getTime()));
  let gap = Math.floor((now.getTime() - lastLoggedAt) / DAY);
  if (prefs.pause_in_breaks) {
    const from = Date.UTC(new Date(lastLoggedAt).getUTCFullYear(), new Date(lastLoggedAt).getUTCMonth(), new Date(lastLoggedAt).getUTCDate()) + DAY;
    gap -= breakDaysBetween(input.breaks, from, now.getTime());
  }
  const threshold = (GAP_CHOICES as readonly number[]).includes(prefs.gap_days) ? prefs.gap_days : 14;
  if (gap < threshold) return { send: false, reason: "gap_below_threshold" };

  const mine = input.log.filter((r) => r.kind === REMINDER_KIND);
  // Any attempt today (even a failed one) blocks a second send the same day.
  const todayKey = now.toISOString().slice(0, 10);
  if (mine.some((r) => r.sent_at.slice(0, 10) === todayKey)) return { send: false, reason: "already_attempted_today" };

  const sent = mine.filter((r) => r.status === "sent" || r.status === "pending");
  const sinceLastEntry = sent.filter((r) => new Date(r.sent_at).getTime() > lastLoggedAt).length;
  if (sinceLastEntry >= MAX_SENDS_WITHOUT_ENTRY) return { send: false, reason: "stopped_until_new_entry" };

  const lastSend = Math.max(0, ...sent.map((r) => new Date(r.sent_at).getTime()));
  if (now.getTime() - lastSend < MIN_DAYS_BETWEEN_SENDS * DAY) return { send: false, reason: "sent_recently" };

  return { send: true, gapDays: gap, lastLoggedAt };
}

/* ── Email ──────────────────────────────────────────────────────────────── */

export interface ReminderEmailInput {
  gapDays: number;
  lastEntry: { title: string; date: string };
  totalHours: number;
  /** The top finding from lib/checks, if any. Its message has counts only. */
  suggestion: Finding | null;
  logUrl: string;
  unsubscribeUrl: string;
  manageUrl: string;
}

export function gapPhrase(days: number): string {
  if (days < 21) return `${days} days`;
  const weeks = Math.round(days / 7);
  return weeks < 9 ? `${weeks} weeks` : `${Math.round(days / 30)} months`;
}

function hours(n: number): string {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

/** Titles, dates and counts only. Never descriptions or reflections. */
export function buildReminderEmail(i: ReminderEmailInput): { subject: string; text: string; html: string } {
  const gap = gapPhrase(i.gapDays);
  const subject = `It has been ${gap} since your last entry`;
  const last = `Your last entry was "${i.lastEntry.title}" on ${formatDay(new Date(i.lastEntry.date).getTime())}.`;
  const total = `You have ${hours(i.totalHours)} hours logged so far.`;
  const tip = i.suggestion ? i.suggestion.message : null;

  const text = [
    `It has been ${gap} since you last logged hours in ClinicLog MD.`,
    "",
    last,
    total,
    ...(tip ? ["", tip] : []),
    "",
    `Log hours: ${i.logUrl}`,
    "",
    "You asked for this reminder. Change how often it comes, or turn it off:",
    i.manageUrl,
    `Unsubscribe from reminders: ${i.unsubscribeUrl}`,
    "",
    "ClinicLog MD, cliniclogmd.com",
  ].join("\n");

  const html = emailShell({
    eyebrow: "REMINDER",
    title: `It has been ${gap} since your last entry`,
    body: [
      para(esc(last)),
      para(esc(total)),
      tip ? para(esc(tip), `border-left:3px solid ${PALETTE.gold500};padding-left:12px`) : "",
      button(i.logUrl, "Log hours"),
    ].join("\n"),
    footer: `You asked for this reminder. <a href="${esc(i.manageUrl)}" style="${EMAIL_STYLE.link}">Manage reminders</a> or <a href="${esc(i.unsubscribeUrl)}" style="${EMAIL_STYLE.link}">unsubscribe</a>.`,
  });

  return { subject, text, html };
}
