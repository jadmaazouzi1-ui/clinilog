export type ExperienceType =
  | "shadowing"
  | "volunteer"
  | "clinical_work"
  | "research"
  | "other";

export interface Experience {
  id: string;
  user_id: string;
  title: string;
  organization: string;
  type: ExperienceType;
  start_date: string;
  end_date: string | null;
  hours: number;
  description: string;
  reflection: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Format a raw hour value as a clean display string.
 * - Whole numbers render as integers: 40 → "40"
 * - Decimals are rounded to 1 place: 70.500000001 → "70.5"
 * - Anything that rounds to a whole renders as integer: 70.04 → "70"
 *
 * Use this EVERYWHERE hours are shown to a user. Floating-point summation
 * (e.g. 0.1 + 0.2 = 0.30000000000000004) breaks raw display, so always
 * route through this helper.
 */
export function formatHours(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 10) / 10;
  if (rounded % 1 === 0) return rounded.toString();
  return rounded.toFixed(1);
}

export interface ExperienceFormData {
  title: string;
  organization: string;
  type: ExperienceType;
  start_date: string;
  end_date: string | null;
  hours: number;
  description: string;
  reflection: string | null;
}
