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
  clinical_work: "var(--chart-1)",
  shadowing:     "var(--chart-2)",
  research:      "var(--chart-3)",
  volunteer:     "var(--chart-4)",
  other:         "var(--chart-5)",
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
    <div className="glass-card tick-corners" style={{ padding: "var(--sp-2)" }}>
      <div className="flex items-baseline justify-between" style={{ marginBottom: "var(--sp-2)" }}>
        <p className="dept-header" style={{ marginBottom: 0, border: 0, paddingBottom: 0 }}>
          Experience Hours
        </p>
        <a href="#recent-experiences" className="exp-id" style={{ color: "var(--accent-text)" }} data-tour="see-all">
          SEE ALL
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
                stroke="var(--chart-gap)"
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
                  borderRadius: 0,
                  border: "1px solid var(--border-strong)",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                  boxShadow: "none",
                }}
              />
            </PieChart>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="mono font-semibold" style={{ color: "var(--text)", fontSize: "1.5rem", lineHeight: 1 }}>
              {formatHours(totalHours)}
            </span>
            <span style={{ color: "var(--text-subtle)", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>
              total hrs
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
                style={{
                  // Fixed 3-column grid: label takes the slack, and the two
                  // numerics sit in their own narrow columns so the percentage
                  // reads as attached to its hours value instead of drifting
                  // out to the card edge.
                  display: "grid",
                  gridTemplateColumns: "auto minmax(0, 1fr) auto auto",
                  columnGap: 10,
                  alignItems: "baseline",
                  padding: "6px 0",
                  borderBottom: "1px solid var(--hairline)",
                }}
              >
                <svg width="12" height="12" viewBox="-1 -7 14 14" aria-hidden="true" style={{ alignSelf: "center" }}>
                  <path
                    d={leafPath(LEAF_KIND[entry.type], 12)}
                    fill={LEAF_KIND[entry.type] === "hollow" ? "none" : COLORS[entry.type]}
                    stroke={LEAF_KIND[entry.type] === "hollow" ? COLORS[entry.type] : "var(--text-subtle)"}
                    strokeWidth={LEAF_KIND[entry.type] === "hollow" ? 1.4 : 0.6}
                  />
                </svg>
                <span
                  className="text-[11px] font-bold uppercase"
                  style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}
                >
                  {entry.label}
                </span>
                <span
                  className="mono text-sm font-semibold text-right"
                  style={{ color: "var(--text)" }}
                >
                  {hrs}
                </span>
                <span className="mono text-xs text-right" style={{ color: "var(--text-subtle)", minWidth: 30 }}>
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
