"use client";

import { useMemo, useState } from "react";
import { Experience, ExperienceType, formatHours } from "@/lib/types";
import {
  Cubic,
  LeafKind,
  angleAt,
  bezPoint,
  hashString,
  leafPath,
  makeLimb,
  mulberry32,
  r2,
  taperedRibbon,
} from "@/lib/branch";

/* ──────────────────────────────────────────────────────────────────────────
   YOUR PATH — an organic branch drawn from the user's logged categories.

   Every limb is a tapered ribbon (a filled outline around a cubic bezier
   centreline), not a stroked line, because an SVG stroke cannot change width
   along its length. Curvature, fork angles and twig placement are drawn from
   a seeded RNG keyed on the category and its entry ids, so the branch looks
   hand-grown and irregular but is identical on every reload.
   ────────────────────────────────────────────────────────────────────────── */

const CATEGORY_ORDER: ExperienceType[] = ["clinical_work", "shadowing", "research", "volunteer", "other"];
const CATEGORY_LABEL: Record<ExperienceType, string> = {
  clinical_work: "Clinical Work",
  shadowing: "Shadowing",
  research: "Research",
  volunteer: "Volunteering",
  other: "Other",
};
/* Leaf colours are a lightened variant of the chart palette: the --cat-*
   tokens are tuned for the white donut card, and --cat-clinical (#2D6A4F) is
   almost exactly the dark panel's own background, so leaves drawn in it would
   disappear. Hue is preserved, lightness is raised. */
const CATEGORY_COLOR: Record<ExperienceType, string> = {
  clinical_work: "#B7E4C7",
  shadowing: "#74C69D",
  research: "#B9AEFF",
  volunteer: "#F4A261",
  other: "#4CC9F0",
};
/* Leaf silhouette per category, so a limb is identifiable by shape alone
   and not by colour only. */
const LEAF_KIND: Record<ExperienceType, LeafKind> = {
  clinical_work: "solid",
  shadowing: "hollow",
  research: "diamond",
  volunteer: "round",
  other: "narrow",
};

const VB_W = 880;
const VB_H = 330;

/* The bough: enters thick at the left edge and tapers away to the right,
   with a gentle organic sway. Cropped at the left like a botanical plate. */
const TRUNK: Cubic = [
  { x: -12, y: 200 },
  { x: 236, y: 248 },
  { x: 566, y: 126 },
  { x: 862, y: 152 },
];
const TRUNK_W_BASE = 26;
const TRUNK_W_TIP = 2.5;

/* ── Derived branch model ───────────────────────────────────────────────── */

interface Twig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
interface SubLimb {
  d: string;
  leafD: string;
  leafTransform: string;
}
interface Branch {
  type: ExperienceType;
  hours: number;
  count: number;
  d: string;
  subs: SubLimb[];
  twigs: Twig[];
  leafD: string;
  leafTransform: string;
  leafSize: number;
  label: { x: number; y: number; subY: number; anchor: "start" | "end"; fontSize: number };
}

function buildBranches(experiences: Experience[]): { branches: Branch[]; totalHours: number } {
  const byCategory = new Map<ExperienceType, { hours: number; count: number; ids: string[] }>();
  for (const exp of experiences) {
    const cur = byCategory.get(exp.type) ?? { hours: 0, count: 0, ids: [] };
    cur.hours += exp.hours;
    cur.count += 1;
    cur.ids.push(exp.id);
    byCategory.set(exp.type, cur);
  }

  const present = CATEGORY_ORDER.filter((t) => (byCategory.get(t)?.count ?? 0) > 0);
  const maxHours = Math.max(1, ...present.map((t) => byCategory.get(t)!.hours));
  const totalHours = experiences.reduce((s, e) => s + e.hours, 0);

  const branches: Branch[] = present.map((type, i) => {
    const data = byCategory.get(type)!;
    const frac = data.hours / maxHours;

    // Seed on the category plus its entry ids: logging another entry in this
    // category reshapes only this limb, and never the others.
    const rand = mulberry32(hashString(type + "|" + [...data.ids].sort().join(",")));

    // Fork point along the bough. Limbs emerge at spread-out points rather
    // than all stacking at the tip, and shift slightly with the seed.
    const tTrunk =
      present.length === 1 ? 0.42 : 0.12 + (i * 0.74) / (present.length - 1) + (rand() - 0.5) * 0.05;
    const origin = bezPoint(TRUNK, tTrunk);
    const trunkAngle = angleAt(TRUNK, tTrunk);

    // Fork 22-45 degrees off the bough's local heading, alternating sides.
    const side = i % 2 === 0 ? -1 : 1;
    const forkAngle = trunkAngle + side * (22 + rand() * 23);

    const length = 78 + frac * 78 + rand() * 20;
    // Fork is always thinner than the bough it leaves, and thickens with hours.
    const wStart = 3.4 + frac * 7;
    const wEnd = 1;
    const sway = side * (8 + rand() * 18);

    const limb = makeLimb(origin, forkAngle, length, sway);
    const d = taperedRibbon(limb, wStart, wEnd, 22);

    const tipAngle = angleAt(limb, 1);
    const tip = limb[3];

    // Sub-limbs fork off this limb the same way, thinner and shorter. More
    // entries in the category means more forks, placed at seeded points along
    // the limb rather than appended at its end.
    const subCount = Math.min(4, Math.max(1, Math.round(data.count / 1.6)));
    const subs: SubLimb[] = [];
    for (let s = 0; s < subCount; s++) {
      const tSub = 0.34 + (s * 0.42) / Math.max(1, subCount - 1 || 1) + (rand() - 0.5) * 0.08;
      const clamped = Math.min(0.82, Math.max(0.28, tSub));
      const subOrigin = bezPoint(limb, clamped);
      const subSide = s % 2 === 0 ? side : -side;
      const subAngle = angleAt(limb, clamped) + subSide * (22 + rand() * 22);
      const subLen = length * (0.3 + rand() * 0.2);
      const subW = wStart * (0.42 + rand() * 0.16);
      const subLimb = makeLimb(subOrigin, subAngle, subLen, subSide * (4 + rand() * 9));
      const subLeaf = 7 + frac * 5 + rand() * 2;
      subs.push({
        d: taperedRibbon(subLimb, subW, 0.9, 14),
        leafD: leafPath(LEAF_KIND[type], subLeaf),
        leafTransform: `translate(${subLimb[3].x.toFixed(1)} ${subLimb[3].y.toFixed(1)}) rotate(${angleAt(subLimb, 1).toFixed(1)})`,
      });
    }

    // Twig tips: 2-3 hairlines fanning just short of the leaf, the way a real
    // branch frays before it terminates.
    const twigBase = bezPoint(limb, 0.88);
    const twigCount = 2 + Math.round(rand());
    const twigs: Twig[] = [];
    for (let k = 0; k < twigCount; k++) {
      const spread = (k - (twigCount - 1) / 2) * (20 + rand() * 12);
      const a = ((tipAngle + spread) * Math.PI) / 180;
      const len = 7 + rand() * 7;
      twigs.push({
        x1: r2(twigBase.x),
        y1: r2(twigBase.y),
        x2: r2(twigBase.x + Math.cos(a) * len),
        y2: r2(twigBase.y + Math.sin(a) * len),
      });
    }

    const leafSize = 13 + frac * 11;
    // Label sits past the leaf, pushed clear of the limb on the side the fork
    // points. Upper forks label above, lower forks below, which keeps adjacent
    // labels from colliding.
    const tipRad = (tipAngle * Math.PI) / 180;
    const labelGap = leafSize + 26;
    const pointsLeft = Math.cos(tipRad) < -0.25;
    // A start-anchored label runs rightward, so it needs room for its own
    // width; an end-anchored one runs leftward. Clamp accordingly or the text
    // is cut off by the viewBox edge.
    // Nudge the text off the limb's own axis as well as past its tip, so it
    // does not land among this fork's leaves.
    const offX = -Math.sin(tipRad) * side * 12;
    const offY = Math.cos(tipRad) * side * 12;
    const rawX = tip.x + Math.cos(tipRad) * labelGap + offX;
    const labelX = pointsLeft
      ? Math.max(120, Math.min(VB_W - 16, rawX))
      : Math.max(16, Math.min(VB_W - 132, rawX));
    const labelY = Math.min(
      VB_H - 26,
      Math.max(30, tip.y + Math.sin(tipRad) * labelGap + offY + (side < 0 ? 0 : 12))
    );

    return {
      type,
      hours: data.hours,
      count: data.count,
      d,
      subs,
      twigs,
      leafD: leafPath(LEAF_KIND[type], leafSize),
      leafTransform: `translate(${tip.x.toFixed(1)} ${tip.y.toFixed(1)}) rotate(${tipAngle.toFixed(1)})`,
      leafSize,
      label: {
        x: r2(labelX),
        y: r2(labelY),
        // Precomputed rather than summed in JSX, so the sub-label's y is also
        // a stable 2-decimal value on both sides of hydration.
        subY: r2(labelY + (11 + frac * 6) + 3),
        anchor: pointsLeft ? "end" : "start",
        // Text grows with hours logged in the category.
        fontSize: r2(11 + frac * 6),
      },
    };
  });

  return { branches, totalHours };
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function PathVisualization({ experiences }: { experiences: Experience[] }) {
  const [selected, setSelected] = useState<ExperienceType | null>(null);

  const { branches, totalHours } = useMemo(() => buildBranches(experiences), [experiences]);
  const active = branches.find((b) => b.type === selected) ?? null;

  const LIMB = "rgba(226,240,232,0.38)";
  const LIMB_ON = "rgba(240,250,244,0.72)";

  return (
    <section
      className="tick-corners tick-corners-light relative overflow-hidden"
      style={{
        background: "linear-gradient(135deg, var(--bg-hero-1), var(--bg-hero-2) 58%, var(--bg-hero-3))",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: "var(--radius)",
        marginBottom: "var(--sp-4)",
      }}
    >
      <style>{`
        .tree-label { display: block; }
        .tree-sublabel { display: block; }
        @media (max-width: 700px) {
          .tree-label, .tree-sublabel { display: none; }
        }
      `}</style>

      {/* Chart-paper grid, in place of a decorative starfield */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <pattern id="chartgrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40,0 L0,0 L0,40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#chartgrid)" />
      </svg>

      {/* Panel header: left-aligned label, readout on the right */}
      <header
        className="relative flex flex-wrap items-baseline justify-between gap-2"
        style={{ padding: "var(--sp-2) var(--sp-3) 0" }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.92)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
          }}
        >
          Your Path
        </p>
        <p className="mono" style={{ color: "rgba(255,255,255,0.55)", fontSize: 10, letterSpacing: "0.06em" }}>
          {formatHours(totalHours)} HRS / {experiences.length} {experiences.length === 1 ? "ENTRY" : "ENTRIES"}
        </p>
      </header>

      {branches.length === 0 ? (
        <div
          className="relative"
          style={{ padding: "var(--sp-6) var(--sp-3)", minHeight: 200 }}
        >
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            Nothing has grown here yet.
          </p>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, maxWidth: 340, lineHeight: 1.6 }}>
            Log your first experience and a limb appears for its category. Each limb thickens and puts
            out new forks as you add hours to it.
          </p>
          <svg viewBox="0 0 200 90" className="mt-4" style={{ width: 200, height: 90, opacity: 0.32 }} aria-hidden="true">
            <path d={taperedRibbon([{ x: 14, y: 84 }, { x: 40, y: 60 }, { x: 96, y: 54 }, { x: 150, y: 20 }], 9, 2, 20)} fill={LIMB} />
            <line x1="6" y1="86" x2="194" y2="86" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="relative w-full"
          style={{ display: "block", height: "auto" }}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={`Your path: ${branches.map((b) => `${CATEGORY_LABEL[b.type]} ${formatHours(b.hours)} hours`).join(", ")}`}
        >

          {/* Trunk */}
          <path d={taperedRibbon(TRUNK, TRUNK_W_BASE, TRUNK_W_TIP, 34)} fill={LIMB} />

          {branches.map((b) => {
            const on = selected === b.type;
            const color = CATEGORY_COLOR[b.type];
            const kind = LEAF_KIND[b.type];
            return (
              <g
                key={b.type}
                onClick={() => setSelected(on ? null : b.type)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(on ? null : b.type);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-pressed={on}
                aria-label={`${CATEGORY_LABEL[b.type]}: ${formatHours(b.hours)} hours across ${b.count} entries`}
                style={{ cursor: "pointer", outline: "none" }}
              >
                {/* Limb + forks */}
                <path d={b.d} fill={on ? LIMB_ON : LIMB} />
                {b.subs.map((s, i) => (
                  <path key={i} d={s.d} fill={on ? LIMB_ON : LIMB} />
                ))}

                {/* Frayed twig tips */}
                {b.twigs.map((t, i) => (
                  <line
                    key={i}
                    x1={t.x1}
                    y1={t.y1}
                    x2={t.x2}
                    y2={t.y2}
                    stroke={on ? LIMB_ON : LIMB}
                    strokeWidth="1.1"
                    strokeLinecap="round"
                  />
                ))}

                {/* Leaves: filled, hollow, diamond, round or narrow by category */}
                {b.subs.map((s, i) => (
                  <path
                    key={`leaf-${i}`}
                    d={s.leafD}
                    transform={s.leafTransform}
                    fill={kind === "hollow" ? "none" : color}
                    stroke={kind === "hollow" ? color : "none"}
                    strokeWidth={kind === "hollow" ? 1.2 : 0}
                    opacity={on ? 1 : 0.82}
                  />
                ))}
                <path
                  d={b.leafD}
                  transform={b.leafTransform}
                  fill={kind === "hollow" ? "none" : color}
                  stroke={kind === "hollow" ? color : "none"}
                  strokeWidth={kind === "hollow" ? 1.6 : 0}
                />
              </g>
            );
          })}

          {/* Labels are a second pass over the whole drawing: rendered inside
              their own branch group, a later branch's foliage paints over an
              earlier branch's text. The dark halo keeps them legible where
              they cross a limb. */}
          {branches.map((b) => (
            <g key={`label-${b.type}`} style={{ pointerEvents: "none" }}>
              <text
                className="tree-label"
                x={b.label.x}
                y={b.label.y}
                textAnchor={b.label.anchor}
                fill="rgba(255,255,255,0.96)"
                stroke="rgba(11,61,46,0.55)"
                strokeWidth={3}
                paintOrder="stroke"
                strokeLinejoin="round"
                style={{ fontSize: b.label.fontSize, fontWeight: 600, letterSpacing: "-0.01em" }}
              >
                {CATEGORY_LABEL[b.type]}
              </text>
              <text
                className="tree-sublabel"
                x={b.label.x}
                y={b.label.subY}
                textAnchor={b.label.anchor}
                fill="rgba(255,255,255,0.68)"
                stroke="rgba(11,61,46,0.55)"
                strokeWidth={2.5}
                paintOrder="stroke"
                strokeLinejoin="round"
                style={{ fontSize: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}
              >
                {formatHours(b.hours)} HRS / {b.count}
              </text>
            </g>
          ))}
        </svg>
      )}

      {/* Category readout: carries the data at any width, including where the
          in-drawing labels are too small to read. */}
      {branches.length > 0 && (
        <div
          className="relative grid gap-x-6 gap-y-2"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(128px, 1fr))",
            padding: "0 var(--sp-3) var(--sp-3)",
            borderTop: "1px dashed rgba(255,255,255,0.16)",
            marginTop: "var(--sp-1)",
            paddingTop: "var(--sp-2)",
          }}
        >
          {branches.map((b) => {
            const on = selected === b.type;
            return (
              <button
                key={b.type}
                onClick={() => setSelected(on ? null : b.type)}
                className="text-left"
                style={{
                  background: "transparent",
                  border: 0,
                  borderBottom: `1px solid ${on ? CATEGORY_COLOR[b.type] : "rgba(255,255,255,0.14)"}`,
                  padding: "0 0 5px",
                  cursor: "pointer",
                }}
              >
                <span
                  className="flex items-center gap-1.5"
                  style={{
                    color: "rgba(255,255,255,0.55)",
                    fontSize: 9,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 3,
                  }}
                >
                  <svg width="9" height="9" viewBox="-1 -5 12 10" aria-hidden="true" style={{ flexShrink: 0 }}>
                    <path
                      d={leafPath(LEAF_KIND[b.type], 9)}
                      fill={LEAF_KIND[b.type] === "hollow" ? "none" : CATEGORY_COLOR[b.type]}
                      stroke={LEAF_KIND[b.type] === "hollow" ? CATEGORY_COLOR[b.type] : "none"}
                      strokeWidth={LEAF_KIND[b.type] === "hollow" ? 1.2 : 0}
                    />
                  </svg>
                  {CATEGORY_LABEL[b.type]}
                </span>
                <span
                  className="mono"
                  style={{ color: "#FFFFFF", fontSize: 14, fontWeight: 600, display: "block" }}
                >
                  {formatHours(b.hours)}
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>
                    HRS / {b.count}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      {active && (
        <div
          className="relative"
          style={{
            margin: "0 var(--sp-3) var(--sp-3)",
            padding: "var(--sp-2)",
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderLeft: `2px solid ${CATEGORY_COLOR[active.type]}`,
            borderRadius: "var(--radius)",
          }}
        >
          <p style={{ color: "#FFFFFF", fontSize: 13, fontWeight: 600 }}>{CATEGORY_LABEL[active.type]}</p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 2 }}>
            {formatHours(active.hours)} hours across {active.count}{" "}
            {active.count === 1 ? "entry" : "entries"}. This limb thickens and forks again as you log more.
          </p>
        </div>
      )}
    </section>
  );
}
