"use server";
// Run this SQL in Supabase first:
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sanitizeText, sanitizeOptional, parseHours, CAPS } from "@/lib/sanitize";

export async function saveOnboardingProfile(data: {
  fullName: string;
  school: string;
  gradYear: string;
  specialty: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  const gradYear = data.gradYear ? parseInt(data.gradYear) : null;
  await supabase.from("profiles").upsert({
    id: user.id,
    full_name: sanitizeOptional(data.fullName, 100),
    undergraduate_school: sanitizeOptional(data.school, 100),
    graduation_year: gradYear !== null && gradYear >= 2000 && gradYear <= 2100 ? gradYear : null,
    intended_specialty: sanitizeOptional(data.specialty, 100),
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
  const hours = parseHours(data.hours);
  const title = sanitizeText(data.title, CAPS.title);
  const organization = sanitizeText(data.organization, CAPS.organization);
  if (!title || !organization || !data.type || hours === null) return;
  await supabase.from("experiences").insert({
    user_id: user.id,
    title,
    organization,
    type: data.type,
    hours,
    start_date: new Date().toISOString().split("T")[0],
    description: sanitizeText(data.description, CAPS.description),
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
