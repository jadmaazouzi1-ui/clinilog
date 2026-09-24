"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  sanitizeText,
  sanitizeOptional,
  parseHours,
  parseDateNotFuture,
  parseDateAny,
  parseEnum,
  CAPS,
} from "@/lib/sanitize";

const EXPERIENCE_TYPES = ["shadowing", "volunteer", "clinical_work", "research", "other"] as const;

/**
 * A single-day entry cannot exceed 24 hours. Multi-day entries legitimately
 * can, so the cap is only applied when the range covers one day.
 * Returns an error string, or null when the pair is acceptable.
 */
function validateDates(
  start: string | null,
  end: string | null,
  hours: number | null
): string | null {
  if (!start) return "Start date must be a real date and cannot be in the future.";
  if (end && end < start) return "The end date cannot fall before the start date.";
  const singleDay = !end || end === start;
  if (singleDay && hours !== null && hours > 24) {
    return "A single-day entry cannot exceed 24 hours. Add an end date if this ran across several days.";
  }
  return null;
}

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
  const type = parseEnum(formData.get("experience_type"), EXPERIENCE_TYPES, "other");
  const start_date = parseDateNotFuture(formData.get("start_date"));
  const end_date = parseDateAny(formData.get("end_date"));
  const hours = parseHours(formData.get("hours"));
  const description = sanitizeOptional(formData.get("description"), CAPS.description);
  const reflection = sanitizeOptional(formData.get("reflection"), CAPS.reflection);

  if (!title || !organization || hours === null) {
    redirect(`/dashboard?error=${encodeURIComponent("Invalid input: check title, organization, and hours (0.1-1000).")}`);
  }
  const dateError = validateDates(start_date, end_date, hours);
  if (dateError) {
    redirect(`/dashboard?error=${encodeURIComponent(dateError)}`);
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
  const type = parseEnum(formData.get("experience_type"), EXPERIENCE_TYPES, "other");
  const start_date = parseDateNotFuture(formData.get("start_date"));
  const end_date = parseDateAny(formData.get("end_date"));
  const hours = parseHours(formData.get("hours"));
  const description = sanitizeOptional(formData.get("description"), CAPS.description);
  const reflection = sanitizeOptional(formData.get("reflection"), CAPS.reflection);

  if (!title || !organization || hours === null) {
    redirect(`/dashboard/${id}/edit?error=${encodeURIComponent("Invalid input: check title, organization, and hours (0.1-1000).")}`);
  }
  const dateError = validateDates(start_date, end_date, hours);
  if (dateError) {
    redirect(`/dashboard/${id}/edit?error=${encodeURIComponent(dateError)}`);
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
