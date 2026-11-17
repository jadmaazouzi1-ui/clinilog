import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safeRedirect";

// A relative Location keeps the visitor on the host their browser used. The
// origin of request.url is the host as the server sees it, which on Netlify is
// the per-deploy *.netlify.app address: redirecting there sent people off
// cliniclogmd.com, away from the session cookie just set for it.
function redirectTo(path: string) {
  return new Response(null, { status: 307, headers: { Location: path } });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  // Only a same-origin relative path is honoured. The previous code glued the
  // raw value onto the origin, so next=".evil.com" produced
  // https://www.cliniclogmd.com.evil.com, an attacker-controlled host.
  const next = safeNextPath(searchParams.get("next"), "/dashboard");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectTo(next);
    }
  }

  return redirectTo(`/auth/login?error=${encodeURIComponent("Could not authenticate. Please try again.")}`);
}
