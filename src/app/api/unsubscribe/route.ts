import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { verifyUnsubscribeToken } from "@/lib/unsubscribe";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function page(body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Email preferences | ClinicLog MD</title></head><body style="margin:0;background:#F5FAF7;color:#0E1A15;font-family:system-ui,-apple-system,sans-serif"><div style="max-width:440px;margin:64px auto;padding:24px;background:#fff;border:1px solid rgba(31,77,58,.34)">${body}</div></body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } }
  );
}

function params(url: string) {
  const u = new URL(url);
  return { id: u.searchParams.get("u") ?? "", token: u.searchParams.get("t") ?? "" };
}

// GET only shows a confirmation. Mail scanners prefetch links, so an action
// on GET would unsubscribe people who never clicked.
export async function GET(request: Request) {
  const { id, token } = params(request.url);
  if (!UUID.test(id) || !verifyUnsubscribeToken(id, token)) {
    return page(`<h1 style="font-size:18px">Link not valid</h1><p>This unsubscribe link is invalid or incomplete.</p>`, 400);
  }
  const action = `/api/unsubscribe?u=${encodeURIComponent(id)}&t=${encodeURIComponent(token)}`;
  return page(`<h1 style="font-size:18px;margin-top:0">Stop the weekly summary?</h1><p style="color:#40594D">You will no longer receive the weekly hours email. Account emails such as password resets are not affected.</p><form method="post" action="${action}"><button type="submit" style="background:#1F4D3A;color:#fff;border:0;padding:10px 18px;font-weight:600;cursor:pointer">Unsubscribe</button></form>`);
}

// POST performs it. Also serves RFC 8058 one-click (List-Unsubscribe-Post).
export async function POST(request: Request) {
  const { id, token } = params(request.url);
  if (!UUID.test(id) || !verifyUnsubscribeToken(id, token)) {
    return page(`<h1 style="font-size:18px">Link not valid</h1>`, 400);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return page(`<h1 style="font-size:18px">Temporarily unavailable</h1><p>Please try again later.</p>`, 503);

  const admin = createAdminClient(url, key, { auth: { persistSession: false } });
  const { error } = await admin.from("profiles").update({ digest_opt_out: true }).eq("id", id);
  if (error) {
    console.error("[unsubscribe]", error.message);
    return page(`<h1 style="font-size:18px">Something went wrong</h1><p>Please try again.</p>`, 500);
  }
  return page(`<h1 style="font-size:18px;margin-top:0">Unsubscribed</h1><p style="color:#40594D">You will not receive the weekly summary again.</p><p><a href="https://www.cliniclogmd.com" style="color:#1F4D3A">Back to ClinicLog MD</a></p>`);
}
