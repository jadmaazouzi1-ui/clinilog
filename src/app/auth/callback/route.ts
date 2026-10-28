import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/safeRedirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Only a same-origin relative path is honoured. The previous code glued the
  // raw value onto the origin, so next=".evil.com" produced
  // https://www.cliniclogmd.com.evil.com, an attacker-controlled host.
  const next = safeNextPath(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent("Could not authenticate. Please try again.")}`);
}
