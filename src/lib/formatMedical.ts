// Medical-record-style formatters used across the Clinical Precision UI.

/** Convert a YYYY-MM-DD string or Date to medical chart format: "2026.02.04". */
export function formatMedicalDate(input: string | Date | null | undefined): string {
  if (!input) return "-";
  let d: Date;
  if (typeof input === "string") {
    // Accept YYYY-MM-DD directly (avoids tz off-by-one)
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      const [y, m, day] = input.split("-").map((s) => parseInt(s, 10));
      return `${y}.${String(m).padStart(2, "0")}.${String(day).padStart(2, "0")}`;
    }
    d = new Date(input);
  } else {
    d = input;
  }
  if (Number.isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

/** Full timestamp: "2026.02.04 | 04:22" */
export function formatMedicalTimestamp(input: string | Date | null | undefined): string {
  if (!input) return "-";
  let d: Date;
  if (typeof input === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
      d = new Date(input + "T00:00:00");
    } else {
      d = new Date(input);
    }
  } else {
    d = input;
  }
  if (Number.isNaN(d.getTime())) return "-";
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${date} | ${time}`;
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
