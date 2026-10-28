"use client";

import { useEffect } from "react";
import { META } from "@/lib/tour/logic";
import { loadTour, openHelp, saveRow, useTour } from "./store";

/** One-time, dismissible note for signed-in users on the Changelog page. */
export default function ChangelogNote() {
  const { loaded, signedIn, rows } = useTour();
  useEffect(() => {
    void loadTour();
  }, []);
  if (!loaded || !signedIn || rows.some((r) => r.module_id === META.changelogNote)) return null;

  return (
    <div
      className="glass-card flex items-center justify-between gap-3 flex-wrap"
      style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-3)", borderLeft: "2px solid var(--accent)" }}
      role="region"
      aria-label="What's new"
    >
      <p className="text-sm" style={{ color: "var(--text-primary)" }}>
        <span className="exp-id" style={{ marginRight: 8 }}>NEW</span>
        Guided tour and Help Center. Open Help any time to replay a tour or ask a question.
      </p>
      <div className="flex items-center gap-2">
        <button type="button" className="tour-btn" onClick={openHelp}>Open Help</button>
        <button type="button" className="tour-btn" onClick={() => saveRow(META.changelogNote, "dismissed")} aria-label="Dismiss this note">
          Dismiss
        </button>
      </div>
    </div>
  );
}
