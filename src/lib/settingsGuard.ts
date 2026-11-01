import "server-only";
import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";
import { forbiddenOrigin, isSameOrigin, secondsUntilUtcMidnight, tooManyRequests } from "@/lib/http";

/** Shared front door for small settings writes: same origin, signed in, rate limited. */
export async function settingsRequest(
  request: Request
): Promise<{ ok: true; supabase: SupabaseClient; user: User } | { ok: false; response: NextResponse }> {
  if (!isSameOrigin(request)) return { ok: false, response: forbiddenOrigin() };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const limit = await checkUserRateLimit(supabase, "settings");
  if (!limit.allowed) {
    return { ok: false, response: tooManyRequests("Too many changes today. Try again tomorrow.", secondsUntilUtcMidnight()) };
  }
  return { ok: true, supabase, user };
}
