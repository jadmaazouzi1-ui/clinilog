"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { HELP_ANSWERS, TOUR_MODULES } from "@/lib/tour/modules";
import { rowFor, tipsOff } from "@/lib/tour/logic";
import { closeHelp, restartAllTours, setTipsOff, startTour, useTour } from "./store";

const GROUPS = ["Basics", "Application tools", "More"] as const;

export default function HelpCenter() {
  const { rows } = useTour();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [query, setQuery] = useState("");
  const [restarted, setRestarted] = useState(false);
  const off = tipsOff(rows);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeHelp();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const f = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])'
      );
      if (f.length === 0) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, []);

  const answers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return HELP_ANSWERS.slice(0, 5);
    return HELP_ANSWERS.filter((h) => (h.q + " " + h.a).toLowerCase().includes(q));
  }, [query]);

  function replay(id: string) {
    if (id === "advisor") {
      closeHelp();
      window.dispatchEvent(new CustomEvent("cliniclog:open-advisor"));
      setTimeout(() => startTour("advisor", 0), 350);
      return;
    }
    startTour(id, 0);
  }

  return createPortal(
    <>
      <div className="help-scrim" onClick={closeHelp} aria-hidden="true" />
      <div
        ref={panelRef}
        className="help-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-title"
        data-tour="help-center"
      >
        <div
          className="flex items-center justify-between gap-3 px-5 flex-shrink-0"
          style={{ height: 64, borderBottom: "2px solid var(--border-strong)" }}
        >
          <h2 id="help-title" className="text-sm font-bold" style={{ color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Help Center
          </h2>
          <button ref={closeRef} type="button" className="tour-btn" onClick={closeHelp}>
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5" style={{ paddingTop: "var(--sp-2)", paddingBottom: "var(--sp-4)" }}>
          {/* Search */}
          <label htmlFor="help-search" className="dept-header" style={{ display: "block" }}>
            Search how-to answers
          </label>
          <input
            id="help-search"
            type="search"
            className="field-input"
            placeholder="e.g. ongoing, import, delete"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            maxLength={80}
          />
          <div style={{ marginTop: "var(--sp-1)", marginBottom: "var(--sp-3)" }}>
            {answers.length === 0 && (
              <p className="text-xs" style={{ color: "var(--text-tertiary)", padding: "8px 0" }}>
                No answers match. Try another word, or send us a question below.
              </p>
            )}
            {answers.map((h) => (
              <details key={h.q} style={{ borderBottom: "1px solid var(--border)", padding: "8px 0" }}>
                <summary className="text-sm font-semibold" style={{ color: "var(--text-primary)", cursor: "pointer" }}>
                  {h.q}
                </summary>
                <p className="text-sm" style={{ color: "var(--text-secondary)", marginTop: 4 }}>{h.a}</p>
              </details>
            ))}
          </div>

          {/* Replay */}
          <p className="dept-header">Replay a tour</p>
          {GROUPS.map((g) => (
            <div key={g} style={{ marginBottom: "var(--sp-2)" }}>
              <p className="exp-id" style={{ marginBottom: 4 }}>{g.toUpperCase()}</p>
              <ul>
                {TOUR_MODULES.filter((m) => m.group === g).map((m) => {
                  const done = rowFor(rows, m.id)?.status === "completed";
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => replay(m.id)}
                        className="w-full flex items-center justify-between gap-3 text-left"
                        style={{
                          padding: "9px 0",
                          borderBottom: "1px solid var(--border)",
                          background: "transparent",
                          color: "var(--text-primary)",
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <span>{m.title}</span>
                        <span className="mono text-xs" style={{ color: done ? "var(--accent)" : "var(--text-tertiary)" }}>
                          {done ? (
                            <>
                              <span aria-hidden="true">&#10003;</span> DONE
                            </>
                          ) : (
                            `${m.steps.length} STEP${m.steps.length === 1 ? "" : "S"}`
                          )}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Settings */}
          <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: "var(--sp-3)" }}>
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--text-primary)", cursor: "pointer" }}>
              <input type="checkbox" checked={!off} onChange={(e) => setTipsOff(!e.target.checked)} />
              Show tips
            </label>
            <button
              type="button"
              className="tour-btn"
              onClick={async () => {
                await restartAllTours();
                setRestarted(true);
              }}
            >
              Restart all tours
            </button>
          </div>
          {restarted && (
            <p className="text-xs" role="status" style={{ color: "var(--text-secondary)", marginTop: -8, marginBottom: "var(--sp-3)" }}>
              Tours reset. Every module is available to replay.
            </p>
          )}

          <FeedbackForm />

          <p className="dept-header" style={{ marginTop: "var(--sp-3)" }}>More</p>
          <div className="flex gap-5 flex-wrap text-sm">
            <Link href="/privacy" onClick={closeHelp} style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Privacy</Link>
            <Link href="/terms" onClick={closeHelp} style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Terms</Link>
            <Link href="/changelog" onClick={closeHelp} style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Changelog</Link>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}

function FeedbackForm() {
  const [kind, setKind] = useState<"problem" | "idea">("problem");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "sending" | "sent" | "error"; msg?: string }>({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setState({ kind: "sending" });
    try {
      const r = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, message, page: window.location.pathname }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) return setState({ kind: "error", msg: data.error ?? "Could not send. Please try again." });
      setMessage("");
      setState({ kind: "sent" });
    } catch {
      setState({ kind: "error", msg: "Could not send. Please try again." });
    }
  }

  return (
    <form onSubmit={submit}>
      <p className="dept-header">Report a problem or suggest a feature</p>
      <div className="flex gap-4 flex-wrap text-sm" style={{ marginBottom: 8, color: "var(--text-primary)" }}>
        <label className="flex items-center gap-2" style={{ cursor: "pointer" }}>
          <input type="radio" name="fb-kind" checked={kind === "problem"} onChange={() => setKind("problem")} />
          Problem
        </label>
        <label className="flex items-center gap-2" style={{ cursor: "pointer" }}>
          <input type="radio" name="fb-kind" checked={kind === "idea"} onChange={() => setKind("idea")} />
          Idea
        </label>
      </div>
      <label htmlFor="fb-message" className="sr-only-live">Message</label>
      <textarea
        id="fb-message"
        className="field-input resize-none"
        rows={4}
        maxLength={1000}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={kind === "problem" ? "What happened, and on which page?" : "What would help you?"}
      />
      <div className="flex items-center justify-between gap-3" style={{ marginTop: 6 }}>
        <span className="mono text-xs" style={{ color: "var(--text-tertiary)" }}>{message.length}/1000</span>
        <button type="submit" className="tour-btn tour-btn-primary" disabled={state.kind === "sending" || !message.trim()}>
          {state.kind === "sending" ? "Sending" : "Send"}
        </button>
      </div>
      <p className="text-xs" role="status" aria-live="polite" style={{ marginTop: 6, color: state.kind === "error" ? "var(--margin-rule)" : "var(--text-secondary)" }}>
        {state.kind === "sent" ? "Thanks. Your note was sent." : state.kind === "error" ? state.msg : "Up to 3 a day. Please do not include personal health details."}
      </p>
    </form>
  );
}
