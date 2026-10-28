import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { forbiddenOrigin, isSameOrigin, serverError } from "@/lib/http";
import { MODULE_IDS } from "@/lib/tour/modules";
import { META, isNewAccount } from "@/lib/tour/logic";

const ALLOWED_IDS = new Set<string>([...MODULE_IDS, ...Object.values(META)]);

const Update = z.object({
  module_id: z.string().refine((id) => ALLOWED_IDS.has(id), "unknown module"),
  status: z.enum(["not_started", "in_progress", "completed", "dismissed"]),
  last_step: z.number().int().min(0).max(20).default(0),
});

/** Tour progress plus the few facts that decide auto-start. Reads only. */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [progress, profile, entries, schools] = await Promise.all([
      supabase.from("tour_progress").select("module_id, status, last_step, updated_at"),
      supabase.from("profiles").select("created_at, archetype_id").eq("id", user.id).single(),
      supabase.from("experiences").select("id", { count: "exact", head: true }),
      supabase.from("school_applications").select("id", { count: "exact", head: true }),
    ]);
    if (progress.error) throw new Error(progress.error.message);

    return NextResponse.json({
      rows: progress.data ?? [],
      ctx: {
        isNew: isNewAccount(profile.data?.created_at ?? user.created_at),
        entryCount: entries.count ?? 0,
        hasArchetype: !!profile.data?.archetype_id,
        hasSchools: (schools.count ?? 0) > 0,
      },
    });
  } catch (err) {
    return serverError("api/tour GET", err);
  }
}

/** Save one module's progress. Writes tour_progress and nothing else. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: z.infer<typeof Update>;
  try {
    body = Update.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { error } = await supabase.from("tour_progress").upsert(
    { user_id: user.id, ...body, updated_at: new Date().toISOString() },
    { onConflict: "user_id,module_id" }
  );
  if (error) return serverError("api/tour POST", error.message);
  return NextResponse.json({ ok: true });
}

/** Restart all tours: forget module progress, keep settings rows. */
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("tour_progress")
    .delete()
    .eq("user_id", user.id)
    .not("module_id", "like", "\\_%");
  if (error) return serverError("api/tour DELETE", error.message);
  return NextResponse.json({ ok: true });
}
