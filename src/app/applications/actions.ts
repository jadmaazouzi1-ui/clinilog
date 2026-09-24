"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  CAPS,
  parseBoundedInt,
  parseDateAny,
  parseEnum,
  parseMoney,
  sanitizeOptional,
  sanitizeText,
} from "@/lib/sanitize";

const SECONDARY_STATUSES = ["Not Started", "Draft", "Submitted"] as const;
const WAIVER_STATUSES = ["None", "Requested", "Approved", "Denied"] as const;

async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  return { supabase, user };
}

/** Mark a school as Target or Applying. Idempotent per user + school. */
export async function setSchoolStatus(schoolName: string, status: "Target" | "Applying") {
  const { supabase, user } = await requireUser();
  const name = sanitizeText(schoolName, CAPS.schoolName);
  if (!name) return;
  const safeStatus = parseEnum(status, ["Target", "Applying"] as const, "Target");
  await supabase
    .from("school_applications")
    .upsert(
      { user_id: user.id, school_name: name, status: safeStatus, updated_at: new Date().toISOString() },
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

  await supabase
    .from("school_applications")
    .update({
      secondary_prompt: sanitizeOptional(formData.get("secondary_prompt"), CAPS.prompt),
      word_limit: parseBoundedInt(formData.get("word_limit"), 1, 10000),
      secondary_status: parseEnum(formData.get("secondary_status"), SECONDARY_STATUSES, "Not Started"),
      deadline: parseDateAny(formData.get("deadline")),
      secondary_fee: parseMoney(formData.get("secondary_fee"), 5000),
      fee_waiver_status: parseEnum(formData.get("fee_waiver_status"), WAIVER_STATUSES, "None"),
      notes: sanitizeOptional(formData.get("notes"), CAPS.notes),
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
    .update({
      secondary_status: parseEnum(secondary_status, SECONDARY_STATUSES, "Not Started"),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  revalidatePath("/applications");
}
