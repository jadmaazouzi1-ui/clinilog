"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createExperience(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const title = formData.get("title") as string;
  const organization = formData.get("organization") as string;
  const type = formData.get("experience_type") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = (formData.get("end_date") as string) || null;
  const hours = parseFloat(formData.get("hours") as string);
  const description = formData.get("description") as string;
  const reflection = (formData.get("reflection") as string) || null;

  const { error } = await supabase.from("experiences").insert({
    user_id: user.id,
    title,
    organization,
    type,
    start_date,
    end_date,
    hours,
    description,
    reflection,
  });

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}

export async function updateExperience(id: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const title = formData.get("title") as string;
  const organization = formData.get("organization") as string;
  const type = formData.get("experience_type") as string;
  const start_date = formData.get("start_date") as string;
  const end_date = (formData.get("end_date") as string) || null;
  const hours = parseFloat(formData.get("hours") as string);
  const description = formData.get("description") as string;
  const reflection = (formData.get("reflection") as string) || null;

  const { error } = await supabase
    .from("experiences")
    .update({
      title,
      organization,
      type,
      start_date,
      end_date,
      hours,
      description,
      reflection,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/dashboard/${id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/dashboard/${id}`);
}

export async function deleteExperience(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { error } = await supabase
    .from("experiences")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/dashboard?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/dashboard");
}
