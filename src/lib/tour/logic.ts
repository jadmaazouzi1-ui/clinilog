// Pure decision rules for the guided tour, kept free of React and Supabase so
// they can be unit tested directly.

export type TourStatus = "not_started" | "in_progress" | "completed" | "dismissed";

export interface TourRow {
  module_id: string;
  status: TourStatus;
  last_step: number;
  updated_at?: string;
}

export interface TourContext {
  /** Account created after the tour launched. Older accounts never auto-start. */
  isNew: boolean;
  entryCount: number;
  hasArchetype: boolean;
  hasSchools: boolean;
}

/** Settings stored as reserved rows in tour_progress. */
export const META = {
  offer: "_offer",
  tipsOff: "_tips_off",
  changelogNote: "_changelog_note",
} as const;

/** Accounts created before this moment are "existing users". */
export const TOUR_LAUNCH = "2026-10-28T00:00:00Z";

export function isNewAccount(createdAt: string | null | undefined): boolean {
  return !!createdAt && new Date(createdAt).getTime() >= new Date(TOUR_LAUNCH).getTime();
}

export function rowFor(rows: TourRow[], id: string): TourRow | undefined {
  return rows.find((r) => r.module_id === id);
}

export function tipsOff(rows: TourRow[]): boolean {
  return rowFor(rows, META.tipsOff)?.status === "completed";
}

/** Has this module ever been started, finished or dismissed? */
export function touched(rows: TourRow[], id: string): boolean {
  const r = rowFor(rows, id);
  return !!r && r.status !== "not_started";
}

/** The one-time "Take a 2 minute tour" card on Overview. */
export function shouldOfferTour(rows: TourRow[], ctx: TourContext, onboardingComplete: boolean): boolean {
  return ctx.isNew && onboardingComplete && !tipsOff(rows) && !touched(rows, META.offer) && !touched(rows, "overview");
}

/**
 * Which module, if any, starts by itself on this page. One at most per page
 * view, never for existing accounts, never with tips off, and never one the
 * user has seen before or whose feature they have already used.
 */
export function autoStartFor(pathname: string, rows: TourRow[], ctx: TourContext): string | null {
  if (!ctx.isNew || tipsOff(rows)) return null;
  const fresh = (id: string) => !touched(rows, id);

  const byPage: Record<string, () => string | null> = {
    // Onboarding may file one entry, so "already used" means a second one.
    "/dashboard/new": () => (fresh("logging") && ctx.entryCount <= 1 ? "logging" : null),
    "/dashboard": () => {
      // The Overview tour is offered by the card, never forced.
      if (!touched(rows, META.offer) && !touched(rows, "overview")) return null;
      if (fresh("managing") && ctx.entryCount >= 2) return "managing";
      if (fresh("exports") && ctx.entryCount >= 3 && touched(rows, "managing")) return "exports";
      return null;
    },
    "/import": () => (fresh("import") ? "import" : null),
    "/archetype": () => (fresh("archetype") && !ctx.hasArchetype ? "archetype" : null),
    "/schools": () => (fresh("schools") && !ctx.hasSchools ? "schools" : null),
    "/profile": () => (fresh("profile") ? "profile" : null),
    "/applications": () => (fresh("tools-applications") ? "tools-applications" : null),
    "/interviews": () => (fresh("tools-interviews") ? "tools-interviews" : null),
    "/recommendations": () => (fresh("tools-letters") ? "tools-letters" : null),
    "/outline": () => (fresh("tools-outline") ? "tools-outline" : null),
    "/mock-interview": () => (fresh("tools-mock") ? "tools-mock" : null),
    "/fee-tracker": () => (fresh("tools-fees") ? "tools-fees" : null),
    "/gapyear": () => (fresh("tools-gapyear") ? "tools-gapyear" : null),
    "/postbacc": () => (fresh("tools-postbacc") ? "tools-postbacc" : null),
  };
  return byPage[pathname]?.() ?? null;
}

/** The advisor module starts the first time the advisor panel opens. */
export function autoStartAdvisor(rows: TourRow[], ctx: TourContext): boolean {
  return ctx.isNew && !tipsOff(rows) && !touched(rows, "advisor");
}

/**
 * A module left midway, to resume on this page. Most recent first. Only for
 * accounts that get automatic tips; replays are resumed by the caller.
 */
export function resumeFor(
  pathname: string,
  rows: TourRow[],
  ctx: TourContext,
  stepPage: (moduleId: string, step: number) => string | null
): { id: string; step: number } | null {
  if (!ctx.isNew || tipsOff(rows)) return null;
  const open = rows
    .filter((r) => r.status === "in_progress" && !r.module_id.startsWith("_"))
    .sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""));
  for (const r of open) {
    if (stepPage(r.module_id, r.last_step) === pathname) return { id: r.module_id, step: r.last_step };
  }
  return null;
}
