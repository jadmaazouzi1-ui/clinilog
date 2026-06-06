"use server";

// SQL to run in Supabase first:
//
// CREATE TABLE postbacc_courses (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
//   name TEXT NOT NULL,
//   semester TEXT,
//   credits NUMERIC NOT NULL,
//   grade TEXT NOT NULL,
//   is_bcpm BOOLEAN DEFAULT FALSE,
//   created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
// );
// ALTER TABLE postbacc_courses ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users manage own postbacc courses" ON postbacc_courses FOR ALL
//   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
//
// CREATE TABLE postbacc_profile (
//   user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
//   program_type TEXT,
//   gpa_goal NUMERIC DEFAULT 3.7,
//   bcpm_goal NUMERIC DEFAULT 3.7,
//   notes TEXT,
//   updated_at TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE postbacc_profile ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users manage own postbacc profile" ON postbacc_profile FOR ALL
//   USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface PostbaccCourse {
  id: string;
  user_id: string;
  name: string;
  semester: string | null;
  credits: number;
  grade: string;
  is_bcpm: boolean;
  created_at: string;
}

export interface PostbaccProfile {
  user_id: string;
  program_type: string | null;
  gpa_goal: number;
  bcpm_goal: number;
  notes: string | null;
}

export async function addCourse(form: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const name = (form.get("name") as string)?.trim();
  const semester = (form.get("semester") as string)?.trim() || null;
  const credits = parseFloat(form.get("credits") as string);
  const grade = (form.get("grade") as string)?.trim();
  const is_bcpm = form.get("is_bcpm") === "on";

  if (!name || !grade || !Number.isFinite(credits) || credits <= 0) {
    return { error: "Course name, grade, and a valid credit value are required." };
  }

  const { error } = await supabase.from("postbacc_courses").insert({
    user_id: user.id,
    name,
    semester,
    credits,
    grade,
    is_bcpm,
  });
  if (error) return { error: error.message };
  revalidatePath("/postbacc");
  return { error: null };
}

export async function deleteCourse(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };
  const { error } = await supabase.from("postbacc_courses").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/postbacc");
  return { error: null };
}

export async function saveProfile(patch: Partial<Omit<PostbaccProfile, "user_id">>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: existing } = await supabase.from("postbacc_profile").select("*").eq("user_id", user.id).maybeSingle();
  const merged = {
    user_id: user.id,
    program_type: patch.program_type ?? existing?.program_type ?? null,
    gpa_goal: patch.gpa_goal ?? existing?.gpa_goal ?? 3.7,
    bcpm_goal: patch.bcpm_goal ?? existing?.bcpm_goal ?? 3.7,
    notes: patch.notes ?? existing?.notes ?? null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from("postbacc_profile").upsert(merged);
  if (error) return { error: error.message };
  revalidatePath("/postbacc");
  return { error: null };
}
