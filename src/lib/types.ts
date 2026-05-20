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
