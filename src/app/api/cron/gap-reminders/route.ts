import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { runReminderJob, type CandidateUser } from "@/lib/checks/job";
import { REMINDER_KIND, type LogRow, type ReminderPrefs } from "@/lib/checks/reminder";
import { unsubscribeUrl } from "@/lib/unsubscribe";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Daily gap reminders (vercel.json, 22:00 UTC: 5 pm Eastern in winter, 6 pm
 * in summer). Opt-in only. Every rule lives in lib/checks; this file only
 * reads and writes. The service role key is used here, server-side, and is
 * never logged or sent to a browser.
 *
 * Idempotent: notification_log has one row per user, kind and UTC day, and
 * the row is claimed before sending, so a retry or a second run sends nothing.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const missing = ["RESEND_API_KEY", "SUPABASE_SERVICE_ROLE_KEY", "NEXT_PUBLIC_SUPABASE_URL"].filter((k) => !process.env[k]);
  if (missing.length > 0) return NextResponse.json({ skipped: true, reason: "Not configured", missing }, { status: 503 });

  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const since = new Date(now.getTime() - 120 * 86_400_000).toISOString();

  async function loadUser(prefs: ReminderPrefs & { user_id: string }): Promise<CandidateUser> {
    const id = prefs.user_id;
    const [auth, profile, entries, breaks, log] = await Promise.all([
      admin.auth.admin.getUserById(id),
      admin.from("profiles").select("graduation_year, amcas_target_date").eq("id", id).maybeSingle(),
      admin.from("experiences").select("id, title, organization, type, start_date, end_date, hours, description, updated_at, created_at").eq("user_id", id),
      admin.from("user_breaks").select("start_date, end_date").eq("user_id", id),
      admin.from("notification_log").select("kind, sent_at, status").eq("user_id", id).eq("kind", REMINDER_KIND).gte("sent_at", since),
    ]);
    const u = auth.data.user;
    return {
      userId: id,
      email: u?.email ?? null,
      emailConfirmed: !!u?.email_confirmed_at,
      prefs,
      graduationYear: profile.data?.graduation_year ?? null,
      targetDate: profile.data?.amcas_target_date ?? null,
      // Descriptions are reduced to a yes/no here and never reach the email.
      entries: (entries.data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        organization: e.organization,
        type: e.type,
        start_date: e.start_date,
        end_date: e.end_date,
        hours: Number(e.hours),
        hasDescription: !!e.description && String(e.description).trim().length > 0,
        updated_at: e.updated_at ?? e.created_at,
        created_at: e.created_at,
      })),
      breaks: breaks.data ?? [],
      log: (log.data ?? []) as LogRow[],
    };
  }

  const result = await runReminderJob(
    {
      async loadBatch(offset, size) {
        const { data, error } = await admin
          .from("notification_prefs")
          .select("user_id, reminders_enabled, gap_days, pause_in_breaks, unsubscribed_at")
          .eq("reminders_enabled", true)
          .is("unsubscribed_at", null)
          .order("user_id")
          .range(offset, offset + size - 1);
        if (error) throw new Error(error.message);
        return Promise.all((data ?? []).map(loadUser));
      },
      async claim(userId, kind) {
        const { error } = await admin.from("notification_log").insert({ user_id: userId, kind, status: "pending", send_day: day });
        if (!error) return true;
        if (error.code === "23505") return false; // already claimed today
        throw new Error(error.message);
      },
      async setStatus(userId, kind, _now, status) {
        await admin.from("notification_log").update({ status, sent_at: new Date().toISOString() }).eq("user_id", userId).eq("kind", kind).eq("send_day", day);
      },
      async send(to, email) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({ from: "ClinicLog MD <reminders@cliniclogmd.com>", to, subject: email.subject, text: email.text, html: email.html, headers: email.headers }),
        });
        if (!res.ok) throw new Error(`Resend ${res.status}`);
      },
      urls(userId) {
        return {
          log: `${SITE_URL}/dashboard/new`,
          manage: `${SITE_URL}/profile#reminders`,
          unsubscribe: unsubscribeUrl(userId, "reminders") ?? `${SITE_URL}/profile#reminders`,
        };
      },
      logError(message) {
        console.error("[gap-reminders]", message);
      },
    },
    now
  );

  return NextResponse.json(result);
}
