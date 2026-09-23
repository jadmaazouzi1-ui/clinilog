"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SignupsChart({ data }: { data: { day: string; signups: number }[] }) {
  if (data.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        No signups in the last 90 days.
      </p>
    );
  }

  const rows = data.map((d) => ({ day: d.day.slice(5), signups: Number(d.signups) }));

  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: -20 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 4" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--text-tertiary)" }} tickLine={false} axisLine={{ stroke: "var(--border-strong)" }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--text-tertiary)" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              borderRadius: 3,
              border: "1px solid var(--border-strong)",
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
              boxShadow: "none",
            }}
          />
          <Line type="monotone" dataKey="signups" stroke="var(--accent)" strokeWidth={1.6} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
