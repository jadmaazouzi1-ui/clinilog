"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return { supabase, user };
}

export async function createInterview(formData: FormData) {
  const { supabase, user } = await requireUser();
  const school = String(formData.get("school_name") ?? "").trim();
  if (!school) return;

  const date = String(formData.get("interview_date") ?? "").trim();
  await supabase.from("interviews").insert({
    user_id: user.id,
    school_name: school,
    format: String(formData.get("format") ?? "Traditional"),
    interview_date: date || null,
    status: String(formData.get("status") ?? "Scheduled"),
    reflection: String(formData.get("reflection") ?? "").trim() || null,
  });
  revalidatePath("/interviews");
}

export async function updateInterview(id: string, formData: FormData) {
  const { supabase } = await requireUser();
  const date = String(formData.get("interview_date") ?? "").trim();
  await supabase
    .from("interviews")
    .update({
      school_name: String(formData.get("school_name") ?? "").trim(),
      format: String(formData.get("format") ?? "Traditional"),
      interview_date: date || null,
      status: String(formData.get("status") ?? "Scheduled"),
      reflection: String(formData.get("reflection") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/interviews");
}

export async function setInterviewStatus(id: string, status: string) {
  const { supabase } = await requireUser();
  await supabase
    .from("interviews")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/interviews");
}

export async function deleteInterview(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("interviews").delete().eq("id", id);
  revalidatePath("/interviews");
}

/** Waitlist movement, logged against a waitlisted interview. */
export async function addWaitlistUpdate(interviewId: string, formData: FormData) {
  const { supabase, user } = await requireUser();
  const note = String(formData.get("note") ?? "").trim();
  if (!note) return;
  const date = String(formData.get("update_date") ?? "").trim();
  await supabase.from("waitlist_updates").insert({
    interview_id: interviewId,
    user_id: user.id,
    update_date: date || new Date().toISOString().slice(0, 10),
    note,
  });
  revalidatePath("/interviews");
}

export async function deleteWaitlistUpdate(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("waitlist_updates").delete().eq("id", id);
  revalidatePath("/interviews");
}
