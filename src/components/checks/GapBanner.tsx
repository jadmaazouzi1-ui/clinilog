"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Shown when the time since the last entry passes the user's gap setting
 * (14 days if they have none). Dismissable for 7 days. The first time it
 * appears for someone who has never answered, it also offers email reminders.
 */
export default function GapBanner({ days, offerReminders }: { days: number; offerReminders: boolean }) {
  const [gone, setGone] = useState(false);
  const [offer, setOffer] = useState(offerReminders);
  const [note, setNote] = useState<string | null>(null);
  if (gone) return null;

  async function post(url: string, body: object) {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    return !!r && r.ok;
  }

  async function answer(on: boolean) {
    const ok = await post("/api/notifications", on ? { reminders_enabled: true, answeringOffer: true } : { answeringOffer: true });
    setOffer(false);
    setNote(ok ? (on ? "Reminders are on. Change them in Profile." : null) : "That did not save. You can set reminders in Profile.");
  }

  return (
    <div
      role="region"
      aria-label="Time since last entry"
      style={{
        padding: "10px var(--sp-2)",
        border: "1px solid var(--border-strong)",
        borderLeft: "2px solid var(--warning)",
        background: "var(--bg-card)",
        marginBottom: "var(--sp-2)",
      }}
    >
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm" style={{ color: "var(--text-primary)" }}>
          <span className="exp-id" style={{ marginRight: 8 }}>{days}D SINCE LAST ENTRY</span>
          Hours are easiest to log while you still remember the details.
        </p>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/new" className="btn-ghost text-xs font-semibold" style={{ padding: "6px var(--sp-2)", textDecoration: "none" }}>
            Log new hours
          </Link>
          <button
            type="button"
            className="text-xs"
            style={{ color: "var(--text-tertiary)", textDecoration: "underline", minHeight: 32 }}
            onClick={async () => {
              setGone(true);
              await post("/api/findings/dismiss", { key: "banner:gap", mode: "7d" });
            }}
          >
            Hide for 7 days
          </button>
        </div>
      </div>
      {offer && (
        <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed var(--border-strong)" }}>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Want an email if you go 14 days without logging? You can change or stop it any time.</p>
          <button type="button" className="tour-btn tour-btn-primary" onClick={() => answer(true)}>Email me</button>
          <button type="button" className="tour-btn" onClick={() => answer(false)}>No thanks</button>
        </div>
      )}
      {note && <p className="text-xs" role="status" style={{ color: "var(--text-secondary)", marginTop: 6 }}>{note}</p>}
    </div>
  );
}
