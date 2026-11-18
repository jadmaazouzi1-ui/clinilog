"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import { Experience, ExperienceType, formatHours } from "@/lib/types";
import { leafPath } from "@/lib/branch";
import { LEAF_KIND } from "@/lib/pathTree";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteering",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

/* Separated by lightness, by the leaf shape beside each label and by the
   label itself, never by hue. */
const COLORS: Record<ExperienceType, string> = {
  clinical_work: "var(--data-1)",
  shadowing:     "var(--data-2)",
  research:      "var(--data-3)",
  volunteer:     "var(--data-4)",
  other:         "var(--data-5)",
};

export default function HoursBreakdown({
  experiences,
}: {
  experiences: Experience[];
}) {
  const totals: Partial<Record<ExperienceType, number>> = {};
  for (const e of experiences) {
    const t = e.type as ExperienceType;
    totals[t] = (totals[t] ?? 0) + e.hours;
  }

  const data = (Object.keys(totals) as ExperienceType[])
    .filter((t) => (totals[t] ?? 0) > 0)
    .map((t) => ({ type: t, label: TYPE_LABELS[t], hours: totals[t]! }))
    .sort((a, b) => b.hours - a.hours);

  const totalHours = data.reduce((s, d) => s + d.hours, 0);

  if (data.length === 0) return null;

  return (
    <section className="card" style={{ padding: "var(--sp-3)" }} aria-labelledby="hours-split-title">
      <div className="flex items-baseline justify-between gap-3" style={{ marginBottom: "var(--sp-2)" }}>
        <h2 className="section-title" id="hours-split-title" style={{ margin: 0 }}>
          Hours by category
        </h2>
        <a href="#recent-experiences" className="link text-xs" data-tour="see-all">
          See entries
        </a>
      </div>

      <div className="flex flex-col sm:flex-row items-center" style={{ gap: "var(--sp-3)" }}>
        {/* Donut chart with center total */}
        <div className="relative w-40 h-40 flex-shrink-0">
          {/* Fixed size: a ResponsiveContainer measures -1 x -1 before layout
              and logs a warning. The box is always 160px square. */}
            <PieChart width={160} height={160}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={67}
                paddingAngle={0}
                dataKey="hours"
                stroke="var(--data-gap)"
                strokeWidth={data.length > 1 ? 2 : 0}
                isAnimationActive={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.type} fill={COLORS[entry.type]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => {
                  const n = Number(value);
                  return [`${n % 1 === 0 ? n : n.toFixed(1)} hrs`, ""];
                }}
                contentStyle={{
                  borderRadius: "var(--radius-control)",
                  border: "1px solid var(--border)",
                  fontSize: "var(--text-xs)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                  boxShadow: "var(--shadow-overlay)",
                }}
              />
            </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="tnum font-semibold text-xl" style={{ color: "var(--text)", lineHeight: 1 }}>
              {formatHours(totalHours)}
            </span>
            <span className="text-xs" style={{ color: "var(--text-muted)", marginTop: 2 }}>
              hours
            </span>
          </div>
        </div>

        {/* Breakdown: labelled rows on hairlines, as on an intake sheet */}
        <div className="flex-1 w-full">
          {data.map((entry) => {
            const pct = Math.round((entry.hours / totalHours) * 100);
            const hrs = formatHours(entry.hours);
            return (
              <div
                key={entry.type}
                className="tnum"
                style={{
                  // Fixed 3-column grid: label takes the slack, and the two
                  // numerics sit in their own narrow columns so the percentage
                  // reads as attached to its hours value instead of drifting
                  // out to the card edge.
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr) auto auto",
                  columnGap: 10,
                  alignItems: "baseline",
                  padding: "var(--sp-1) 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <svg width="12" height="12" viewBox="-1 -7 14 14" aria-hidden="true" style={{ alignSelf: "center" }}>
                  <path
                    d={leafPath(LEAF_KIND[entry.type], 12)}
                    fill={LEAF_KIND[entry.type] === "hollow" ? "none" : COLORS[entry.type]}
                    stroke={LEAF_KIND[entry.type] === "hollow" ? COLORS[entry.type] : "var(--text-muted)"}
                    strokeWidth={LEAF_KIND[entry.type] === "hollow" ? 1.4 : 0.6}
                  />
                </svg>
                <span className="text-sm" style={{ color: "var(--text)" }}>
                  {entry.label}
                </span>
                <span
                  className="tnum text-sm font-semibold text-right"
                  style={{ color: "var(--text)" }}
                >
                  {hrs}
                </span>
                <span className="tnum text-xs text-right" style={{ color: "var(--text-muted)", minWidth: 30 }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
