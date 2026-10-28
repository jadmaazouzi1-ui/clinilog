"use client";

import { useEffect } from "react";
import { META, shouldOfferTour } from "@/lib/tour/logic";
import { markOfferShown, saveRow, startTour, useTour } from "./store";

/**
 * The one-time "Take a 2 minute tour" card, shown on Overview after
 * onboarding. It is recorded as seen the moment it appears, so it never
 * shows again on its own, whatever the user does with it.
 */
export default function TourOffer({ onboardingComplete }: { onboardingComplete: boolean }) {
  const { loaded, signedIn, rows, ctx, offerVisible } = useTour();
  const eligible = loaded && signedIn && shouldOfferTour(rows, ctx, onboardingComplete);
  const answered = rows.some((r) => r.module_id === META.offer && r.status !== "in_progress");

  useEffect(() => {
    if (eligible) markOfferShown();
  }, [eligible]);

  if (!offerVisible || answered) return null;

  return (
    <div
      className="glass-card tick-corners flex items-center justify-between gap-3 flex-wrap"
      style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-3)", borderLeft: "2px solid var(--accent)" }}
      role="region"
      aria-label="Guided tour"
    >
      <div className="min-w-0">
        <p className="exp-id" style={{ marginBottom: 4 }}>NEW HERE</p>
        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Take a 2 minute tour</p>
        <p className="text-xs" style={{ color: "var(--text-secondary)", marginTop: 2 }}>
          A short walk through this page using your real dashboard. You can replay it from Help.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" className="tour-btn" onClick={() => saveRow(META.offer, "dismissed")}>
          Not now
        </button>
        <button
          type="button"
          className="tour-btn tour-btn-primary"
          onClick={() => {
            saveRow(META.offer, "completed");
            startTour("overview", 0);
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}
