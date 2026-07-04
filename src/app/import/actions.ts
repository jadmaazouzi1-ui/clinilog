"use server";

import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";
import { sanitizeText, sanitizeOptional, parseHours, CAPS } from "@/lib/sanitize";

export interface ImportRow {
  title: string;
  organization: string;
  type: "shadowing" | "volunteer" | "clinical_work" | "research" | "other";
  start_date: string;
  end_date: string | null;
  hours: number;
  description: string | null;
}

export interface ImportResult {
  success: boolean;
  inserted: number;
  error?: string;
}

export async function bulkImportExperiences(rows: ImportRow[]): Promise<ImportResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, inserted: 0, error: "Not authenticated" };

  if (!rows || rows.length === 0) {
    return { success: false, inserted: 0, error: "No rows to import" };
  }

  const limit = await checkUserRateLimit(supabase, "csv_import");
  if (!limit.allowed) {
    return { success: false, inserted: 0, error: "Daily import limit reached (3/day). Come back tomorrow." };
  }

  const payload = [];
  for (const r of rows) {
    const hours = parseHours(r.hours);
    const title = sanitizeText(r.title, CAPS.title);
    const organization = sanitizeText(r.organization, CAPS.organization);
    if (!title || !organization || hours === null) {
      return { success: false, inserted: 0, error: "Import contains invalid rows (missing title/organization or invalid hours)." };
    }
    payload.push({
      user_id: user.id,
      title,
      organization,
      type: r.type,
      start_date: r.start_date,
      end_date: r.end_date,
      hours,
      description: sanitizeOptional(r.description, CAPS.description),
      reflection: null,
    });
  }

  const { error } = await supabase.from("experiences").insert(payload);

  if (error) {
    return { success: false, inserted: 0, error: error.message };
  }

  return { success: true, inserted: rows.length };
}
