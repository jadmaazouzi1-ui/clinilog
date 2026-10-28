import { test, expect } from "@playwright/test";
import { autoStartAdvisor, autoStartFor, isNewAccount, META, resumeFor, shouldOfferTour, type TourContext, type TourRow } from "../../src/lib/tour/logic";
import { HELP_ANSWERS, MODULE_BY_ID, TOUR_MODULES } from "../../src/lib/tour/modules";

// Pure rules: no browser, no network, no account.

const NEW: TourContext = { isNew: true, entryCount: 0, hasArchetype: false, hasSchools: false };
const OLD: TourContext = { ...NEW, isNew: false };
const row = (module_id: string, status: TourRow["status"], last_step = 0, updated_at = "2026-10-28T10:00:00Z"): TourRow => ({ module_id, status, last_step, updated_at });

test.describe("tour rules", () => {
  test("a brand-new user is offered the tour exactly once", () => {
    expect(shouldOfferTour([], NEW, true)).toBe(true);
    // Shown: recorded as seen, so it is not offered again.
    expect(shouldOfferTour([row(META.offer, "in_progress")], NEW, true)).toBe(false);
    expect(shouldOfferTour([row(META.offer, "completed")], NEW, true)).toBe(false);
  });

  test("dismissing the offer means it never returns", () => {
    expect(shouldOfferTour([row(META.offer, "dismissed")], NEW, true)).toBe(false);
  });

  test("no offer before onboarding, for existing accounts, or with tips off", () => {
    expect(shouldOfferTour([], NEW, false)).toBe(false);
    expect(shouldOfferTour([], OLD, true)).toBe(false);
    expect(shouldOfferTour([row(META.tipsOff, "completed")], NEW, true)).toBe(false);
  });

  test("each module auto-starts only on the first visit to its page", () => {
    expect(autoStartFor("/import", [], NEW)).toBe("import");
    expect(autoStartFor("/import", [row("import", "completed")], NEW)).toBeNull();
    expect(autoStartFor("/import", [row("import", "dismissed")], NEW)).toBeNull();
    expect(autoStartFor("/import", [row("import", "in_progress")], NEW)).toBeNull();
    for (const [page, id] of [
      ["/applications", "tools-applications"], ["/interviews", "tools-interviews"], ["/recommendations", "tools-letters"],
      ["/outline", "tools-outline"], ["/mock-interview", "tools-mock"], ["/fee-tracker", "tools-fees"],
      ["/gapyear", "tools-gapyear"], ["/postbacc", "tools-postbacc"], ["/profile", "profile"], ["/schools", "schools"],
    ]) {
      expect(autoStartFor(page, [], NEW), page).toBe(id);
      expect(autoStartFor(page, [row(id, "completed")], NEW), page).toBeNull();
    }
  });

  test("existing accounts and tips-off never auto-start anything", () => {
    for (const page of ["/import", "/profile", "/schools", "/dashboard/new", "/applications"]) {
      expect(autoStartFor(page, [], OLD), page).toBeNull();
      expect(autoStartFor(page, [row(META.tipsOff, "completed")], NEW), page).toBeNull();
    }
    expect(autoStartAdvisor([], OLD)).toBe(false);
    expect(autoStartAdvisor([row(META.tipsOff, "completed")], NEW)).toBe(false);
    expect(autoStartAdvisor([], NEW)).toBe(true);
  });

  test("a feature already used skips its auto-start", () => {
    expect(autoStartFor("/dashboard/new", [], { ...NEW, entryCount: 1 })).toBe("logging");
    expect(autoStartFor("/dashboard/new", [], { ...NEW, entryCount: 5 })).toBeNull();
    expect(autoStartFor("/archetype", [], { ...NEW, hasArchetype: true })).toBeNull();
    expect(autoStartFor("/schools", [], { ...NEW, hasSchools: true })).toBeNull();
  });

  test("Overview never forces the overview tour; the card offers it", () => {
    expect(autoStartFor("/dashboard", [], { ...NEW, entryCount: 4 })).toBeNull();
    const answered = [row(META.offer, "dismissed")];
    expect(autoStartFor("/dashboard", answered, { ...NEW, entryCount: 4 })).toBe("managing");
    expect(autoStartFor("/dashboard", [...answered, row("managing", "completed")], { ...NEW, entryCount: 4 })).toBe("exports");
  });

  test("progress resumes at the last step on the page it belongs to", () => {
    const page = (id: string, s: number) => MODULE_BY_ID[id].steps[s]?.page ?? null;
    const rows = [row("logging", "in_progress", 3, "2026-10-28T11:00:00Z")];
    expect(resumeFor("/dashboard/new", rows, NEW, page)).toEqual({ id: "logging", step: 3 });
    expect(resumeFor("/dashboard", rows, NEW, page)).toBeNull();
    expect(resumeFor("/dashboard/new", rows, OLD, page)).toBeNull();
  });

  test("account age decides new vs existing", () => {
    expect(isNewAccount("2026-10-29T00:00:00Z")).toBe(true);
    expect(isNewAccount("2026-05-19T14:35:34Z")).toBe(false);
    expect(isNewAccount(null)).toBe(false);
  });
});

test.describe("tour content", () => {
  // Copy rules from the brief, checked mechanically.
  test("titles have 4 words or fewer and bodies at most 2 sentences", () => {
    for (const m of TOUR_MODULES) {
      for (const s of m.steps) {
        expect(s.title.split(/\s+/).length, `${m.id}: ${s.title}`).toBeLessThanOrEqual(4);
        const sentences = s.body.split(/(?<=[.!?])\s+/).filter(Boolean);
        expect(sentences.length, `${m.id}: ${s.title}`).toBeLessThanOrEqual(2);
      }
    }
  });

  test("modules have 3 to 6 steps, except the one-page tool notes", () => {
    for (const m of TOUR_MODULES) {
      const max = 6;
      const min = m.group === "Application tools" || m.id === "advisor" ? 1 : 3;
      expect(m.steps.length, m.id).toBeGreaterThanOrEqual(min);
      expect(m.steps.length, m.id).toBeLessThanOrEqual(max);
    }
  });

  test("no copy promises admission or uses em dashes", () => {
    const all = [...TOUR_MODULES.flatMap((m) => m.steps.flatMap((s) => [s.title, s.body])), ...HELP_ANSWERS.flatMap((h) => [h.q, h.a])];
    for (const t of all) {
      expect(t, t).not.toMatch(/guarantee|get you in|will get in|ensure admission/i);
      expect(t, t).not.toContain("—");
    }
  });
});
