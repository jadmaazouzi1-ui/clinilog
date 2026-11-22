"use client";

import { useState, useTransition } from "react";
import { setWeeklySummary } from "./actions";

/** Weekly summary email: on by default, off here or from any email's link. */
export default function WeeklySummaryToggle({ initialOn }: { initialOn: boolean }) {
  const [on, setOn] = useState(initialOn);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function change(next: boolean) {
    setOn(next);
    start(async () => {
      const { ok } = await setWeeklySummary(next);
      if (!ok) setOn(!next);
      setStatus(ok ? "Saved." : "That did not save. Please try again.");
    });
  }

  return (
    <div style={{ marginBottom: "var(--sp-3)" }}>
      <h3 className="text-base" style={{ marginBottom: "var(--sp-1)" }}>Weekly summary</h3>
      <label className="flex items-start gap-3 text-sm" style={{ color: "var(--text)", cursor: "pointer" }}>
        <input type="checkbox" checked={on} disabled={pending} onChange={(e) => change(e.target.checked)} style={{ marginTop: 3 }} />
        <span>
          Email me a weekly summary of the hours I logged
          <span className="block text-xs" style={{ color: "var(--text-muted)", marginTop: 2 }}>
            Sent only in weeks when you add an entry. Every email has a link to turn it off.
          </span>
        </span>
      </label>
      <p className="text-xs" role="status" style={{ color: "var(--text-muted)", marginTop: 4, minHeight: "1em" }}>{status}</p>
    </div>
  );
}
