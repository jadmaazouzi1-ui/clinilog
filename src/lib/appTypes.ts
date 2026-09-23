/* Application-cycle record types, mirroring the Supabase schema. */

export type ApplicationStatus = "Target" | "Applying";
export type SecondaryStatus = "Not Started" | "Draft" | "Submitted";
export type FeeWaiverStatus = "None" | "Requested" | "Approved" | "Denied";

export interface SchoolApplication {
  id: string;
  user_id: string;
  school_name: string;
  school_id: string | null;
  status: ApplicationStatus;
  secondary_prompt: string | null;
  word_limit: number | null;
  secondary_status: SecondaryStatus;
  deadline: string | null;
  secondary_fee: number | null;
  fee_waiver_status: FeeWaiverStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type InterviewFormat = "MMI" | "Traditional";
export type InterviewStatus =
  | "Scheduled"
  | "Completed"
  | "Waitlisted"
  | "Accepted"
  | "Rejected";

export interface Interview {
  id: string;
  user_id: string;
  school_name: string;
  format: InterviewFormat;
  interview_date: string | null;
  status: InterviewStatus;
  reflection: string | null;
  created_at: string;
  updated_at: string;
}

export interface WaitlistUpdate {
  id: string;
  interview_id: string;
  user_id: string;
  update_date: string;
  note: string | null;
  created_at: string;
}

export type RecommendationStatus = "Requested" | "In Progress" | "Submitted";

export interface Recommendation {
  id: string;
  user_id: string;
  recommender_name: string;
  relationship: string | null;
  date_requested: string | null;
  status: RecommendationStatus;
  assigned_schools: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const SECONDARY_STATUSES: SecondaryStatus[] = ["Not Started", "Draft", "Submitted"];
export const FEE_WAIVER_STATUSES: FeeWaiverStatus[] = ["None", "Requested", "Approved", "Denied"];
export const INTERVIEW_FORMATS: InterviewFormat[] = ["Traditional", "MMI"];
export const INTERVIEW_STATUSES: InterviewStatus[] = [
  "Scheduled",
  "Completed",
  "Waitlisted",
  "Accepted",
  "Rejected",
];
export const RECOMMENDATION_STATUSES: RecommendationStatus[] = [
  "Requested",
  "In Progress",
  "Submitted",
];

/** AMCAS primary application fee, first school included. */
export const AMCAS_PRIMARY_FEE = 175;
/** Each additional school designated on the primary. */
export const AMCAS_PER_SCHOOL_FEE = 46;

/**
 * AMCAS opens the first business week of May. Default to 1 May of the next
 * cycle the user has not yet passed, so the countdown never reads negative.
 */
export function defaultAmcasTarget(now: Date = new Date()): string {
  const year = now.getMonth() > 4 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-05-01`;
}

export function daysUntil(dateStr: string, now: Date = new Date()): number {
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  const target = new Date(y, m - 1, d);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}
