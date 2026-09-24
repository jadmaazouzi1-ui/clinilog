"use server";

// SQL to run in Supabase first:
//
// CREATE TABLE gap_year_data (
//   user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
//   target_cycle_year INTEGER,
//   goals JSONB DEFAULT '[]'::jsonb,
//   monthly_log JSONB DEFAULT '{}'::jsonb,
//   milestones JSONB DEFAULT '{}'::jsonb,
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE gap_year_data ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users manage own gap year" ON gap_year_data FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { parseBoundedInt, parseEnum, sanitizeText } from "@/lib/sanitize";

export interface GapGoal {
  id: string;
  category: "clinical" | "research" | "volunteering" | "personal" | "financial";
  title: string;
  target: string;
}

export interface GapYearData {
  user_id: string;
  target_cycle_year: number | null;
  goals: GapGoal[];
  monthly_log: Record<string, string>; // "2026-05" -> "what I did"
  milestones: Record<string, boolean>;
}

const GOAL_CATEGORIES = ["clinical", "research", "volunteering", "personal", "financial"] as const;

/**
 * These three columns are jsonb written from the client, so the payload is
 * whatever the browser sends. Without bounds a caller can store megabytes of
 * arbitrary structure under their own row. Shape, length and content are all
 * enforced here rather than trusted.
 */
function cleanGoals(input: unknown): GapGoal[] {
  if (!Array.isArray(input)) return [];
  return input.slice(0, 50).map((g) => {
    const o = (g ?? {}) as Record<string, unknown>;
    return {
      id: sanitizeText(o.id, 64) || crypto.randomUUID(),
      category: parseEnum(o.category, GOAL_CATEGORIES, "personal"),
      title: sanitizeText(o.title, 200),
      target: sanitizeText(o.target, 200),
    };
  });
}

function cleanMonthlyLog(input: unknown): Record<string, string> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>).slice(0, 36)) {
    // Keys are month buckets ("2026-05"); anything else is discarded.
    if (!/^\d{4}-\d{2}$/.test(k)) continue;
    out[k] = sanitizeText(v, 1000);
  }
  return out;
}

function cleanMilestones(input: unknown): Record<string, boolean> {
  if (!input || typeof input !== "object" || Array.isArray(input)) return {};
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>).slice(0, 60)) {
    const key = sanitizeText(k, 64);
    if (key) out[key] = v === true;
  }
  return out;
}

export async function saveGapYearData(patch: Partial<Omit<GapYearData, "user_id">>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Upsert with merged fields
  const { data: existing } = await supabase.from("gap_year_data").select("*").eq("user_id", user.id).maybeSingle();
  const merged = {
    user_id: user.id,
    target_cycle_year:
      patch.target_cycle_year !== undefined
        ? parseBoundedInt(patch.target_cycle_year, 2000, 2100)
        : existing?.target_cycle_year ?? null,
    goals: patch.goals !== undefined ? cleanGoals(patch.goals) : existing?.goals ?? [],
    monthly_log:
      patch.monthly_log !== undefined ? cleanMonthlyLog(patch.monthly_log) : existing?.monthly_log ?? {},
    milestones:
      patch.milestones !== undefined ? cleanMilestones(patch.milestones) : existing?.milestones ?? {},
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("gap_year_data").upsert(merged);
  if (error) return { error: error.message };
  revalidatePath("/gapyear");
  return { error: null };
}
