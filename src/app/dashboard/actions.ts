"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeText, sanitizeOptional, parseHours, parseDateNotFuture, CAPS } from "@/lib/sanitize";

export async function createExperience(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const title = sanitizeText(formData.get("title"), CAPS.title);
  const organization = sanitizeText(formData.get("organization"), CAPS.organization);
  const type = formData.get("experience_type") as string;
  const start_date = parseDateNotFuture(formData.get("start_date"));
  const end_date = (formData.get("end_date") as string) ? (formData.get("end_date") as string) : null;
  const hours = parseHours(formData.get("hours"));
  const description = sanitizeOptional(formData.get("description"), CAPS.description);
  const reflection = sanitizeOptional(formData.get("reflection"), CAPS.reflection);

  if (!title || !organization || hours === null || !start_date) {
    redirect(`/dashboard?error=${encodeURIComponent("Invalid input: check title, organization, hours (0.1-1000), and that the start date is not in the future.")}`);
  }

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

  const title = sanitizeText(formData.get("title"), CAPS.title);
  const organization = sanitizeText(formData.get("organization"), CAPS.organization);
  const type = formData.get("experience_type") as string;
  const start_date = parseDateNotFuture(formData.get("start_date"));
  const end_date = (formData.get("end_date") as string) ? (formData.get("end_date") as string) : null;
  const hours = parseHours(formData.get("hours"));
  const description = sanitizeOptional(formData.get("description"), CAPS.description);
  const reflection = sanitizeOptional(formData.get("reflection"), CAPS.reflection);

  if (!title || !organization || hours === null || !start_date) {
    redirect(`/dashboard/${id}/edit?error=${encodeURIComponent("Invalid input: check title, organization, hours (0.1-1000), and that the start date is not in the future.")}`);
  }

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
