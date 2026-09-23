import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Weekly digest.
 *
 * Runs from a Vercel cron (see vercel.json). Requires two secrets that are
 * NOT currently set, and returns 503 naming the missing ones rather than
 * failing silently or half-sending:
 *
 *   RESEND_API_KEY            - to send
 *   SUPABASE_SERVICE_ROLE_KEY - to read across all users, which the anon key
 *                               cannot do under RLS
 *   CRON_SECRET               - to authorise the invocation
 *
 * Dormancy rule: a user is only emailed if they logged something in the last
 * 30 days. Someone who has drifted away does not get mail indefinitely.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (cronSecret && auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const missing: string[] = [];
  if (!process.env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (missing.length > 0) {
    return NextResponse.json(
      { skipped: true, reason: "Not configured", missing },
      { status: 503 }
    );
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
  const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString();

  // Everyone with activity in the last 30 days: the dormancy gate.
  const { data: recent, error } = await admin
    .from("experiences")
    .select("user_id, hours, created_at")
    .gte("created_at", monthAgo);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byUser = new Map<string, { weekHours: number; weekEntries: number }>();
  for (const row of recent ?? []) {
    const cur = byUser.get(row.user_id) ?? { weekHours: 0, weekEntries: 0 };
    if (row.created_at >= weekAgo) {
      cur.weekHours += Number(row.hours ?? 0);
      cur.weekEntries += 1;
    }
    byUser.set(row.user_id, cur);
  }

  const { data: usersPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailById = new Map((usersPage?.users ?? []).map((u) => [u.id, u.email]));

  let sent = 0;
  let skipped = 0;

  for (const [userId, totals] of byUser) {
    const email = emailById.get(userId);
    // Nothing logged this week: the digest would be an empty report.
    if (!email || totals.weekEntries === 0) {
      skipped += 1;
      continue;
    }

    const hours = Math.round(totals.weekHours * 10) / 10;
    const encouragement =
      totals.weekEntries >= 3
        ? "A steady week. Consistency over months is what an admissions reader actually notices."
        : "Logged while it was fresh, which is the hard part. Keep the habit.";

    const html = `<!doctype html><html><body style="margin:0;background:#F3F7F4;font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#16241D">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px">
    <div style="background:#000;color:#fff;padding:12px 16px;font-weight:700;font-size:14px;letter-spacing:.06em">CLINICLOG MD</div>
    <div style="background:#fff;border:1px solid rgba(16,24,20,.16);border-top:0;padding:24px 16px">
      <p style="margin:0 0 4px;font-family:ui-monospace,Menlo,monospace;font-size:10px;letter-spacing:.12em;color:#94A39B">WEEKLY SUMMARY</p>
      <h1 style="margin:0 0 16px;font-size:20px">Your week in hours</h1>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid rgba(16,24,20,.1);font-size:12px;font-weight:700;letter-spacing:.08em;color:#5B6B63">HOURS LOGGED</td>
          <td style="padding:8px 0;border-bottom:1px solid rgba(16,24,20,.1);text-align:right;font-family:ui-monospace,Menlo,monospace;font-size:18px;font-weight:600">${hours}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid rgba(16,24,20,.1);font-size:12px;font-weight:700;letter-spacing:.08em;color:#5B6B63">ENTRIES ADDED</td>
          <td style="padding:8px 0;border-bottom:1px solid rgba(16,24,20,.1);text-align:right;font-family:ui-monospace,Menlo,monospace;font-size:18px;font-weight:600">${String(totals.weekEntries).padStart(2, "0")}</td>
        </tr>
      </table>
      <p style="margin:0 0 20px;font-size:14px;line-height:1.6;color:#5B6B63">${encouragement}</p>
      <a href="https://www.cliniclogmd.com/dashboard" style="display:inline-block;background:#2D6A4F;color:#fff;text-decoration:none;padding:10px 18px;border-radius:3px;font-size:14px;font-weight:600">Open your dashboard</a>
    </div>
    <p style="margin:16px 0 0;font-size:11px;color:#94A39B">You receive this because you logged hours in the last 30 days. It stops automatically if you go quiet.</p>
  </div>
</body></html>`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ClinicLog MD <digest@cliniclogmd.com>",
        to: [email],
        subject: `${hours} hours logged this week`,
        html,
      }),
    });

    if (res.ok) sent += 1;
    else skipped += 1;
  }

  return NextResponse.json({ ok: true, sent, skipped, considered: byUser.size });
}
