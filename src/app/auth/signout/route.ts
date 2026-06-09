import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Derive the origin from the incoming request so this works on any
  // deployment (Netlify, localhost, etc.) without a hardcoded URL.
  const origin = new URL(request.url).origin;

  // 303 forces the browser to convert the POST into a GET when following
  // the redirect — the correct behavior for form submissions.
  return NextResponse.redirect(new URL("/", origin), { status: 303 });
}
