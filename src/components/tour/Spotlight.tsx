"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MODULE_BY_ID, type SampleKind } from "@/lib/tour/modules";
import { endTour, goToStep, useTour } from "./store";

// A tiny spotlight: four dimmed panels around the target (so the target
// itself stays clickable), a ring, and a tooltip card. No dependency.

const PAD = 6;
const GAP = 12;
const EDGE = 16;
const FIND_TIMEOUT_MS = 1200;

// Which way the user last moved, so a missing step is skipped in that
// direction instead of bouncing back.
let direction: 1 | -1 = 1;

type Rect = { top: number; left: number; width: number; height: number };

function visibleRect(el: Element): Rect | null {
  const r = el.getBoundingClientRect();
  if (r.width < 2 || r.height < 2) return null;
  // Off-canvas, such as a closed slide-in drawer.
  if (r.right <= 0 || r.left >= window.innerWidth) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

function sameRect(a: Rect | null, b: Rect | null) {
  return !!a && !!b && a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

export default function Spotlight() {
  const { active, ctx } = useTour();
  const mod = active ? MODULE_BY_ID[active.id] : null;
  const index = active?.step ?? 0;
  const step = mod?.steps[index];
  const total = mod?.steps.length ?? 0;

  const [target, setTarget] = useState<Element | null>(null);
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardSize, setCardSize] = useState({ w: 340, h: 180 });
  const cardRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function next() {
    direction = 1;
    goToStep(index + 1);
  }
  function back() {
    direction = -1;
    goToStep(index - 1);
  }

  // Find the target, waiting briefly for it to render. Missing means skip.
  useEffect(() => {
    if (!step?.target) return;
    const selector = `[data-tour="${step.target}"]`;
    const started = Date.now();
    let timer: ReturnType<typeof setTimeout>;
    const look = () => {
      const el = document.querySelector(selector);
      if (el && visibleRect(el)) {
        const r = el.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) {
          el.scrollIntoView({ block: r.height > window.innerHeight * 0.7 ? "start" : "center", behavior: reduced ? "auto" : "smooth" });
        }
        setTarget(el);
        return;
      }
      if (Date.now() - started > FIND_TIMEOUT_MS) {
        const to = index + direction;
        goToStep(to < 0 ? index + 1 : to);
        return;
      }
      timer = setTimeout(look, 100);
    };
    look();
    return () => clearTimeout(timer);
  }, [step?.target, index, reduced]);

  // Track the target's position through scrolling, resizing and layout shifts.
  useEffect(() => {
    if (!target) return;
    let frame = 0;
    let last: Rect | null = null;
    const tick = () => {
      const r = visibleRect(target);
      if (!sameRect(r, last)) {
        last = r;
        setRect(r);
      }
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [target]);

  // Advance when the user does the real thing.
  useEffect(() => {
    if (!target || !step?.advanceOn) return;
    const handler = () => setTimeout(next, step.advanceOn === "change" ? 250 : 0);
    target.addEventListener(step.advanceOn, handler, { capture: true });
    return () => target.removeEventListener(step.advanceOn!, handler, { capture: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, step?.advanceOn, index]);

  // Escape closes; Tab stays inside the card.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        endTour("dismissed");
        return;
      }
      if (e.key !== "Tab" || !cardRef.current) return;
      const focusables = cardRef.current.querySelectorAll<HTMLElement>("button:not([disabled])");
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!cardRef.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const ready = !step?.target || !!rect;

  useEffect(() => {
    if (ready) primaryRef.current?.focus({ preventScroll: true });
  }, [ready]);

  useLayoutEffect(() => {
    if (!cardRef.current) return;
    const { offsetWidth: w, offsetHeight: h } = cardRef.current;
    if (w !== cardSize.w || h !== cardSize.h) setCardSize({ w, h });
  }, [index, rect, ready, cardSize.w, cardSize.h]);

  if (!mod || !step || !ready || typeof document === "undefined") return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const hole = rect
    ? {
        top: Math.max(0, rect.top - PAD),
        left: Math.max(0, rect.left - PAD),
        right: Math.min(vw, rect.left + rect.width + PAD),
        bottom: Math.min(vh, rect.top + rect.height + PAD),
      }
    : null;

  // Card placement: below the target, else above, else pinned to the bottom.
  let cardTop: number;
  let cardLeft: number;
  if (!hole) {
    cardTop = Math.max(EDGE, (vh - cardSize.h) / 2);
    cardLeft = (vw - cardSize.w) / 2;
  } else {
    if (hole.bottom + GAP + cardSize.h <= vh - EDGE) cardTop = hole.bottom + GAP;
    else if (hole.top - GAP - cardSize.h >= EDGE) cardTop = hole.top - GAP - cardSize.h;
    else cardTop = vh - cardSize.h - EDGE;
    cardLeft = hole.left;
  }
  cardLeft = Math.min(Math.max(EDGE, cardLeft), vw - cardSize.w - EDGE);
  cardTop = Math.max(EDGE, cardTop);

  const dim = "tour-dim fixed";
  const showSample = !!step.sample && ctx.entryCount === 0;
  const isLast = index === total - 1;

  return createPortal(
    <div className="tour-layer" data-reduced={reduced ? "" : undefined}>
      {hole ? (
        <>
          <div className={dim} style={{ top: 0, left: 0, right: 0, height: hole.top }} />
          <div className={dim} style={{ top: hole.bottom, left: 0, right: 0, bottom: 0 }} />
          <div className={dim} style={{ top: hole.top, left: 0, width: hole.left, height: hole.bottom - hole.top }} />
          <div className={dim} style={{ top: hole.top, left: hole.right, right: 0, height: hole.bottom - hole.top }} />
          <div
            aria-hidden="true"
            className="tour-ring fixed"
            style={{ top: hole.top, left: hole.left, width: hole.right - hole.left, height: hole.bottom - hole.top }}
          />
        </>
      ) : (
        <div className={dim} style={{ inset: 0 }} />
      )}

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        className="tour-card fixed"
        style={{ top: cardTop, left: cardLeft }}
      >
        <p className="exp-id" style={{ marginBottom: 6 }}>
          {mod.title.toUpperCase()} / STEP {String(index + 1).padStart(2, "0")} OF {String(total).padStart(2, "0")}
        </p>
        <h2 id="tour-title" className="text-sm font-bold" style={{ color: "var(--text-primary)", marginBottom: 4 }}>
          {step.title}
        </h2>
        <p id="tour-body" className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {step.body}
        </p>

        {showSample && <Sample kind={step.sample!} />}

        <div className="flex items-center justify-between gap-2 flex-wrap" style={{ marginTop: "var(--sp-2)" }}>
          <div className="flex items-center gap-1">
            <button type="button" className="tour-btn-quiet" onClick={() => endTour("dismissed")}>
              Skip tour
            </button>
            {!isLast && (
              <button type="button" className="tour-btn-quiet" onClick={next}>
                Skip step
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" className="tour-btn" onClick={back} disabled={index === 0}>
              Back
            </button>
            <button ref={primaryRef} type="button" className="tour-btn tour-btn-primary" onClick={next}>
              {isLast ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/** Illustrative only, built from constants, never from the user's account. */
function Sample({ kind }: { kind: SampleKind }) {
  const bars = [
    { label: "CLINICAL", pct: 62 },
    { label: "SHADOWING", pct: 40 },
    { label: "VOLUNTEER", pct: 75 },
  ];
  return (
    <div className="tour-sample" aria-label="Sample preview, not your data">
      <span className="tour-sample-tag">SAMPLE</span>
      {kind === "tracker" &&
        bars.map((b) => (
          <div key={b.label} style={{ marginTop: 6 }}>
            <span className="exp-id">{b.label}</span>
            <div style={{ height: 6, background: "var(--bg-soft)", marginTop: 2 }}>
              <div style={{ width: `${b.pct}%`, height: "100%", background: "var(--accent)" }} />
            </div>
          </div>
        ))}
      {kind === "stats" && (
        <div className="grid grid-cols-2" style={{ gap: 6, marginTop: 6 }}>
          {[["TOTAL HOURS", "124.5"], ["ENTRIES", "06"], ["ORGS", "04"], ["CATEGORIES", "3/5"]].map(([l, v]) => (
            <div key={l} style={{ border: "1px solid var(--border-strong)", padding: "4px 6px" }}>
              <span className="exp-id">{l}</span>
              <p className="mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{v}</p>
            </div>
          ))}
        </div>
      )}
      {kind === "path" && (
        <svg viewBox="0 0 200 70" width="100%" height="70" aria-hidden="true" style={{ marginTop: 6 }}>
          <path d="M10 62 C60 58 90 40 120 34 C150 28 170 18 190 10" stroke="var(--accent)" strokeWidth="4" fill="none" />
          <path d="M80 46 C90 30 100 24 112 16" stroke="var(--accent)" strokeWidth="2.5" fill="none" />
          <circle cx="190" cy="10" r="6" fill="var(--accent)" />
          <circle cx="112" cy="16" r="5" fill="none" stroke="var(--accent)" strokeWidth="2" />
          <rect x="140" y="20" width="8" height="8" transform="rotate(45 144 24)" fill="var(--accent)" />
        </svg>
      )}
    </div>
  );
}
