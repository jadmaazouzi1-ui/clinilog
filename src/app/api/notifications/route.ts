import { NextResponse } from "next/server";
import { z } from "zod";
import { serverError } from "@/lib/http";
import { settingsRequest } from "@/lib/settingsGuard";

const Body = z
  .object({
    reminders_enabled: z.boolean().optional(),
    gap_days: z.union([z.literal(7), z.literal(14), z.literal(30)]).optional(),
    pause_in_breaks: z.boolean().optional(),
    /** True when this answers the one-time offer, so it is never asked again. */
    answeringOffer: z.boolean().optional(),
  })
  .strict();

/** Save reminder settings. Turning reminders on clears a past unsubscribe. */
export async function POST(request: Request) {
  const g = await settingsRequest(request);
  if (!g.ok) return g.response;
  const { supabase, user } = g;

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid settings." }, { status: 400 });
  }

  const { answeringOffer, ...prefs } = body;
  if (Object.keys(prefs).length > 0) {
    const row: Record<string, unknown> = { user_id: user.id, ...prefs, updated_at: new Date().toISOString() };
    if (prefs.reminders_enabled === true) row.unsubscribed_at = null;
    const { error } = await supabase.from("notification_prefs").upsert(row, { onConflict: "user_id" });
    if (error) return serverError("api/notifications", error.message);
  }
  if (answeringOffer) {
    const { error } = await supabase
      .from("finding_dismissals")
      .upsert({ user_id: user.id, finding_key: "offer:reminders", permanent: true, dismissed_until: null }, { onConflict: "user_id,finding_key" });
    if (error) return serverError("api/notifications offer", error.message);
  }
  return NextResponse.json({ ok: true });
}
