// The daily reminder run, with its I/O passed in. The cron route wires it to
// Supabase and Resend; tests wire it to in-memory fakes.

import { computeFindings, type CheckBreak, type CheckEntry } from "./index";
import { REMINDER_KIND, buildReminderEmail, decideReminder, type LogRow, type ReminderPrefs } from "./reminder";

export interface CandidateUser {
  userId: string;
  email: string | null;
  emailConfirmed: boolean;
  prefs: ReminderPrefs;
  graduationYear: number | null;
  targetDate: string | null;
  entries: (CheckEntry & { created_at: string })[];
  breaks: CheckBreak[];
  log: LogRow[];
}

export interface JobDeps {
  /** Opted-in users, one batch at a time; an empty batch ends the run. */
  loadBatch(offset: number, size: number): Promise<CandidateUser[]>;
  /** Atomically record today's attempt. False if a row for today already exists. */
  claim(userId: string, kind: string, now: Date): Promise<boolean>;
  setStatus(userId: string, kind: string, now: Date, status: "sent" | "failed"): Promise<void>;
  send(to: string, email: { subject: string; text: string; html: string; headers: Record<string, string> }): Promise<void>;
  urls(userId: string): { log: string; manage: string; unsubscribe: string };
  logError(message: string): void;
}

export interface JobResult {
  checked: number;
  sent: number;
  failed: number;
  skipped: Record<string, number>;
}

export async function runReminderJob(deps: JobDeps, now: Date, batchSize = 100): Promise<JobResult> {
  const result: JobResult = { checked: 0, sent: 0, failed: 0, skipped: {} };
  const skip = (r: string) => (result.skipped[r] = (result.skipped[r] ?? 0) + 1);

  for (let offset = 0; ; offset += batchSize) {
    const batch = await deps.loadBatch(offset, batchSize);
    if (batch.length === 0) break;

    for (const u of batch) {
      result.checked++;
      try {
        const decision = decideReminder({
          prefs: u.prefs,
          emailConfirmed: u.emailConfirmed && !!u.email,
          entryLoggedAt: u.entries.map((e) => e.created_at),
          breaks: u.breaks,
          log: u.log,
          now,
        });
        if (!decision.send) {
          skip(decision.reason);
          continue;
        }
        // Claim before sending: a second run (or a retry) finds the row and stops.
        if (!(await deps.claim(u.userId, REMINDER_KIND, now))) {
          skip("already_claimed");
          continue;
        }

        const last = [...u.entries].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
        const top = computeFindings({ entries: u.entries, graduationYear: u.graduationYear, targetDate: u.targetDate, breaks: u.breaks, now })[0] ?? null;
        const urls = deps.urls(u.userId);
        const email = buildReminderEmail({
          gapDays: decision.gapDays,
          lastEntry: { title: last.title, date: last.created_at },
          totalHours: u.entries.reduce((s, e) => s + e.hours, 0),
          suggestion: top,
          logUrl: urls.log,
          manageUrl: urls.manage,
          unsubscribeUrl: urls.unsubscribe,
        });

        try {
          await deps.send(u.email!, {
            ...email,
            headers: {
              "List-Unsubscribe": `<${urls.unsubscribe}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });
          await deps.setStatus(u.userId, REMINDER_KIND, now, "sent");
          result.sent++;
        } catch (err) {
          // One bad address or a Resend hiccup must not stop the run.
          await deps.setStatus(u.userId, REMINDER_KIND, now, "failed");
          deps.logError(`send failed for a user: ${err instanceof Error ? err.message : "unknown"}`);
          result.failed++;
        }
      } catch (err) {
        deps.logError(`reminder check failed for a user: ${err instanceof Error ? err.message : "unknown"}`);
        result.failed++;
      }
    }
    if (batch.length < batchSize) break;
  }
  return result;
}
