"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CAPS, parseDateAny, parseEnum, sanitizeOptional, sanitizeText } from "@/lib/sanitize";

const STATUSES = ["Requested", "In Progress", "Submitted"] as const;

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return { supabase, user };
}

/** Comma-separated school list from the form, normalised to a JSON array. */
function parseSchools(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? "")
    .split(",")
    .map((s) => sanitizeText(s, CAPS.schoolName))
    .filter(Boolean)
    // Bounded: this lands in a jsonb column, so an unbounded list is a
    // storage abuse vector.
    .slice(0, 60);
}

export async function createRecommendation(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = sanitizeText(formData.get("recommender_name"), CAPS.personName);
  if (!name) return;

  await supabase.from("recommendations").insert({
    user_id: user.id,
    recommender_name: name,
    relationship: sanitizeOptional(formData.get("relationship"), CAPS.relationship),
    date_requested: parseDateAny(formData.get("date_requested")),
    status: parseEnum(formData.get("status"), STATUSES, "Requested"),
    assigned_schools: parseSchools(formData.get("assigned_schools")),
    notes: sanitizeOptional(formData.get("notes"), CAPS.notes),
  });
  revalidatePath("/recommendations");
}

export async function updateRecommendation(id: string, formData: FormData) {
  const { supabase } = await requireUser();
  const name = sanitizeText(formData.get("recommender_name"), CAPS.personName);
  if (!name) return;
  await supabase
    .from("recommendations")
    .update({
      recommender_name: name,
      relationship: sanitizeOptional(formData.get("relationship"), CAPS.relationship),
      date_requested: parseDateAny(formData.get("date_requested")),
      status: parseEnum(formData.get("status"), STATUSES, "Requested"),
      assigned_schools: parseSchools(formData.get("assigned_schools")),
      notes: sanitizeOptional(formData.get("notes"), CAPS.notes),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/recommendations");
}

export async function setRecommendationStatus(id: string, status: string) {
  const { supabase } = await requireUser();
  await supabase
    .from("recommendations")
    .update({ status: parseEnum(status, STATUSES, "Requested"), updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/recommendations");
}

export async function deleteRecommendation(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("recommendations").delete().eq("id", id);
  revalidatePath("/recommendations");
}
