"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createRecommendation(formData: FormData) {
  const { supabase, user } = await requireUser();
  const name = String(formData.get("recommender_name") ?? "").trim();
  if (!name) return;
  const requested = String(formData.get("date_requested") ?? "").trim();

  await supabase.from("recommendations").insert({
    user_id: user.id,
    recommender_name: name,
    relationship: String(formData.get("relationship") ?? "").trim() || null,
    date_requested: requested || null,
    status: String(formData.get("status") ?? "Requested"),
    assigned_schools: parseSchools(formData.get("assigned_schools")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  });
  revalidatePath("/recommendations");
}

export async function updateRecommendation(id: string, formData: FormData) {
  const { supabase } = await requireUser();
  const requested = String(formData.get("date_requested") ?? "").trim();
  await supabase
    .from("recommendations")
    .update({
      recommender_name: String(formData.get("recommender_name") ?? "").trim(),
      relationship: String(formData.get("relationship") ?? "").trim() || null,
      date_requested: requested || null,
      status: String(formData.get("status") ?? "Requested"),
      assigned_schools: parseSchools(formData.get("assigned_schools")),
      notes: String(formData.get("notes") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/recommendations");
}

export async function setRecommendationStatus(id: string, status: string) {
  const { supabase } = await requireUser();
  await supabase
    .from("recommendations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/recommendations");
}

export async function deleteRecommendation(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("recommendations").delete().eq("id", id);
  revalidatePath("/recommendations");
}
