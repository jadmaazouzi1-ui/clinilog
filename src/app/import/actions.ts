"use server";

import { createClient } from "@/lib/supabase/server";

export interface ImportRow {
  title: string;
  organization: string;
  type: "shadowing" | "volunteer" | "clinical_work" | "research" | "other";
  start_date: string;
  end_date: string | null;
  hours: number;
  description: string;
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

  const payload = rows.map((r) => ({
    user_id: user.id,
    title: r.title,
    organization: r.organization,
    type: r.type,
    start_date: r.start_date,
    end_date: r.end_date,
    hours: r.hours,
    description: r.description,
    reflection: null,
  }));

  const { error } = await supabase.from("experiences").insert(payload);

  if (error) {
    return { success: false, inserted: 0, error: error.message };
  }

  return { success: true, inserted: rows.length };
}
