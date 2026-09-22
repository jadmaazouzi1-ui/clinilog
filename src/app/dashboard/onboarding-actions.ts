"use server";
// Run this SQL in Supabase first:
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { sanitizeText, parseHours, CAPS } from "@/lib/sanitize";

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
