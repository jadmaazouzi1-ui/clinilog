import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";
import { EMAIL_STYLE, PAGE_BUTTON, brandPage } from "@/lib/emailBrand";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(body: string, status = 200) {
  return new NextResponse(
    brandPage("Email preferences", body),
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

type Purpose = "digest" | "reminders";

const COPY: Record<Purpose, { ask: string; detail: string; done: string }> = {
  digest: {
    ask: "Stop the weekly summary?",
    detail: "You will no longer receive the weekly hours email. Account emails such as password resets are not affected.",
    done: "You will not receive the weekly summary again.",
  },
  reminders: {
    ask: "Stop logging reminders?",
    detail: "You will no longer get an email after a gap in logging. You can turn reminders back on in Profile.",
    done: "Reminders are off. You can turn them back on in Profile.",
  },
};

function params(url: string) {
  const u = new URL(url);
  const k = u.searchParams.get("k");
  const purpose: Purpose = k === "reminders" ? "reminders" : "digest";
  return { id: u.searchParams.get("u") ?? "", token: u.searchParams.get("t") ?? "", purpose };
}

// GET only shows a confirmation. Mail scanners prefetch links, so an action
// on GET would unsubscribe people who never clicked.
export async function GET(request: Request) {
  const { id, token, purpose } = params(request.url);
  if (!UUID.test(id) || !verifyUnsubscribeToken(id, token, purpose)) {
    return page(`<h1 style="font-size:18px">Link not valid</h1><p>This unsubscribe link is invalid or incomplete.</p>`, 400);
  }
  const k = purpose === "digest" ? "" : `&k=${purpose}`;
  const action = `/api/unsubscribe?u=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}${k}`;
  const c = COPY[purpose];
  return page(`<h1 style="font-size:18px;margin-top:0">${c.ask}</h1><p style="${EMAIL_STYLE.muted}">${c.detail}</p><form method="post" action="${action}"><button type="submit" style="${PAGE_BUTTON}">Unsubscribe</button></form>`);
}

// POST performs it, and only the one thing the token was signed for. Also
// serves RFC 8058 one-click (List-Unsubscribe-Post). Works without signing in.
export async function POST(request: Request) {
  const { id, token, purpose } = params(request.url);
  if (!UUID.test(id) || !verifyUnsubscribeToken(id, token, purpose)) {
    return page(`<h1 style="font-size:18px">Link not valid</h1>`, 400);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return page(`<h1 style="font-size:18px">Temporarily unavailable</h1><p>Please try again later.</p>`, 503);

  const admin = createAdminClient(url, key, { auth: { persistSession: false } });
  const { error } =
    purpose === "reminders"
      ? await admin.from("notification_prefs").upsert(
          { user_id: id, reminders_enabled: false, unsubscribed_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        )
      : await admin.from("profiles").update({ digest_opt_out: true }).eq("id", id);
  if (error) {
    console.error("[unsubscribe]", error.message);
    return page(`<h1 style="font-size:18px">Something went wrong</h1><p>Please try again.</p>`, 500);
  }
  return page(`<h1 style="font-size:18px;margin-top:0">Unsubscribed</h1><p style="${EMAIL_STYLE.muted}">${COPY[purpose].done}</p><p><a href="https://www.cliniclogmd.com" style="${EMAIL_STYLE.link}">Back to ClinicLog MD</a></p>`);
}
