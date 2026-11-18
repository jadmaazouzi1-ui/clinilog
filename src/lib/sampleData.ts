import type { Experience, ExperienceType } from "@/lib/types";

// Hard-coded sample for the OG image. It never reads user data.
// Clinical work 64 hrs / 7 entries, Shadowing 24 / 2, Research 12 / 1,
// Volunteering 18 / 4: 118 hours across 14 entries.
const SAMPLE: [ExperienceType, number[]][] = [
  ["clinical_work", [12, 10, 9, 9, 8, 8, 8]],
  ["shadowing", [16, 8]],
  ["research", [12]],
  ["volunteer", [6, 4, 4, 4]],
];

export const SAMPLE_EXPERIENCES: Experience[] = SAMPLE.flatMap(([type, hours]) =>
  hours.map((h, i) => ({ id: `sample-${type}-${i}`, type, hours: h }) as unknown as Experience)
);
export const SAMPLE_TOTAL_HOURS = SAMPLE_EXPERIENCES.reduce((s, e) => s + e.hours, 0);
