"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SignupsChart({ data }: { data: { day: string; signups: number }[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        No signups in the last 90 days.
      </p>
    );
  }

  const rows = data.map((d) => ({ day: d.day.slice(5), signups: Number(d.signups) }));

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 600, height: 200 }}>
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: "var(--text-xs)", fontFamily: "var(--tnum)", fill: "var(--text-muted)" }} tickLine={false} axisLine={{ stroke: "var(--border-strong)" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: "var(--text-xs)", fontFamily: "var(--tnum)", fill: "var(--text-muted)" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 0,
              border: "1px solid var(--border-strong)",
              fontSize: "var(--text-xs)",
              fontFamily: "var(--tnum)",
              backgroundColor: "var(--surface)",
              color: "var(--text)",
              boxShadow: "none",
            }}
          />
          <Line type="monotone" dataKey="signups" stroke="var(--action)" strokeWidth={1.6} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
