import { NextResponse } from "next/server";
import { EMAIL, EMAIL_STYLE, button, emailShell, para } from "@/lib/emailBrand";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { unsubscribeUrl } from "@/lib/unsubscribe";

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
  // Fails closed: with no secret configured the endpoint refuses everyone.
  // A missing CRON_SECRET used to leave it open to anyone.
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
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
    console.error("[weekly-digest]", error.message);
    return NextResponse.json({ error: "Digest query failed" }, { status: 500 });
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

  const { data: optedOut } = await admin.from("profiles").select("id").eq("digest_opt_out", true);
  const optedOutIds = new Set((optedOut ?? []).map((r) => r.id));

  const { data: usersPage } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const emailById = new Map((usersPage?.users ?? []).map((u) => [u.id, u.email]));

  let sent = 0;
  let skipped = 0;

  for (const [userId, totals] of byUser) {
    const email = emailById.get(userId);
    // Nothing logged this week: the digest would be an empty report.
    const unsub = unsubscribeUrl(userId);
    // No unsubscribe link means no email: never send one people cannot stop.
    if (!email || totals.weekEntries === 0 || optedOutIds.has(userId) || !unsub) {
      skipped += 1;
      continue;
    }

    const hours = Math.round(totals.weekHours * 10) / 10;
    const encouragement =
      totals.weekEntries >= 3
        ? "A steady week. Consistency over months is what an admissions reader actually notices."
        : "Logged while it was fresh, which is the hard part. Keep the habit.";

    const html = emailShell({
      eyebrow: "WEEKLY SUMMARY",
      title: "Your week in hours",
      body: [
        `<table role="presentation" style="width:100%;border-collapse:collapse;margin-bottom:16px"><tr><td style="padding:8px 0;border-bottom:1px solid ${EMAIL.hairline};font-size:12px;font-weight:700;letter-spacing:.08em;color:${EMAIL.muted}">HOURS LOGGED</td><td style="padding:8px 0;border-bottom:1px solid ${EMAIL.hairline};text-align:right;font-family:ui-monospace,Menlo,monospace;font-size:18px;font-weight:600;color:${EMAIL.text}">${hours}</td></tr><tr><td style="padding:8px 0;border-bottom:1px solid ${EMAIL.hairline};font-size:12px;font-weight:700;letter-spacing:.08em;color:${EMAIL.muted}">ENTRIES ADDED</td><td style="padding:8px 0;border-bottom:1px solid ${EMAIL.hairline};text-align:right;font-family:ui-monospace,Menlo,monospace;font-size:18px;font-weight:600;color:${EMAIL.text}">${String(totals.weekEntries).padStart(2, "0")}</td></tr></table>`,
        para(encouragement, `color:${EMAIL.muted};font-size:14px`),
        button("https://www.cliniclogmd.com/dashboard", "Open your dashboard"),
      ].join("\n"),
      footer: `You receive this because you logged hours in the last 30 days. It stops automatically if you go quiet. <a href="${unsub}" style="${EMAIL_STYLE.link}">Unsubscribe</a>`,
    });

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
        headers: {
          "List-Unsubscribe": `<${unsub}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      }),
    });

    if (res.ok) sent += 1;
    else skipped += 1;
  }

  return NextResponse.json({ ok: true, sent, skipped, considered: byUser.size });
}
