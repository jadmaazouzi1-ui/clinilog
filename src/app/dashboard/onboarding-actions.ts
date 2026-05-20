"use server";
// Run this SQL in Supabase first:
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveOnboardingProfile(data: {
  fullName: string;
  school: string;
  gradYear: string;
  specialty: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: data.fullName || null,
    undergraduate_school: data.school || null,
    graduation_year: data.gradYear ? parseInt(data.gradYear) : null,
    intended_specialty: data.specialty || null,
  });
}

export async function saveOnboardingExperience(data: {
  title: string;
  organization: string;
  type: string;
  hours: string;
  description: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const hours = parseFloat(data.hours);
  if (!data.title || !data.organization || !data.type || isNaN(hours)) return;
  await supabase.from("experiences").insert({
    user_id: user.id,
    title: data.title,
    organization: data.organization,
    type: data.type,
    hours,
    start_date: new Date().toISOString().split("T")[0],
    description: data.description || "",
  });
  revalidatePath("/dashboard");
}

export async function markOnboardingComplete() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("profiles").upsert({
    id: user.id,
    onboarding_complete: true,
  });
  revalidatePath("/dashboard");
}
