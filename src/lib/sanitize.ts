// Server-side input sanitization. React already escapes everything it
// renders, so the goal here is defense in depth: never persist markup,
// enforce length caps, and normalize whitespace before data reaches Supabase.

/** Strip HTML/script tags, collapse control chars, trim, cap length. */
export function sanitizeText(input: unknown, maxLen: number): string {
  if (typeof input !== "string") return "";
  let s = input;
  // Remove complete script/style blocks including their content.
  s = s.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  // Strip any remaining tags but keep their inner text.
  s = s.replace(/<[^>]*>/g, "");
  // Neutralize inline event-handler / javascript: fragments that survive tag stripping.
  s = s.replace(/javascript:/gi, "");
  // Drop control characters except newline/tab.
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  s = s.trim();
  if (s.length > maxLen) s = s.slice(0, maxLen);
  return s;
}

/** Sanitize to string-or-null (for optional columns). */
export function sanitizeOptional(input: unknown, maxLen: number): string | null {
  const s = sanitizeText(input, maxLen);
  return s.length > 0 ? s : null;
}

/** Parse hours: positive finite number, capped. Returns null when invalid. */
export function parseHours(input: unknown, max = 1000): number | null {
  const n = typeof input === "number" ? input : parseFloat(String(input));
  if (!Number.isFinite(n) || n <= 0 || n > max) return null;
  return Math.round(n * 10) / 10;
}

/** Validate YYYY-MM-DD, must be a real date and not in the future. */
export function parseDateNotFuture(input: unknown): string | null {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const d = new Date(input + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (input > todayStr) return null;
  return input;
}

// Standard field caps
export const CAPS = {
  title: 500,
  organization: 100,
  description: 700,
  reflection: 500,
  generic: 500,
  schoolName: 160,
  prompt: 2000,
  notes: 1000,
  personName: 120,
  relationship: 120,
} as const;

/**
 * Parse a bounded integer, returning null when out of range or unparseable.
 * Used for word limits, fees and similar numeric form fields that have no
 * business being negative or enormous.
 */
export function parseBoundedInt(input: unknown, min: number, max: number): number | null {
  const n = typeof input === "number" ? input : parseInt(String(input ?? "").trim(), 10);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return Math.round(n);
}

/** Parse a bounded, non-negative money value rounded to whole units. */
export function parseMoney(input: unknown, max = 100000): number {
  const n = typeof input === "number" ? input : parseFloat(String(input ?? "").trim());
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n * 100) / 100, max);
}

/** Validate a YYYY-MM-DD date, allowing future dates. Returns null if bad. */
export function parseDateAny(input: unknown): string | null {
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const d = new Date(input + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return null;
  // Guard against absurd years that would break date maths downstream.
  const year = parseInt(input.slice(0, 4), 10);
  if (year < 1900 || year > 2200) return null;
  return input;
}

/** One of a fixed allow-list, or the supplied fallback. Never trusts input. */
export function parseEnum<T extends string>(input: unknown, allowed: readonly T[], fallback: T): T {
  const v = String(input ?? "").trim();
  return (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}
