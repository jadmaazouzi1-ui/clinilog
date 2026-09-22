"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Experience, ExperienceType, formatHours } from "@/lib/types";

const VIEW_W = 400;
const VIEW_H = 360;
const BASE_X = VIEW_W / 2;
const BASE_Y = VIEW_H - 20;
const BASE_TRUNK_HEIGHT = 90;
const HEIGHT_PER_LEVEL = 36;
const MILESTONES = [50, 100, 150, 200];

type Vec = { x: number; y: number };

function rotate(v: Vec, deg: number): Vec {
  const r = (deg * Math.PI) / 180;
  return {
    x: v.x * Math.cos(r) - v.y * Math.sin(r),
    y: v.x * Math.sin(r) + v.y * Math.cos(r),
  };
}

function normalize(v: Vec): Vec {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

// Base direction per category (SVG space, y grows downward, so "up" is -y).
// "Other" cycles through the compass points none of the four categories use.
const BASE_DIR: Record<ExperienceType, Vec> = {
  clinical_work: { x: 0, y: -1 },                 // straight up
  shadowing: normalize({ x: 1, y: -0.2 }),        // right
  research: normalize({ x: -1, y: -0.2 }),        // left
  volunteer: normalize({ x: -0.75, y: -0.75 }),   // upper-left
  other: { x: 0, y: 0 },                          // resolved per-index below
};

const OTHER_DIRS: Vec[] = [
  normalize({ x: 0.75, y: 0.75 }),   // lower-right
  normalize({ x: -0.75, y: 0.75 }),  // lower-left
  normalize({ x: 0, y: 1 }),         // straight down
  normalize({ x: 0.75, y: -0.75 }),  // upper-right
];

const THICKNESS: Record<ExperienceType, number> = {
  clinical_work: 6,
  shadowing: 3.5,
  research: 1.8,
  volunteer: 3.5,
  other: 2.5,
};

interface Branch {
  id: string;
  title: string;
  type: ExperienceType;
  origin: Vec;
  tip: Vec;
  thickness: number;
}

export default function ExperienceTree({ experiences }: { experiences: Experience[] }) {
  const router = useRouter();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { branches, trunkTopY, trunkThickness, totalHours, milestoneYs } = useMemo(() => {
    // Growth order: oldest-logged experience grows first, working up the trunk.
    const ordered = [...experiences].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const totalHours = ordered.reduce((s, e) => s + e.hours, 0);
    const level = Math.min(Math.floor(totalHours / 50), MILESTONES.length);
    const trunkHeight = BASE_TRUNK_HEIGHT + level * HEIGHT_PER_LEVEL;
    const trunkTopY = BASE_Y - trunkHeight;
    const trunkThickness = Math.min(4 + totalHours / 12, 22);

    let otherIdx = 0;
    let cumulative = 0;
    const milestoneYs: { hours: number; y: number }[] = [];
    let nextMilestoneIdx = 0;

    const branches: Branch[] = ordered.map((exp, i) => {
      const t = (i + 1) / (ordered.length + 1);
      const origin: Vec = { x: BASE_X, y: BASE_Y - t * trunkHeight };

      let dir = BASE_DIR[exp.type];
      if (exp.type === "other") {
        dir = OTHER_DIRS[otherIdx % OTHER_DIRS.length];
        otherIdx += 1;
      }
      // Small deterministic jitter so same-category branches fan out
      // rather than stacking exactly on top of one another.
      const jitter = ((i * 37) % 21) - 10;
      dir = rotate(dir, jitter);

      const length = Math.min(24 + Math.min(exp.hours, 60) * 0.55, 62);
      const tip: Vec = { x: origin.x + dir.x * length, y: origin.y + dir.y * length };

      cumulative += exp.hours;
      while (nextMilestoneIdx < MILESTONES.length && cumulative >= MILESTONES[nextMilestoneIdx]) {
        milestoneYs.push({ hours: MILESTONES[nextMilestoneIdx], y: origin.y });
        nextMilestoneIdx += 1;
      }

      return {
        id: exp.id,
        title: exp.title,
        type: exp.type,
        origin,
        tip,
        thickness: THICKNESS[exp.type],
      };
    });

    return { branches, trunkTopY, trunkThickness, totalHours, milestoneYs };
  }, [experiences]);

  const hovered = branches.find((b) => b.id === hoveredId) ?? null;

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <p className="dept-header">Your Clinical Tree</p>

      <div style={{ width: "100%", maxWidth: 460, margin: "0 auto" }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          width="100%"
          height="auto"
          style={{ display: "block" }}
        >
          {/* Ground line */}
          <line x1={BASE_X - 60} y1={BASE_Y} x2={BASE_X + 60} y2={BASE_Y} stroke="#000000" strokeWidth={1} opacity={0.2} />

          {/* Trunk */}
          <line
            x1={BASE_X}
            y1={BASE_Y}
            x2={BASE_X}
            y2={trunkTopY}
            stroke="#000000"
            strokeWidth={trunkThickness}
            strokeLinecap="round"
          />

          {/* Milestone level markers */}
          {milestoneYs.map((m) => (
            <g key={m.hours}>
              <line
                x1={BASE_X - trunkThickness - 6}
                y1={m.y}
                x2={BASE_X + trunkThickness + 6}
                y2={m.y}
                stroke="#000000"
                strokeWidth={1}
                strokeDasharray="3 2"
              />
              <text
                x={BASE_X + trunkThickness + 10}
                y={m.y + 3}
                fontSize={8}
                fontFamily="var(--font-jetbrains-mono, monospace)"
                fontWeight={700}
                fill="#000000"
              >
                {m.hours}
              </text>
            </g>
          ))}

          {/* Branches */}
          {branches.map((b) => {
            const isHovered = hoveredId === b.id;
            return (
              <g
                key={b.id}
                onMouseEnter={() => setHoveredId(b.id)}
                onMouseLeave={() => setHoveredId((cur) => (cur === b.id ? null : cur))}
                onClick={() => router.push(`/dashboard/${b.id}/edit`)}
                style={{ cursor: "pointer" }}
              >
                <line
                  x1={b.origin.x}
                  y1={b.origin.y}
                  x2={b.tip.x}
                  y2={b.tip.y}
                  stroke="#000000"
                  strokeWidth={b.thickness}
                  strokeLinecap="round"
                  opacity={isHovered ? 1 : 0.85}
                />
                {/* Leaf node */}
                <circle
                  cx={b.tip.x}
                  cy={b.tip.y}
                  r={isHovered ? 6 : 4.5}
                  fill={isHovered ? "#000000" : "#FFFFFF"}
                  stroke="#000000"
                  strokeWidth={2}
                />
              </g>
            );
          })}

          {/* Hover tooltip */}
          {hovered && (
            <g>
              <rect
                x={Math.min(Math.max(hovered.tip.x - 55, 4), VIEW_W - 114)}
                y={Math.max(hovered.tip.y - 30, 4)}
                width={110}
                height={20}
                fill="#FFFFFF"
                stroke="#000000"
                strokeWidth={1.5}
              />
              <text
                x={Math.min(Math.max(hovered.tip.x - 55, 4), VIEW_W - 114) + 6}
                y={Math.max(hovered.tip.y - 30, 4) + 14}
                fontSize={9}
                fontFamily="var(--font-jetbrains-mono, monospace)"
                fontWeight={700}
                fill="#000000"
              >
                {hovered.title.length > 16 ? hovered.title.slice(0, 15) + "…" : hovered.title}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="flex items-center justify-center gap-8 mt-2">
        <p className="text-xs mono" style={{ color: "rgba(0,0,0,0.6)" }}>
          BRANCHES: <span style={{ fontWeight: 700, color: "#000000" }}>{String(branches.length).padStart(3, "0")}</span>
        </p>
        <p className="text-xs mono" style={{ color: "rgba(0,0,0,0.6)" }}>
          LEAVES (HRS): <span style={{ fontWeight: 700, color: "#000000" }}>{formatHours(totalHours)}</span>
        </p>
      </div>
    </div>
  );
}
