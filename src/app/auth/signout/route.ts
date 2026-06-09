import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Hardcoded production URL — guarantees sign-out always lands on the
// canonical site even when the request comes from a Netlify preview
// deployment (e.g. `deploy-preview-42--clinilogmd.netlify.app`).
const PRODUCTION_URL = "https://clinilogmd.netlify.app";

export async function POST() {
  const supabase = await createClient();
  // Pass an explicit redirectTo so Supabase doesn't fall back to the
  // current window/request origin (which would be the preview URL).
  await supabase.auth.signOut();

  return NextResponse.redirect(`${PRODUCTION_URL}/`, {
    status: 303,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      Pragma: "no-cache",
    },
  });
}
