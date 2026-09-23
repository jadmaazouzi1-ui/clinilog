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

  // Committee letter tracker
  const committee_letter_required = formData.get("committee_letter_required") === "on";
  const committee_letter_status = sanitizeOptional(formData.get("committee_letter_status"), 40) ?? "Not Started";
  const committee_letter_notes = sanitizeOptional(formData.get("committee_letter_notes"), 500);

  // AMCAS countdown target
  const amcas_raw = String(formData.get("amcas_target_date") ?? "").trim();
  const amcas_target_date = /^\d{4}-\d{2}-\d{2}$/.test(amcas_raw) ? amcas_raw : null;

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name,
    undergraduate_school,
    graduation_year,
    intended_specialty,
    committee_letter_required,
    committee_letter_status,
    committee_letter_notes,
    amcas_target_date,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirect(`/profile?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/profile?saved=1");
}
