"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function upsertProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const full_name = formData.get("full_name") as string;
  const undergraduate_school = formData.get("undergraduate_school") as string;
  const graduation_year_raw = formData.get("graduation_year") as string;
  const graduation_year = graduation_year_raw
    ? parseInt(graduation_year_raw, 10)
    : null;
  const intended_specialty = formData.get("intended_specialty") as string;

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
