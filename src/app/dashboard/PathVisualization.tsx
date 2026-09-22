"use client";

import { useMemo, useState } from "react";
import { Experience, ExperienceType, formatHours } from "@/lib/types";

const CATEGORY_ORDER: ExperienceType[] = ["clinical_work", "shadowing", "research", "volunteer", "other"];
const CATEGORY_LABEL: Record<ExperienceType, string> = {
  clinical_work: "Clinical Work",
  shadowing: "Shadowing",
  research: "Research",
  volunteer: "Volunteering",
  other: "Other",
};
const CATEGORY_COLOR: Record<ExperienceType, string> = {
  clinical_work: "var(--cat-clinical)",
  shadowing: "var(--cat-shadowing)",
  research: "var(--cat-research)",
  volunteer: "var(--cat-volunteer)",
  other: "var(--cat-other)",
};

interface CategoryNode {
  type: ExperienceType;
  hours: number;
  count: number;
  x: number; // percent, 0-100
  y: number; // percent, 0-100
  size: number; // px diameter
  fontSize: number; // px
}

// Deterministic background "stars" so the hero panel doesn't feel empty,
// without pulling in a particle/canvas library.
const STARS = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 37) % 100,
  y: (i * 53) % 100,
  r: 1 + (i % 3),
  o: 0.15 + (i % 4) * 0.08,
}));

export default function PathVisualization({ experiences }: { experiences: Experience[] }) {
  const [selected, setSelected] = useState<ExperienceType | null>(null);

  const { nodes, totalHours, totalCount } = useMemo(() => {
    const byCategory = new Map<ExperienceType, { hours: number; count: number }>();
    for (const exp of experiences) {
      const cur = byCategory.get(exp.type) ?? { hours: 0, count: 0 };
      cur.hours += exp.hours;
      cur.count += 1;
      byCategory.set(exp.type, cur);
    }
    const present = CATEGORY_ORDER.filter((t) => (byCategory.get(t)?.count ?? 0) > 0);
    const maxHours = Math.max(1, ...present.map((t) => byCategory.get(t)!.hours));

    const nodes: CategoryNode[] = present.map((type, i) => {
      const data = byCategory.get(type)!;
      const angle = -90 + i * (360 / present.length);
      const rad = (angle * Math.PI) / 180;
      const radius = 34; // percent of container
      const frac = data.hours / maxHours;
      return {
        type,
        hours: data.hours,
        count: data.count,
        x: 50 + radius * Math.cos(rad),
        y: 50 + radius * Math.sin(rad) * 0.82, // slightly flatten vertically for a wide hero panel
        size: 46 + frac * 38,
        fontSize: 11 + frac * 5,
      };
    });

    const totalHours = experiences.reduce((s, e) => s + e.hours, 0);
    return { nodes, totalHours, totalCount: experiences.length };
  }, [experiences]);

  const activeNode = nodes.find((n) => n.type === selected) ?? null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl mb-8"
      style={{
        background: "linear-gradient(135deg, var(--bg-hero-1), var(--bg-hero-2) 55%, var(--bg-hero-3))",
        minHeight: 320,
        boxShadow: "var(--shadow-hero)",
      }}
    >
      {/* Decorative starfield */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {STARS.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="#FFFFFF" opacity={s.o} />
        ))}
      </svg>

      <div className="relative px-6 pt-6">
        <p className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.92)" }}>Your Path</p>
      </div>

      {nodes.length === 0 ? (
        <div className="relative flex flex-col items-center justify-center text-center px-6" style={{ minHeight: 260 }}>
          <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>Your path starts here</p>
          <p className="text-xs mt-1 max-w-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
            Log your first experience and it will appear here as a growing part of your journey.
          </p>
        </div>
      ) : (
        <div className="relative" style={{ height: 300 }}>
          <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
            {nodes.map((n) => (
              <line
                key={n.type}
                x1="50%"
                y1="50%"
                x2={`${n.x}%`}
                y2={`${n.y}%`}
                stroke="rgba(255,255,255,0.28)"
                strokeWidth={1.5}
              />
            ))}
          </svg>

          {/* Central hub */}
          <button
            onClick={() => setSelected(null)}
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: 84,
              height: 84,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #74C69D, var(--accent) 70%)",
              boxShadow: "0 0 0 6px rgba(255,255,255,0.06), 0 8px 24px rgba(0,0,0,0.35)",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span className="font-bold" style={{ color: "#FFFFFF", fontSize: 18, lineHeight: 1 }}>{formatHours(totalHours)}</span>
            <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total hrs</span>
          </button>

          {nodes.map((n) => (
            <button
              key={n.type}
              onClick={() => setSelected(selected === n.type ? null : n.type)}
              className="absolute flex flex-col items-center"
              style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%,-50%)", background: "transparent", border: "none", cursor: "pointer" }}
            >
              <div
                style={{
                  width: n.size,
                  height: n.size,
                  borderRadius: "50%",
                  background: `radial-gradient(circle at 35% 30%, #FFFFFF33, ${CATEGORY_COLOR[n.type]} 75%)`,
                  boxShadow: selected === n.type
                    ? `0 0 0 4px rgba(255,255,255,0.35), 0 0 24px ${CATEGORY_COLOR[n.type]}`
                    : `0 0 16px ${CATEGORY_COLOR[n.type]}88`,
                  transition: "box-shadow 0.2s ease",
                }}
              />
              <span className="mt-2 font-semibold text-center" style={{ color: "#FFFFFF", fontSize: n.fontSize, lineHeight: 1.2, maxWidth: 110 }}>
                {CATEGORY_LABEL[n.type]}
              </span>
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 10 }}>
                {formatHours(n.hours)} hrs Β· {n.count} {n.count === 1 ? "entry" : "entries"}
              </span>
            </button>
          ))}
        </div>
      )}

      {activeNode && (
        <div className="relative mx-6 mb-6 px-4 py-3 rounded-xl" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(6px)" }}>
          <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>{CATEGORY_LABEL[activeNode.type]}</p>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.7)" }}>
            {formatHours(activeNode.hours)} hours logged across {activeNode.count} {activeNode.count === 1 ? "entry" : "entries"}.
          </p>
        </div>
      )}

      <div className="relative flex items-center justify-between px-6 pb-5 pt-2" style={{ color: "rgba(255,255,255,0.5)" }}>
        <span className="text-[11px]">{totalCount} total {totalCount === 1 ? "experience" : "experiences"} logged</span>
        <span className="text-[11px]">Tap a node for details</span>
      </div>
    </div>
  );
}
