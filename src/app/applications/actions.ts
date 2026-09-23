"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return { supabase, user };
}

/** Mark a school as Target or Applying. Idempotent per user + school. */
export async function setSchoolStatus(schoolName: string, status: "Target" | "Applying") {
  const { supabase, user } = await requireUser();
  await supabase
    .from("school_applications")
    .upsert(
      { user_id: user.id, school_name: schoolName, status, updated_at: new Date().toISOString() },
      { onConflict: "user_id,school_name" }
    );
  revalidatePath("/applications");
  revalidatePath("/schools");
}

export async function removeSchool(id: string) {
  const { supabase } = await requireUser();
  await supabase.from("school_applications").delete().eq("id", id);
  revalidatePath("/applications");
  revalidatePath("/schools");
}

/** Update the secondary-essay fields and budget line for one school. */
export async function updateApplication(id: string, formData: FormData) {
  const { supabase } = await requireUser();

  const wordLimitRaw = String(formData.get("word_limit") ?? "").trim();
  const feeRaw = String(formData.get("secondary_fee") ?? "").trim();
  const deadline = String(formData.get("deadline") ?? "").trim();

  await supabase
    .from("school_applications")
    .update({
      secondary_prompt: String(formData.get("secondary_prompt") ?? "").trim() || null,
      word_limit: wordLimitRaw ? Number(wordLimitRaw) : null,
      secondary_status: String(formData.get("secondary_status") ?? "Not Started"),
      deadline: deadline || null,
      secondary_fee: feeRaw ? Number(feeRaw) : 0,
      fee_waiver_status: String(formData.get("fee_waiver_status") ?? "None"),
      notes: String(formData.get("notes") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/applications");
}

/** Quick status cycle from the list view, without opening the editor. */
export async function setSecondaryStatus(id: string, secondary_status: string) {
  const { supabase } = await requireUser();
  await supabase
    .from("school_applications")
    .update({ secondary_status, updated_at: new Date().toISOString() })
    .eq("id", id);
  revalidatePath("/applications");
}
