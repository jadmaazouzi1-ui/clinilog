"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Experience, ExperienceType } from "@/lib/types";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteer",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

const COLORS: Record<ExperienceType, string> = {
  clinical_work: "#6366f1",
  shadowing:     "#3b82f6",
  research:      "#8b5cf6",
  volunteer:     "#22c55e",
  other:         "#9ca3af",
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-6">
        Hours Breakdown
      </h2>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Donut chart */}
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={44}
                outerRadius={76}
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
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-3">
          {data.map((entry) => {
            const pct = Math.round((entry.hours / totalHours) * 100);
            const hrs =
              entry.hours % 1 === 0
                ? entry.hours.toString()
                : entry.hours.toFixed(1);
            return (
              <div key={entry.type} className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: COLORS[entry.type] }}
                />
                <span className="text-sm text-gray-700 flex-1">
                  {entry.label}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {hrs} hrs
                </span>
                <span className="text-xs text-gray-400 w-10 text-right">
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
