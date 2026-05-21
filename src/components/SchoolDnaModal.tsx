"use client";

import { useEffect } from "react";
import { SchoolDna, DNA_FIELDS, ratingToPercent, Rating } from "@/lib/schoolDna";

interface SchoolDnaModalProps {
  schoolName: string;
  state: string;
  mission: string;
  dna: SchoolDna;
  onClose: () => void;
}

function ratingColor(r: Rating) {
  if (r === "High") return "#00D4FF";
  if (r === "Medium") return "rgba(0,212,255,0.55)";
  return "rgba(0,212,255,0.3)";
}

export default function SchoolDnaModal({ schoolName, state, mission, dna, onClose }: SchoolDnaModalProps) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 page-fade-in"
      style={{ backgroundColor: "rgba(0,0,0,0.75)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92vh] overflow-hidden"
        style={{
          backgroundColor: "rgba(10,22,40,0.99)",
          border: "1px solid rgba(0,212,255,0.25)",
          boxShadow: "0 0 60px rgba(0,212,255,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between gap-3 px-6 py-5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,212,255,0.12)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide"
                style={{ background: "rgba(0,212,255,0.12)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.3)" }}
              >
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4c0 4 4 6 8 8s8 4 8 8M20 4c0 4-4 6-8 8s-8 4-8 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
                School DNA
              </span>
            </div>
            <h2 className="text-lg font-bold leading-tight" style={{ color: "#F8FAFC" }}>{schoolName}</h2>
            <p className="text-xs mt-0.5" style={{ color: "rgba(248,250,252,0.5)" }}>
              {state} · {mission}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg flex-shrink-0 hover:bg-white/5 transition-colors"
            style={{ color: "rgba(248,250,252,0.5)" }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Vibe */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2"
              style={{ color: "rgba(0,212,255,0.7)" }}
            >
              The Vibe
            </p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.85)" }}>
              {dna.vibe}
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3.5"
              style={{ backgroundColor: "#1E2A3A", border: "1px solid rgba(0,212,255,0.12)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "rgba(248,250,252,0.5)" }}>
                Primary Care Grads
              </p>
              <p className="text-xl font-bold" style={{ color: "#00D4FF" }}>{dna.primaryCarePercent}%</p>
            </div>
            <div
              className="rounded-xl p-3.5"
              style={{ backgroundColor: "#1E2A3A", border: "1px solid rgba(0,212,255,0.12)" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "rgba(248,250,252,0.5)" }}>
                Avg Debt at Grad
              </p>
              <p className="text-xl font-bold" style={{ color: "#00D4FF" }}>
                ${(dna.avgDebt / 1000).toFixed(0)}k
              </p>
            </div>
          </div>

          {/* Rating bars */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "rgba(0,212,255,0.7)" }}
            >
              Profile Ratings
            </p>
            <div className="space-y-3">
              {DNA_FIELDS.map(({ key, label }) => {
                const rating = dna[key];
                const pct = ratingToPercent(rating);
                const color = ratingColor(rating);
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium" style={{ color: "rgba(248,250,252,0.85)" }}>
                        {label}
                      </span>
                      <span
                        className="text-[10px] font-bold uppercase tracking-wide"
                        style={{ color }}
                      >
                        {rating}
                      </span>
                    </div>
                    <div
                      className="relative h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: "rgba(0,212,255,0.07)" }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color,
                          boxShadow: rating === "High" ? "0 0 8px rgba(0,212,255,0.5)" : "none",
                          transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footnote */}
          <p
            className="text-[10px] leading-relaxed pt-2"
            style={{ color: "rgba(248,250,252,0.35)", borderTop: "1px solid rgba(0,212,255,0.08)" }}
          >
            DNA profiles are compiled from public mission statements, MSAR data, and AAMC reports.
            Treat as directional, not definitive — verify specifics on each school&apos;s admissions page.
          </p>
        </div>
      </div>
    </div>
  );
}
