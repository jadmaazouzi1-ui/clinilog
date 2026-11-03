"use client";

import { useState } from "react";

interface Prefs {
  reminders_enabled: boolean;
  gap_days: number;
  pause_in_breaks: boolean;
}
interface Break {
  id: string;
  start_date: string;
  end_date: string;
}

async function send(url: string, init: RequestInit) {
  const r = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } }).catch(() => null);
  const data = r ? await r.json().catch(() => ({})) : {};
  return { ok: !!r && r.ok, data: data as { error?: string; break?: Break } };
}

/** Reminders section in Profile. Off by default; email only. */
export function ReminderSettings({ initial }: { initial: Prefs | null }) {
  const [prefs, setPrefs] = useState<Prefs>(initial ?? { reminders_enabled: false, gap_days: 14, pause_in_breaks: true });
  const [status, setStatus] = useState<string | null>(null);

  async function save(patch: Partial<Prefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    const { ok, data } = await send("/api/notifications", { method: "POST", body: JSON.stringify({ ...patch, answeringOffer: true }) });
    setStatus(ok ? "Saved." : data.error ?? "That did not save. Please try again.");
    if (!ok) setPrefs(prefs);
  }

  return (
    <div id="reminders">
      <p className="dept-header">Reminders</p>
      <label className="flex items-start gap-3 text-sm" style={{ color: "var(--text)", cursor: "pointer" }}>
        <input type="checkbox" checked={prefs.reminders_enabled} onChange={(e) => save({ reminders_enabled: e.target.checked })} style={{ marginTop: 3 }} />
        <span>
          Email me after a gap in logging
          <span className="block text-xs" style={{ color: "var(--text-subtle)", marginTop: 2 }}>
            At most one email every 14 days, and none after 3 in a row until you log something. Off unless you turn it on.
          </span>
        </span>
      </label>

      <fieldset disabled={!prefs.reminders_enabled} style={{ marginTop: "var(--sp-2)", opacity: prefs.reminders_enabled ? 1 : 0.55 }}>
        <legend className="text-sm" style={{ color: "var(--text)", marginBottom: 6 }}>Send after</legend>
        <div className="flex gap-4 flex-wrap text-sm" style={{ color: "var(--text)" }}>
          {[7, 14, 30].map((d) => (
            <label key={d} className="flex items-center gap-2" style={{ cursor: "pointer" }}>
              <input type="radio" name="gap_days" checked={prefs.gap_days === d} onChange={() => save({ gap_days: d })} />
              {d} days without an entry
            </label>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm" style={{ color: "var(--text)", marginTop: "var(--sp-2)", cursor: "pointer" }}>
          <input type="checkbox" checked={prefs.pause_in_breaks} onChange={(e) => save({ pause_in_breaks: e.target.checked })} />
          Pause during breaks (days in a saved break do not count toward the gap)
        </label>
      </fieldset>
      <p className="text-xs" style={{ color: "var(--text-subtle)", marginTop: "var(--sp-1)" }}>
        Nothing is ever sent during a saved break. Emails include entry titles, dates and totals, never your descriptions.
      </p>
      {status && <p className="text-xs" role="status" style={{ color: "var(--text-muted)", marginTop: 6 }}>{status}</p>}
    </div>
  );
}

/** Breaks section in Profile. Dates only; no reason is asked for. */
export function BreakSettings({ initial }: { initial: Break[] }) {
  const [breaks, setBreaks] = useState<Break[]>(initial);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const { ok, data } = await send("/api/breaks", { method: "POST", body: JSON.stringify({ start_date: start, end_date: end }) });
    if (!ok || !data.break) return setStatus(data.error ?? "That did not save. Please try again.");
    setBreaks((b) => [data.break!, ...b].sort((x, y) => y.start_date.localeCompare(x.start_date)));
    setStart("");
    setEnd("");
    setStatus("Break saved.");
  }

  async function remove(id: string) {
    const { ok } = await send(`/api/breaks?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (ok) setBreaks((b) => b.filter((x) => x.id !== id));
    setStatus(ok ? "Break removed." : "That did not save. Please try again.");
  }

  return (
    <div style={{ marginTop: "var(--sp-4)" }}>
      <p className="dept-header">Breaks</p>
      <p className="text-xs" style={{ color: "var(--text-subtle)", marginBottom: "var(--sp-2)" }}>
        Save time away, such as a summer, study abroad or leave. Gap checks and reminders ignore these dates. Up to 20.
      </p>
      <form onSubmit={add} className="flex items-end gap-3 flex-wrap">
        <label className="text-xs" style={{ color: "var(--text-muted)" }}>
          Start
          <input type="date" required value={start} onChange={(e) => setStart(e.target.value)} className="field-input" style={{ display: "block" }} />
        </label>
        <label className="text-xs" style={{ color: "var(--text-muted)" }}>
          End
          <input type="date" required value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} className="field-input" style={{ display: "block" }} />
        </label>
        <button type="submit" className="tour-btn" disabled={breaks.length >= 20}>Add break</button>
      </form>
      {breaks.length > 0 && (
        <ul style={{ marginTop: "var(--sp-2)" }}>
          {breaks.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3" style={{ padding: "8px 0", borderBottom: "1px solid var(--hairline)" }}>
              <span className="mono text-sm" style={{ color: "var(--text)" }}>{b.start_date} to {b.end_date}</span>
              <button type="button" className="text-xs" style={{ color: "var(--text-subtle)", textDecoration: "underline", minHeight: 32 }} onClick={() => remove(b.id)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {status && <p className="text-xs" role="status" style={{ color: "var(--text-muted)", marginTop: 6 }}>{status}</p>}
    </div>
  );
}
