// Medical-record-style formatters used across the clinical chart UI.

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

/** Parse a YYYY-MM-DD string without tripping the timezone off-by-one. */
function parseLoose(input: string | Date): Date | null {
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    const [y, m, d] = input.split("-").map((s) => parseInt(s, 10));
    return new Date(y, m - 1, d);
  }
  const d = new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Medical record date format: "04 JUL 2026". */
export function formatMedicalDate(input: string | Date | null | undefined): string {
  if (!input) return "--";
  const d = parseLoose(input);
  if (!d) return "--";
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** Full timestamp: "04 JUL 2026 | 04:22" */
export function formatMedicalTimestamp(input: string | Date | null | undefined): string {
  if (!input) return "--";
  const d = parseLoose(input);
  if (!d) return "--";
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${formatMedicalDate(d)} | ${time}`;
}

/** Medical chart-style hours display: "HRS: 072.5" */
export function formatMedicalHours(value: number): string {
  if (!Number.isFinite(value)) return "HRS: ---";
  const rounded = Math.round(value * 10) / 10;
  const intPart = Math.floor(rounded);
  const padded = String(intPart).padStart(3, "0");
  if (rounded % 1 === 0) return `HRS: ${padded}`;
  const decimal = ((rounded * 10) % 10).toFixed(0);
  return `HRS: ${padded}.${decimal}`;
}

/**
 * Patient-ID style record number for an experience: "EXP-0031".
 * `seq` is the entry's 1-based position in the user's own log, ordered by
 * when it was created, so an entry's number never changes as more are added.
 */
export function formatExperienceId(seq: number): string {
  return `EXP-${String(Math.max(1, Math.floor(seq))).padStart(4, "0")}`;
}

/**
 * Build a stable id → record-number map from a user's experiences.
 * Sorted by created_at ascending (falling back to id) so the oldest entry is
 * EXP-0001 regardless of what order the caller fetched them in.
 */
export function buildRecordNumbers(
  experiences: { id: string; created_at?: string | null }[]
): Map<string, string> {
  const ordered = [...experiences].sort((a, b) => {
    const at = a.created_at ?? "";
    const bt = b.created_at ?? "";
    if (at !== bt) return at < bt ? -1 : 1;
    return a.id < b.id ? -1 : 1;
  });
  return new Map(ordered.map((e, i) => [e.id, formatExperienceId(i + 1)]));
}
