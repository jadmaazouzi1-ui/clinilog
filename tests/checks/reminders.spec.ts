import { test, expect } from "@playwright/test";
import { decideReminder, buildReminderEmail, gapPhrase, type ReminderPrefs, type LogRow } from "../../src/lib/checks/reminder";
import { runReminderJob, type CandidateUser, type JobDeps } from "../../src/lib/checks/job";
import { createHmac } from "node:crypto";
import { signUnsub, verifyUnsub } from "../../src/lib/unsubscribeToken";
import { NOW, AVA, entry } from "./fixtures";

const ON: ReminderPrefs = { reminders_enabled: true, gap_days: 14, pause_in_breaks: true, unsubscribed_at: null };
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000).toISOString();
const base = { prefs: ON, emailConfirmed: true, entryLoggedAt: [daysAgo(20)], breaks: [], log: [] as LogRow[], now: NOW };

test.describe("who gets a reminder", () => {
  test("not opted in, default off, or unsubscribed: never", () => {
    expect(decideReminder({ ...base, prefs: null })).toEqual({ send: false, reason: "not_opted_in" });
    expect(decideReminder({ ...base, prefs: { ...ON, reminders_enabled: false } })).toEqual({ send: false, reason: "not_opted_in" });
    expect(decideReminder({ ...base, prefs: { ...ON, unsubscribed_at: daysAgo(1) } })).toEqual({ send: false, reason: "unsubscribed" });
  });

  test("unverified email and users with no entries are skipped", () => {
    expect(decideReminder({ ...base, emailConfirmed: false }).send).toBe(false);
    expect(decideReminder({ ...base, entryLoggedAt: [] })).toEqual({ send: false, reason: "no_entries" });
  });

  test("gap threshold of 7, 14 or 30 days", () => {
    expect(decideReminder({ ...base, entryLoggedAt: [daysAgo(13)] }).send).toBe(false);
    expect(decideReminder({ ...base, entryLoggedAt: [daysAgo(14)] }).send).toBe(true);
    expect(decideReminder({ ...base, prefs: { ...ON, gap_days: 7 }, entryLoggedAt: [daysAgo(8)] }).send).toBe(true);
    expect(decideReminder({ ...base, prefs: { ...ON, gap_days: 30 }, entryLoggedAt: [daysAgo(20)] }).send).toBe(false);
  });

  test("saved breaks: never during a break, and break days do not count when paused", () => {
    const now = { start_date: daysAgo(3).slice(0, 10), end_date: daysAgo(-3).slice(0, 10) };
    expect(decideReminder({ ...base, breaks: [now] })).toEqual({ send: false, reason: "in_break" });
    const past = { start_date: daysAgo(18).slice(0, 10), end_date: daysAgo(10).slice(0, 10) };
    expect(decideReminder({ ...base, breaks: [past] }).send).toBe(false); // 20 - 9 = 11 days
    expect(decideReminder({ ...base, prefs: { ...ON, pause_in_breaks: false }, breaks: [past] }).send).toBe(true);
  });

  test("at most one per 14 days", () => {
    const log: LogRow[] = [{ kind: "gap_reminder", sent_at: daysAgo(10), status: "sent" }];
    expect(decideReminder({ ...base, entryLoggedAt: [daysAgo(40)], log })).toEqual({ send: false, reason: "sent_recently" });
    const older: LogRow[] = [{ kind: "gap_reminder", sent_at: daysAgo(15), status: "sent" }];
    expect(decideReminder({ ...base, entryLoggedAt: [daysAgo(40)], log: older }).send).toBe(true);
  });

  test("stops after 3 with no new entry, and starts again after one is logged", () => {
    const log: LogRow[] = [45, 30, 15].map((d) => ({ kind: "gap_reminder", sent_at: daysAgo(d), status: "sent" as const }));
    expect(decideReminder({ ...base, entryLoggedAt: [daysAgo(60)], log })).toEqual({ send: false, reason: "stopped_until_new_entry" });
    // A new entry 20 days ago resets the count (1 send since it, 15 days ago).
    expect(decideReminder({ ...base, entryLoggedAt: [daysAgo(60), daysAgo(20)], log }).send).toBe(true);
  });
});

test.describe("the email", () => {
  const email = buildReminderEmail({
    gapDays: 21,
    lastEntry: { title: "ED scribe", date: "2026-10-11T12:00:00Z" },
    totalHours: 125,
    suggestion: { id: "z", type: "zero_category", severity: "important", key: "zero:shadowing", message: "You have no shadowing hours logged and 6 months until your target application date of May 1, 2027 (40 hours is a common benchmark, not a requirement)." },
    logUrl: "https://www.cliniclogmd.com/dashboard/new",
    manageUrl: "https://www.cliniclogmd.com/profile#reminders",
    unsubscribeUrl: "https://www.cliniclogmd.com/api/unsubscribe?u=x&t=y&k=reminders",
  });

  test("subject uses the real gap", () => {
    expect(email.subject).toBe("It has been 3 weeks since your last entry");
    expect(gapPhrase(10)).toBe("10 days");
    expect(gapPhrase(45)).toBe("6 weeks");
  });

  test("text and HTML carry title, date, total and suggestion, with no guilt, exclamation marks or emoji", () => {
    const visibleHtml = email.html.replace(/<[^>]+>/g, " ");
    for (const body of [email.text, visibleHtml]) {
      expect(body).toContain("ED scribe");
      expect(body).toContain("Oct 11, 2026");
      expect(body).toContain("125 hours");
      expect(body).toContain("no shadowing hours");
      expect(body).not.toMatch(/[!–—]|streak|behind|don't forget|miss/i);
      expect(body).not.toMatch(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u);
    }
    expect(email.text).toContain("Unsubscribe from reminders: https://www.cliniclogmd.com/api/unsubscribe?u=x&t=y&k=reminders");
    expect(email.html).toContain("Manage reminders");
  });

  test("emails never contain descriptions or reflections", async () => {
    const SECRET_DESC = "Sat with a patient during a difficult diagnosis";
    const user = candidate({ entries: [entry({ title: "ED scribe", type: "clinical_work", hours: 20, start_date: daysAgo(30).slice(0, 10) })] });
    (user.entries[0] as unknown as Record<string, string>).description = SECRET_DESC;
    (user.entries[0] as unknown as Record<string, string>).reflection = SECRET_DESC;
    const { deps, sent } = fakes([user]);
    await runReminderJob(deps, NOW);
    expect(sent).toHaveLength(1);
    expect(JSON.stringify(sent[0])).not.toContain(SECRET_DESC);
  });
});

function candidate(p: Partial<CandidateUser> = {}): CandidateUser {
  return {
    userId: p.userId ?? "00000000-0000-0000-0000-00000000000a",
    email: "a@wfu.edu",
    emailConfirmed: true,
    prefs: ON,
    graduationYear: AVA.graduationYear,
    targetDate: AVA.targetDate,
    entries: AVA.entries.map((e) => ({ ...e, created_at: daysAgo(30) })),
    breaks: [],
    log: [],
    ...p,
  };
}

/** In-memory stand-ins for Supabase and Resend, including the unique index. */
function fakes(users: CandidateUser[], failFor = new Set<string>()) {
  const rows = new Map<string, string>();
  const sent: { to: string; subject: string; text: string; html: string; headers: Record<string, string> }[] = [];
  const deps: JobDeps = {
    async loadBatch(offset, size) {
      return users.slice(offset, offset + size).map((u) => ({ ...u, log: [...u.log, ...[...rows.keys()].filter((k) => k.startsWith(u.userId)).map((k) => ({ kind: "gap_reminder", sent_at: k.split("|")[2] + "T22:00:00Z", status: rows.get(k) as "sent" }))] }));
    },
    async claim(userId, kind, now) {
      const k = `${userId}|${kind}|${now.toISOString().slice(0, 10)}`;
      if (rows.has(k)) return false;
      rows.set(k, "pending");
      return true;
    },
    async setStatus(userId, kind, now, status) {
      rows.set(`${userId}|${kind}|${now.toISOString().slice(0, 10)}`, status);
    },
    async send(to, email) {
      if (failFor.has(to)) throw new Error("Resend 422");
      sent.push({ to, ...email });
    },
    urls: (id) => ({ log: "https://x/dashboard/new", manage: "https://x/profile#reminders", unsubscribe: `https://x/api/unsubscribe?u=${id}&t=t&k=reminders` }),
    logError: () => {},
  };
  return { deps, sent, rows };
}

test.describe("the daily job", () => {
  test("running twice on the same day sends once", async () => {
    const { deps, sent } = fakes([candidate()]);
    const first = await runReminderJob(deps, NOW);
    const second = await runReminderJob(deps, NOW);
    expect(first.sent).toBe(1);
    expect(second.sent).toBe(0);
    expect(sent).toHaveLength(1);
  });

  test("a user who is not opted in never gets an email", async () => {
    const { deps, sent } = fakes([candidate({ prefs: { ...ON, reminders_enabled: false } })]);
    await runReminderJob(deps, NOW);
    expect(sent).toHaveLength(0);
  });

  test("a saved break suppresses the email", async () => {
    const { deps, sent } = fakes([candidate({ breaks: [{ start_date: "2026-10-25", end_date: "2026-11-10" }] })]);
    await runReminderJob(deps, NOW);
    expect(sent).toHaveLength(0);
  });

  test("a Resend error for one user does not stop the run, and batches cover everyone", async () => {
    const users = Array.from({ length: 7 }, (_, i) => candidate({ userId: `u${i}`, email: `u${i}@wfu.edu` }));
    const { deps, sent, rows } = fakes(users, new Set(["u2@wfu.edu"]));
    const r = await runReminderJob(deps, NOW, 3);
    expect(r.checked).toBe(7);
    expect(r.sent).toBe(6);
    expect(r.failed).toBe(1);
    expect(sent).toHaveLength(6);
    expect(rows.get(`u2|gap_reminder|${NOW.toISOString().slice(0, 10)}`)).toBe("failed");
  });

  test("every email has List-Unsubscribe headers", async () => {
    const { deps, sent } = fakes([candidate()]);
    await runReminderJob(deps, NOW);
    expect(sent[0].headers["List-Unsubscribe"]).toMatch(/^<https:\/\/.+k=reminders>$/);
    expect(sent[0].headers["List-Unsubscribe-Post"]).toBe("List-Unsubscribe=One-Click");
  });
});

test.describe("unsubscribe tokens", () => {
  const S = "test-secret";
  const A = "00000000-0000-0000-0000-00000000000a";
  const B = "00000000-0000-0000-0000-00000000000b";

  test("a reminders token works only for that user and that purpose", () => {
    const t = signUnsub(S, "reminders", A);
    expect(verifyUnsub(S, "reminders", A, t)).toBe(true);
    expect(verifyUnsub(S, "reminders", B, t)).toBe(false);
    expect(verifyUnsub(S, "digest", A, t)).toBe(false);
    expect(verifyUnsub("other-secret", "reminders", A, t)).toBe(false);
    expect(verifyUnsub(null, "reminders", A, t)).toBe(false);
  });

  test("existing digest links keep working", () => {
    const legacy = createHmac("sha256", S).update(`unsub:${A}`).digest("base64url");
    expect(verifyUnsub(S, "digest", A, legacy)).toBe(true);
  });
});
