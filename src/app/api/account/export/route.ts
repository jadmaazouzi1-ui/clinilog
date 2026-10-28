import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";
import { secondsUntilUtcMidnight, serverError, tooManyRequests } from "@/lib/http";

/**
 * Export My Data: every row this user owns, as JSON.
 *
 * Each query runs under the caller's own session, so row level security
 * limits every table to their rows; there is no id parameter that could be
 * changed to reach someone else's data.
 */
const TABLES = [
  "profiles",
  "experiences",
  "school_applications",
  "interviews",
  "waitlist_updates",
  "recommendations",
  "fee_waivers",
  "gap_year_data",
  "postbacc_courses",
  "postbacc_profile",
  "referrals",
] as const;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = await checkUserRateLimit(supabase, "data_export");
  if (!limit.allowed) {
    return tooManyRequests("Export limit reached (5/day). Try again tomorrow.", secondsUntilUtcMidnight());
  }

  try {
    const out: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      account: { id: user.id, email: user.email, created_at: user.created_at },
    };
    for (const t of TABLES) {
      const { data, error } = await supabase.from(t).select("*");
      if (error) throw new Error(`${t}: ${error.message}`);
      out[t] = data ?? [];
    }
    return new NextResponse(JSON.stringify(out, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="cliniclog-export-${new Date().toISOString().slice(0, 10)}.json"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (err) {
    return serverError("api/account/export", err);
  }
}
