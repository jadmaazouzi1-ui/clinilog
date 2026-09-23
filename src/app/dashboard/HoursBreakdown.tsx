"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Experience, ExperienceType, formatHours } from "@/lib/types";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteering",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

const COLORS: Record<ExperienceType, string> = {
  clinical_work: "var(--cat-clinical)",
  shadowing:     "var(--cat-shadowing)",
  research:      "var(--cat-research)",
  volunteer:     "var(--cat-volunteer)",
  other:         "var(--cat-other)",
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
        <a href="#recent-experiences" className="exp-id" style={{ color: "var(--accent)" }}>
          SEE ALL
        </a>
      </div>

      <div className="flex flex-col sm:flex-row items-center" style={{ gap: "var(--sp-3)" }}>
        {/* Donut chart with center total */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={data.length > 1 ? 3 : 0}
                dataKey="hours"
                strokeWidth={0}
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
                  borderRadius: 3,
                  border: "1px solid var(--border-strong)",
                  fontSize: "12px",
                  fontFamily: "var(--font-mono)",
                  backgroundColor: "#FFFFFF",
                  color: "var(--text-primary)",
                  boxShadow: "none",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="mono font-semibold" style={{ color: "var(--text-primary)", fontSize: "1.5rem", lineHeight: 1 }}>
              {formatHours(totalHours)}
            </span>
            <span style={{ color: "var(--text-tertiary)", fontSize: "0.625rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginTop: 2 }}>
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
                className="flex items-baseline gap-2"
                style={{
                  padding: "6px 0",
                  borderBottom: "1px solid var(--border)",
                  boxShadow: `inset 3px 0 0 -1px ${COLORS[entry.type]}`,
                  paddingLeft: 8,
                }}
              >
                <span
                  className="flex-1 text-xs font-bold uppercase"
                  style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}
                >
                  {entry.label}
                </span>
                <span className="mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                  {hrs}
                </span>
                <span className="mono text-xs w-10 text-right" style={{ color: "var(--text-tertiary)" }}>
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
