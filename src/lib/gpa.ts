// Standard US 4.0 GPA grade conversion table used by AMCAS.
export const GRADE_POINTS: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0, "W": NaN, "WF": 0.0, "P": NaN, "NP": NaN,
};

export const GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F", "W", "P", "NP"];

export function gradeToPoints(grade: string): number | null {
  const v = GRADE_POINTS[grade.toUpperCase()];
  if (v === undefined || Number.isNaN(v)) return null;
  return v;
}

export function calcGpa(items: { credits: number; grade: string }[]): number | null {
  let totalCredits = 0;
  let totalPoints = 0;
  for (const c of items) {
    const pts = gradeToPoints(c.grade);
    if (pts === null) continue;
    totalCredits += c.credits;
    totalPoints += pts * c.credits;
  }
  if (totalCredits === 0) return null;
  return totalPoints / totalCredits;
}

export function formatGpa(value: number | null): string {
  if (value === null) return "-";
  return value.toFixed(2);
}
