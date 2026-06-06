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

export async function saveGapYearData(patch: Partial<Omit<GapYearData, "user_id">>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Upsert with merged fields
  const { data: existing } = await supabase.from("gap_year_data").select("*").eq("user_id", user.id).maybeSingle();
  const merged = {
    user_id: user.id,
    target_cycle_year: patch.target_cycle_year ?? existing?.target_cycle_year ?? null,
    goals: patch.goals ?? existing?.goals ?? [],
    monthly_log: patch.monthly_log ?? existing?.monthly_log ?? {},
    milestones: patch.milestones ?? existing?.milestones ?? {},
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("gap_year_data").upsert(merged);
  if (error) return { error: error.message };
  revalidatePath("/gapyear");
  return { error: null };
}
