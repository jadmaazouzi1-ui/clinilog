"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { CAPS, parseDateAny, parseEnum, sanitizeOptional, sanitizeText } from "@/lib/sanitize";

const FORMATS = ["MMI", "Traditional"] as const;
const STATUSES = ["Scheduled", "Completed", "Waitlisted", "Accepted", "Rejected"] as const;

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return { supabase, user };
}

export async function createInterview(formData: FormData) {
  const { supabase, user } = await requireUser();
  const school = sanitizeText(formData.get("school_name"), CAPS.schoolName);
  if (!school) return;

  await supabase.from("interviews").insert({
    user_id: user.id,
    school_name: school,
    format: parseEnum(formData.get("format"), FORMATS, "Traditional"),
    interview_date: parseDateAny(formData.get("interview_date")),
    status: parseEnum(formData.get("status"), STATUSES, "Scheduled"),
    reflection: sanitizeOptional(formData.get("reflection"), CAPS.reflection),
  });
  revalidatePath("/interviews");
}

export async function updateInterview(id: string, formData: FormData) {
  const { supabase } = await requireUser();
  const school = sanitizeText(formData.get("school_name"), CAPS.schoolName);
  if (!school) return;
  await supabase
    .from("interviews")
    .update({
      school_name: school,
      format: parseEnum(formData.get("format"), FORMATS, "Traditional"),
      interview_date: parseDateAny(formData.get("interview_date")),
      status: parseEnum(formData.get("status"), STATUSES, "Scheduled"),
      reflection: sanitizeOptional(formData.get("reflection"), CAPS.reflection),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/interviews");
}

export async function setInterviewStatus(id: string, status: string) {
  const { supabase } = await requireUser();
  await supabase
    .from("interviews")
    .update({ status: parseEnum(status, STATUSES, "Scheduled"), updated_at: new Date().toISOString() })
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
  const note = sanitizeText(formData.get("note"), CAPS.notes);
  if (!note) return;
  await supabase.from("waitlist_updates").insert({
    interview_id: interviewId,
    user_id: user.id,
    update_date: parseDateAny(formData.get("update_date")) ?? new Date().toISOString().slice(0, 10),
    note,
  });
  revalidatePath("/interviews");
}

export async function deleteWaitlistUpdate(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("waitlist_updates").delete().eq("id", id);
  revalidatePath("/interviews");
}
