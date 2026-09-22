"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Experience, ExperienceType, formatHours } from "@/lib/types";

// ── Layout constants (SVG units; scaled to CSS pixels via viewBox) ──────
// VIEW_H and the angle/length limits below are sized together so that even
// the steepest branch (a +/-55deg category branch plus its widest sub-branch
// spread) stays inside the viewBox - verified against a standalone
// re-implementation of this math before shipping.
const VIEW_W = 1100;
const VIEW_H = 460;
const TRUNK_Y = VIEW_H / 2;
const TRUNK_START_X = 70;
const BASE_TRUNK_LEN = 90;
const LEN_PER_LEVEL = 30;
const MAIN_BRANCH_LEN = 150;
const SUB_BRANCH_MIN_LEN = 55;
const SUB_BRANCH_HOURS_FACTOR = 0.7;
const SUB_BRANCH_MAX_LEN = 90;
const SUB_SPREAD_DEG = 28;
const MILESTONES = [50, 100, 150, 200];

const CATEGORY_ORDER: ExperienceType[] = ["clinical_work", "shadowing", "research", "volunteer", "other"];
const CATEGORY_ANGLE: Record<ExperienceType, number> = {
  clinical_work: -55,
  shadowing: -20,
  research: 0,
  volunteer: 20,
  other: 55,
};
const CATEGORY_LABEL: Record<ExperienceType, string> = {
  clinical_work: "Clinical Work",
  shadowing: "Shadowing",
  research: "Research",
  volunteer: "Volunteering",
  other: "Other",
};

type Vec = { x: number; y: number };

function dirFromAngle(deg: number): Vec {
  const r = (deg * Math.PI) / 180;
  return { x: Math.cos(r), y: Math.sin(r) };
}

interface SubBranch {
  id: string;
  title: string;
  organization: string;
  type: ExperienceType;
  hours: number;
  start_date: string;
  description: string;
  origin: Vec;
  tip: Vec;
}

interface MainBranch {
  type: ExperienceType;
  origin: Vec;
  tip: Vec;
  subs: SubBranch[];
}

// ── Category node shapes: filled/hollow circle, square, or triangle ────
function CategoryNode({ type, cx, cy, selected }: { type: ExperienceType; cx: number; cy: number; selected: boolean }) {
  const r = selected ? 8 : 7; // >= 12px diameter always
  const stroke = "#000000";
  const strokeWidth = 2;

  switch (type) {
    case "clinical_work":
      return <circle cx={cx} cy={cy} r={r} fill="#000000" stroke={stroke} strokeWidth={strokeWidth} />;
    case "shadowing":
      return <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke={stroke} strokeWidth={strokeWidth} />;
    case "research":
      return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill="#000000" stroke={stroke} strokeWidth={strokeWidth} />;
    case "volunteer":
      return <rect x={cx - r} y={cy - r} width={r * 2} height={r * 2} fill="#FFFFFF" stroke={stroke} strokeWidth={strokeWidth} />;
    case "other": {
      const h = r * 1.9;
      const points = `${cx},${cy - h * 0.62} ${cx - h * 0.58},${cy + h * 0.5} ${cx + h * 0.58},${cy + h * 0.5}`;
      return <polygon points={points} fill="#000000" stroke={stroke} strokeWidth={strokeWidth} />;
    }
  }
}

const LEGEND_ITEMS: { type: ExperienceType; label: string }[] = CATEGORY_ORDER.map((t) => ({ type: t, label: CATEGORY_LABEL[t] }));

export default function ExperienceTree({ experiences }: { experiences: Experience[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { mainBranches, trunkEndX, trunkThickness, totalHours, milestoneTicks, branchCount } = useMemo(() => {
    const ordered = [...experiences].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const totalHours = ordered.reduce((s, e) => s + e.hours, 0);
    const level = Math.min(Math.floor(totalHours / 50), MILESTONES.length);
    const trunkLen = BASE_TRUNK_LEN + level * LEN_PER_LEVEL;
    const trunkEndX = TRUNK_START_X + trunkLen;
    const trunkThickness = Math.max(6, Math.min(6 + totalHours / 15, 24));

    const byCategory = new Map<ExperienceType, Experience[]>();
    for (const exp of ordered) {
      const list = byCategory.get(exp.type) ?? [];
      list.push(exp);
      byCategory.set(exp.type, list);
    }

    const trunkOrigin: Vec = { x: trunkEndX, y: TRUNK_Y };
    const mainBranches: MainBranch[] = [];

    for (const type of CATEGORY_ORDER) {
      const list = byCategory.get(type);
      if (!list || list.length === 0) continue;

      const angle = CATEGORY_ANGLE[type];
      const dir = dirFromAngle(angle);
      const mainTip: Vec = { x: trunkOrigin.x + dir.x * MAIN_BRANCH_LEN, y: trunkOrigin.y + dir.y * MAIN_BRANCH_LEN };

      const subs: SubBranch[] = list.map((exp, i) => {
        const spreadFrac = list.length > 1 ? i / (list.length - 1) - 0.5 : 0;
        const subAngle = angle + spreadFrac * SUB_SPREAD_DEG;
        const subDir = dirFromAngle(subAngle);
        const length = Math.min(SUB_BRANCH_MIN_LEN + exp.hours * SUB_BRANCH_HOURS_FACTOR, SUB_BRANCH_MAX_LEN);
        const tip: Vec = { x: mainTip.x + subDir.x * length, y: mainTip.y + subDir.y * length };
        return {
          id: exp.id,
          title: exp.title,
          organization: exp.organization,
          type: exp.type,
          hours: exp.hours,
          start_date: exp.start_date,
          description: exp.description,
          origin: mainTip,
          tip,
        };
      });

      mainBranches.push({ type, origin: trunkOrigin, tip: mainTip, subs });
    }

    // Milestone ticks placed along the trunk at the x-fraction where each
    // achieved 50-hour threshold was crossed.
    let cumulative = 0;
    let nextIdx = 0;
    const milestoneTicks: { hours: number; x: number }[] = [];
    for (const exp of ordered) {
      cumulative += exp.hours;
      while (nextIdx < MILESTONES.length && cumulative >= MILESTONES[nextIdx]) {
        milestoneTicks.push({ hours: MILESTONES[nextIdx], x: TRUNK_START_X + trunkLen * ((nextIdx + 1) / MILESTONES.length) });
        nextIdx += 1;
      }
    }

    const branchCount = ordered.length;
    return { mainBranches, trunkEndX, trunkThickness, totalHours, milestoneTicks, branchCount };
  }, [experiences]);

  const selected = mainBranches.flatMap((m) => m.subs).find((s) => s.id === selectedId) ?? null;

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <p className="dept-header">Your Clinical Tree</p>

      <style>{`
        .tree-scroll-wrap { width: 100%; }
        .tree-svg-el { width: 100%; height: auto; display: block; min-height: 300px; }
        @media (max-width: 640px) {
          .tree-scroll-wrap { overflow-x: auto; }
          .tree-svg-el { width: 640px; height: 220px; min-width: 640px; min-height: 0; }
        }
      `}</style>

      <div className="tree-scroll-wrap">
        <svg className="tree-svg-el" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="xMidYMid meet">
          {/* Vertical "CLINICLOG MD" label on the far left */}
          <text
            x={28}
            y={TRUNK_Y}
            fontSize={11}
            fontWeight={800}
            letterSpacing={2}
            fontFamily="var(--font-jetbrains-mono, monospace)"
            fill="#000000"
            textAnchor="middle"
            transform={`rotate(-90 28 ${TRUNK_Y})`}
          >
            CLINICLOG MD
          </text>

          {/* Trunk */}
          <line
            x1={TRUNK_START_X}
            y1={TRUNK_Y}
            x2={trunkEndX}
            y2={TRUNK_Y}
            stroke="#000000"
            strokeWidth={trunkThickness}
            strokeLinecap="round"
          />

          {/* Milestone ticks along the trunk */}
          {milestoneTicks.map((m) => (
            <g key={m.hours}>
              <line
                x1={m.x}
                y1={TRUNK_Y - trunkThickness / 2 - 8}
                x2={m.x}
                y2={TRUNK_Y + trunkThickness / 2 + 8}
                stroke="#000000"
                strokeWidth={1}
                strokeDasharray="3 2"
              />
              <text x={m.x} y={TRUNK_Y - trunkThickness / 2 - 12} fontSize={8} fontWeight={700} fontFamily="var(--font-jetbrains-mono, monospace)" fill="#000000" textAnchor="middle">
                {m.hours}
              </text>
            </g>
          ))}

          {/* Main category branches + their sub-branches */}
          {mainBranches.map((main) => (
            <g key={main.type}>
              <line x1={main.origin.x} y1={main.origin.y} x2={main.tip.x} y2={main.tip.y} stroke="#000000" strokeWidth={4} strokeLinecap="round" />
              <text
                x={main.tip.x}
                y={main.tip.y + (main.tip.y < main.origin.y ? -10 : main.tip.y > main.origin.y ? 16 : -10)}
                fontSize={8}
                fontWeight={800}
                letterSpacing={0.5}
                fontFamily="var(--font-jetbrains-mono, monospace)"
                fill="rgba(0,0,0,0.55)"
                textAnchor="middle"
              >
                {CATEGORY_LABEL[main.type].toUpperCase()}
              </text>

              {main.subs.map((sub) => {
                const isSelected = selectedId === sub.id;
                const label = sub.title.length > 15 ? sub.title.slice(0, 15) + "…" : sub.title;
                const labelRight = sub.tip.x >= sub.origin.x;
                return (
                  <g key={sub.id} onClick={() => setSelectedId(sub.id)} style={{ cursor: "pointer" }}>
                    <line
                      x1={sub.origin.x}
                      y1={sub.origin.y}
                      x2={sub.tip.x}
                      y2={sub.tip.y}
                      stroke="#000000"
                      strokeWidth={2}
                      strokeLinecap="round"
                      opacity={isSelected ? 1 : 0.75}
                    />
                    <CategoryNode type={sub.type} cx={sub.tip.x} cy={sub.tip.y} selected={isSelected} />
                    <text
                      x={sub.tip.x + (labelRight ? 11 : -11)}
                      y={sub.tip.y + 3}
                      fontSize={8}
                      fontWeight={isSelected ? 800 : 600}
                      fontFamily="var(--font-jetbrains-mono, monospace)"
                      fill="#000000"
                      textAnchor={labelRight ? "start" : "end"}
                    >
                      {label}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.12)" }}>
        {LEGEND_ITEMS.map((item) => (
          <div key={item.type} className="flex items-center gap-1.5">
            <svg width={16} height={16} viewBox="0 0 16 16">
              <CategoryNode type={item.type} cx={8} cy={8} selected={false} />
            </svg>
            <span className="text-[10px] mono font-bold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.65)" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Click-to-reveal detail panel */}
      {selected && (
        <div className="mt-4 p-4" style={{ border: "2px solid #000000", background: "#FFFFFF" }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="text-sm font-bold" style={{ color: "#000000" }}>{selected.title}</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(0,0,0,0.6)" }}>{selected.organization}</p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              aria-label="Close"
              style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: 16, lineHeight: 1, color: "#000000" }}
            >
              &times;
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4 mb-2 mono text-[11px]" style={{ color: "rgba(0,0,0,0.7)" }}>
            <span>{CATEGORY_LABEL[selected.type].toUpperCase()}</span>
            <span>{formatHours(selected.hours)} HRS</span>
            <span>{selected.start_date}</span>
          </div>
          {selected.description && (
            <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(0,0,0,0.7)" }}>{selected.description}</p>
          )}
          <Link href={`/dashboard/${selected.id}/edit`} className="text-xs font-bold uppercase tracking-wide" style={{ color: "#000000", textDecoration: "underline" }}>
            Edit →
          </Link>
        </div>
      )}

      <div className="flex items-center justify-center gap-8 mt-4">
        <p className="text-xs mono" style={{ color: "rgba(0,0,0,0.6)" }}>
          BRANCHES: <span style={{ fontWeight: 700, color: "#000000" }}>{String(branchCount).padStart(3, "0")}</span>
        </p>
        <p className="text-xs mono" style={{ color: "rgba(0,0,0,0.6)" }}>
          LEAVES (HRS): <span style={{ fontWeight: 700, color: "#000000" }}>{formatHours(totalHours)}</span>
        </p>
      </div>
    </div>
  );
}
