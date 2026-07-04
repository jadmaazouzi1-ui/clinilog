"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeOptional } from "@/lib/sanitize";

export async function upsertProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const full_name = sanitizeOptional(formData.get("full_name"), 100);
  const undergraduate_school = sanitizeOptional(formData.get("undergraduate_school"), 100);
  const graduation_year_raw = formData.get("graduation_year") as string;
  const parsed_year = graduation_year_raw ? parseInt(graduation_year_raw, 10) : null;
  const graduation_year =
    parsed_year !== null && parsed_year >= 2000 && parsed_year <= 2100 ? parsed_year : null;
  const intended_specialty = sanitizeOptional(formData.get("intended_specialty"), 100);

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name,
    undergraduate_school,
    graduation_year,
    intended_specialty,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/profile?saved=1");
}
