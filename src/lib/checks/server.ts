import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Experience } from "../types";
import { computeFindings, visibleFindings, type CheckBreak, type CheckEntry, type Dismissal, type Finding } from "./index";
import type { ReminderPrefs } from "./reminder";

export interface ChecksContext {
  findings: Finding[];
  visible: Finding[];
  dismissals: Dismissal[];
  breaks: (CheckBreak & { id: string })[];
  prefs: ReminderPrefs | null;
}

export function toCheckEntries(experiences: Experience[]): CheckEntry[] {
  return experiences.map((e) => ({
    id: e.id,
    title: e.title,
    organization: e.organization,
    type: e.type,
    start_date: e.start_date,
    end_date: e.end_date,
    hours: Number(e.hours),
    hasDescription: !!e.description && e.description.trim().length > 0,
    updated_at: e.updated_at ?? e.created_at,
  }));
}

/**
 * Everything the dashboard needs for the Application check, read under the
 * user's own session (RLS). Computing is a single pass over entries the page
 * has already loaded, so it runs on every render and is never stale. If the
 * new tables are missing (migration not yet run) it degrades to "no breaks,
 * no dismissals, no prefs" instead of failing the page.
 */
export async function loadChecks(
  supabase: SupabaseClient,
  userId: string,
  experiences: Experience[],
  profile: { graduation_year: number | null; amcas_target_date: string | null } | null
): Promise<ChecksContext> {
  const [d, b, p] = await Promise.all([
    supabase.from("finding_dismissals").select("finding_key, dismissed_until, permanent").eq("user_id", userId),
    supabase.from("user_breaks").select("id, start_date, end_date").eq("user_id", userId).order("start_date", { ascending: false }),
    supabase.from("notification_prefs").select("reminders_enabled, gap_days, pause_in_breaks, unsubscribed_at").eq("user_id", userId).maybeSingle(),
  ]);
  const dismissals = (d.data ?? []) as Dismissal[];
  const breaks = (b.data ?? []) as (CheckBreak & { id: string })[];
  const prefs = (p.data ?? null) as ReminderPrefs | null;
  const now = new Date();

  const findings = computeFindings({
    entries: toCheckEntries(experiences),
    graduationYear: profile?.graduation_year ?? null,
    targetDate: profile?.amcas_target_date ?? null,
    breaks,
    now,
  });
  return { findings, visible: visibleFindings(findings, dismissals, now), dismissals, breaks, prefs };
}
