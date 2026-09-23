"use client";

import { useState, useTransition } from "react";
import { School } from "@/lib/schools";
import { setSchoolStatus } from "@/app/applications/actions";

/**
 * Per-school Target / Applying controls plus the gap check.
 *
 * GPA and MCAT come from the inputs at the top of the Schools page rather
 * than from the profile, which does not store them. Hours are the user's
 * logged total.
 */
export default function SchoolActions({
  school,
  status,
  gpa,
  mcat,
  clinicalHours,
}: {
  school: School;
  status: "Target" | "Applying" | null;
  gpa: number | null;
  mcat: number | null;
  clinicalHours: number;
}) {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  function mark(next: "Target" | "Applying") {
    start(() => { setSchoolStatus(school.name, next); });
  }

  const gaps = buildGaps(school, gpa, mcat, clinicalHours);

  return (
    <div style={{ marginTop: "var(--sp-1)", paddingTop: "var(--sp-1)", borderTop: "1px dashed var(--border-strong)" }}>
      <div className="flex items-center gap-2 flex-wrap">
        {(["Target", "Applying"] as const).map((s) => (
          <button
            key={s}
            onClick={() => mark(s)}
            disabled={pending}
            className="text-[10px] font-bold uppercase"
            style={{
              padding: "4px 8px",
              letterSpacing: "0.08em",
              borderRadius: "var(--radius)",
              cursor: pending ? "wait" : "pointer",
              border: `1px solid ${status === s ? "var(--accent)" : "var(--border-strong)"}`,
              background: status === s ? "var(--accent-soft)" : "#FFFFFF",
              color: status === s ? "var(--accent)" : "var(--text-tertiary)",
            }}
          >
            {s}
          </button>
        ))}

        {status && gaps.length > 0 && (
          <button
            onClick={() => setOpen(!open)}
            className="text-[10px] font-bold uppercase"
            style={{
              padding: "4px 8px",
              letterSpacing: "0.08em",
              borderRadius: "var(--radius)",
              border: "1px solid var(--border-strong)",
              background: "#FFFFFF",
              color: "var(--text-secondary)",
              cursor: "pointer",
            }}
          >
            {open ? "Hide gap check" : `Gap check (${gaps.filter((g) => g.below).length})`}
          </button>
        )}
      </div>

      {status && open && (
        <div style={{ marginTop: "var(--sp-1)" }}>
          {gaps.map((g) => (
            <div
              key={g.label}
              style={{
                padding: "6px 0 6px 8px",
                borderBottom: "1px solid var(--border)",
                boxShadow: `inset 3px 0 0 -1px ${g.below ? "var(--warning)" : "var(--accent)"}`,
              }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] font-bold uppercase" style={{ letterSpacing: "0.1em", color: "var(--text-secondary)" }}>
                  {g.label}
                </span>
                <span className="mono text-xs" style={{ color: "var(--text-primary)" }}>
                  {g.yours} <span style={{ color: "var(--text-tertiary)" }}>vs {g.theirs}</span>
                </span>
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)", marginTop: 2 }}>{g.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface Gap {
  label: string;
  yours: string;
  theirs: string;
  below: boolean;
  note: string;
}

/**
 * Build the comparison rows. Wording stays specific and non-alarming: it
 * names the distance and one concrete action, and never implies a verdict.
 */
function buildGaps(school: School, gpa: number | null, mcat: number | null, hours: number): Gap[] {
  const gaps: Gap[] = [];

  if (gpa !== null && !Number.isNaN(gpa)) {
    const diff = school.avgGpa - gpa;
    gaps.push({
      label: "GPA",
      yours: gpa.toFixed(2),
      theirs: school.avgGpa.toFixed(2),
      below: diff > 0.05,
      note:
        diff > 0.05
          ? `${diff.toFixed(2)} below their average. An upward trend in recent coursework, or post-bacc credits, carries real weight here.`
          : "At or above their average.",
    });
  }

  if (mcat !== null && !Number.isNaN(mcat)) {
    const diff = school.avgMcat - mcat;
    gaps.push({
      label: "MCAT",
      yours: String(mcat),
      theirs: String(school.avgMcat),
      below: diff > 1,
      note:
        diff > 1
          ? `${diff} point${diff === 1 ? "" : "s"} below their average. Within retake range if you have a section clearly pulling the total down.`
          : "At or above their average.",
    });
  }

  // Schools in this dataset publish GPA and MCAT but not hour expectations,
  // so this row is measured against a general competitive benchmark and
  // labelled as such rather than attributed to the school.
  const BENCHMARK = 150;
  gaps.push({
    label: "Hours (general benchmark)",
    yours: String(Math.round(hours)),
    theirs: `${BENCHMARK}+`,
    below: hours < BENCHMARK,
    note:
      hours < BENCHMARK
        ? `${Math.round(BENCHMARK - hours)} hours short of a typical competitive total. Consistency over time reads better than a late surge.`
        : "Comfortably within a typical competitive range.",
  });

  return gaps;
}
