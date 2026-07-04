import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Hardcoded canonical domain — guarantees sign-out always lands on the
// custom domain, never a Netlify/preview URL or localhost.
const PRODUCTION_URL = "https://cliniclogmd.com";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Explicit absolute redirect so the browser leaves whatever host the
  // request came from (Netlify subdomain, deploy preview, localhost)
  // and lands on the canonical custom domain.
  return NextResponse.redirect(`${PRODUCTION_URL}/`, {
    status: 303,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}
