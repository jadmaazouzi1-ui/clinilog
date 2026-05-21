import { Experience, ExperienceType } from "./types";

const CATEGORY_POINTS: Record<ExperienceType, number> = {
  clinical_work: 25,
  shadowing: 20,
  research: 20,
  volunteer: 15,
  other: 10,
};

const LEADERSHIP_KEYWORDS = [
  "led ", "lead ", "leads ", "managed", "manage ", "coordinator", "coordinated",
  "organized", "organizer", "directed", "director", "supervised", "supervisor",
  "trained", "trainer", "mentored", "mentor", "taught", "facilitated",
  "initiated", "developed", "created", "implemented", "established",
  "oversaw", "spearheaded", "launched", "founded",
];

const PATIENT_KEYWORDS = [
  "patient", "bedside", "clinical", "diagnos", "treatment", "treated",
  "nursing", "surgery", "surgical", "physician", "provider", "nurse",
  "hospital", "clinic", "ward", "icu", "er ", "emergency room",
  "physical exam", "vital", "medication", "prescription", "procedure",
  "symptom", "chart", "ehr", "rounds", "triage", "care plan",
];

export interface ExperienceScore {
  total: number;
  breakdown: {
    hours: number;
    category: number;
    descriptionExists: number;
    descriptionDepth: number;
    leadership: number;
    patientContact: number;
  };
}

export function scoreExperience(exp: Pick<Experience, "hours" | "type" | "description">): ExperienceScore {
  const hoursPoints = Math.min(30, Math.floor(exp.hours / 3));
  const categoryPoints = CATEGORY_POINTS[exp.type as ExperienceType] ?? 10;

  const desc = (exp.description ?? "").trim();
  const descLower = desc.toLowerCase();

  const descriptionExists = desc.length > 0 ? 15 : 0;
  const descriptionDepth = desc.length > 100 ? 10 : 0;
  const leadership = LEADERSHIP_KEYWORDS.some((kw) => descLower.includes(kw)) ? 10 : 0;
  const patientContact = PATIENT_KEYWORDS.some((kw) => descLower.includes(kw)) ? 10 : 0;

  const total = Math.min(
    100,
    hoursPoints + categoryPoints + descriptionExists + descriptionDepth + leadership + patientContact
  );

  return {
    total,
    breakdown: {
      hours: hoursPoints,
      category: categoryPoints,
      descriptionExists,
      descriptionDepth,
      leadership,
      patientContact,
    },
  };
}

export function scoreColor(score: number): { color: string; bg: string; border: string; label: string } {
  if (score >= 71) return {
    color: "#10B981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.3)",
    label: "Strong",
  };
  if (score >= 40) return {
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.3)",
    label: "Developing",
  };
  return {
    color: "#FF4757",
    bg: "rgba(255,71,87,0.12)",
    border: "rgba(255,71,87,0.3)",
    label: "Needs Work",
  };
}

export function averageScore(experiences: Pick<Experience, "hours" | "type" | "description">[]): number {
  if (experiences.length === 0) return 0;
  const sum = experiences.reduce((acc, e) => acc + scoreExperience(e).total, 0);
  return Math.round(sum / experiences.length);
}
