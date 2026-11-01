import type { CheckEntry, CheckBreak } from "../../src/lib/checks";

export const NOW = new Date("2026-11-01T22:00:00Z");

let n = 0;
export function entry(p: Partial<CheckEntry> & Pick<CheckEntry, "type" | "hours" | "start_date">): CheckEntry & { created_at: string } {
  n++;
  return {
    id: `e${n}`,
    title: p.title ?? `Entry ${n}`,
    organization: p.organization ?? `Org ${n}`,
    end_date: p.end_date === undefined ? p.start_date : p.end_date,
    hasDescription: p.hasDescription ?? true,
    updated_at: p.updated_at ?? (p.end_date ?? p.start_date) + "T12:00:00Z",
    created_at: (p.updated_at ?? p.end_date ?? p.start_date) + "T12:00:00Z",
    ...p,
  } as CheckEntry & { created_at: string };
}

/** Ava: applying May 2027 (6 months away). Thin shadowing, one stale ongoing entry. */
export const AVA = {
  graduationYear: 2028,
  targetDate: "2027-05-01",
  breaks: [] as CheckBreak[],
  entries: [
    entry({ title: "ED scribe", organization: "Atrium Health", type: "clinical_work", hours: 60, start_date: "2026-01-10", end_date: "2026-09-30" }),
    entry({ title: "Clinic volunteer", organization: "Atrium Health", type: "clinical_work", hours: 20, start_date: "2026-02-01", end_date: "2026-10-15" }),
    entry({ title: "Hospice visits", organization: "Trellis", type: "clinical_work", hours: 10, start_date: "2026-03-01", end_date: "2026-05-01" }),
    entry({ title: "Lab assistant", organization: "WFU Biology", type: "research", hours: 15, start_date: "2026-01-20", end_date: null, updated_at: "2026-05-20", hasDescription: false }),
    entry({ title: "Food bank", organization: "Second Harvest", type: "volunteer", hours: 30, start_date: "2025-09-01", end_date: "2026-04-01", hasDescription: false }),
    entry({ title: "Tutoring", organization: "Campus Kitchen", type: "volunteer", hours: 25, start_date: "2025-09-01", end_date: "2026-04-01", hasDescription: false }),
  ],
};

/** Ben: first-year, graduates 2030, one small entry. */
export const BEN = {
  graduationYear: 2030,
  targetDate: null,
  breaks: [] as CheckBreak[],
  entries: [entry({ title: "Hospital volunteer", organization: "Baptist", type: "volunteer", hours: 5, start_date: "2026-10-01" })],
};

/** Cara: applying Jan 2027, data problems, a summer break inside a clinical gap. */
export const CARA = {
  graduationYear: 2027,
  targetDate: "2027-01-15",
  breaks: [{ start_date: "2026-06-15", end_date: "2026-08-15" }],
  entries: [
    entry({ title: "CNA shifts", organization: "Brookdale", type: "clinical_work", hours: 140, start_date: "2025-06-01", end_date: "2026-06-01" }),
    entry({ title: "Cardiology shadowing", organization: "Novant", type: "shadowing", hours: 30, start_date: "2026-03-02", end_date: "2026-03-02" }),
    entry({ title: "Research poster", organization: "WFU Chemistry", type: "research", hours: 40, start_date: "2026-05-01", end_date: "2026-04-01" }),
    entry({ title: "Habitat build", organization: "Habitat", type: "volunteer", hours: 45, start_date: "2026-02-01", end_date: "2026-05-01" }),
    entry({ title: "Club president", organization: "AMSA", type: "other", hours: 20, start_date: "2025-09-01", end_date: "2026-05-01" }),
  ],
};
