import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Always redirect to the landing page using an absolute URL derived from
  // the incoming request. Works on any deployment (Netlify, localhost, etc.)
  const origin = new URL(request.url).origin;
  const landing = `${origin}/`;

  // 303 turns the POST into a GET on the redirect — required for form posts.
  // No-cache headers prevent the redirect response (or any cached version of
  // the landing page that might apply stale viewport/zoom) from being reused.
  return NextResponse.redirect(landing, {
    status: 303,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}
