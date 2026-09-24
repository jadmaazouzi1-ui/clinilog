"use server";

import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";
import {
  sanitizeText,
  sanitizeOptional,
  parseHours,
  parseDateAny,
  parseDateNotFuture,
  parseEnum,
  CAPS,
} from "@/lib/sanitize";

const EXPERIENCE_TYPES = ["shadowing", "volunteer", "clinical_work", "research", "other"] as const;

/** A single import is capped: the daily rate limit bounds how many calls a
 *  user can make, but without this one call could insert unbounded rows. */
const MAX_IMPORT_ROWS = 500;

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

  if (!Array.isArray(rows) || rows.length === 0) {
    return { success: false, inserted: 0, error: "No rows to import" };
  }
  if (rows.length > MAX_IMPORT_ROWS) {
    return {
      success: false,
      inserted: 0,
      error: `That file has ${rows.length} rows. Import up to ${MAX_IMPORT_ROWS} at a time.`,
    };
  }

  const limit = await checkUserRateLimit(supabase, "csv_import");
  if (!limit.allowed) {
    return { success: false, inserted: 0, error: "Daily import limit reached (3/day). Come back tomorrow." };
  }

  const payload = [];
  for (const [i, r] of rows.entries()) {
    const hours = parseHours(r.hours);
    const title = sanitizeText(r.title, CAPS.title);
    const organization = sanitizeText(r.organization, CAPS.organization);
    const start_date = parseDateNotFuture(r.start_date);
    const end_date = parseDateAny(r.end_date);

    if (!title || !organization || hours === null) {
      return {
        success: false,
        inserted: 0,
        error: `Row ${i + 1}: missing title or organization, or hours outside 0.1 to 1000.`,
      };
    }
    if (!start_date) {
      return {
        success: false,
        inserted: 0,
        error: `Row ${i + 1}: start date must be YYYY-MM-DD and cannot be in the future.`,
      };
    }
    if (end_date && end_date < start_date) {
      return { success: false, inserted: 0, error: `Row ${i + 1}: end date falls before the start date.` };
    }
    if ((!end_date || end_date === start_date) && hours > 24) {
      return { success: false, inserted: 0, error: `Row ${i + 1}: a single-day entry cannot exceed 24 hours.` };
    }

    payload.push({
      user_id: user.id,
      title,
      organization,
      // Never trusted: the DB has a CHECK on this column, and an invalid
      // value would otherwise surface as a raw Postgres error.
      type: parseEnum(r.type, EXPERIENCE_TYPES, "other"),
      start_date,
      end_date,
      hours,
      description: sanitizeOptional(r.description, CAPS.description),
      reflection: null,
    });
  }

  const { error } = await supabase.from("experiences").insert(payload);

  if (error) {
    return { success: false, inserted: 0, error: error.message };
  }

  return { success: true, inserted: payload.length };
}
