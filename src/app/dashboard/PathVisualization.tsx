"use client";

import { useMemo, useState } from "react";
import { Experience, ExperienceType, formatHours } from "@/lib/types";
import { leafPath, taperedRibbon } from "@/lib/branch";
import {
  CATEGORY_COLOR,
  CATEGORY_LABEL,
  LEAF_KIND,
  TRUNK,
  TRUNK_W_BASE,
  TRUNK_W_TIP,
  VB_H,
  VB_W,
  buildBranches,
} from "@/lib/pathTree";


/* ── Component ──────────────────────────────────────────────────────────── */

export default function PathVisualization({ experiences }: { experiences: Experience[] }) {
  const [selected, setSelected] = useState<ExperienceType | null>(null);

  const { branches, totalHours } = useMemo(() => buildBranches(experiences), [experiences]);
  const active = branches.find((b) => b.type === selected) ?? null;

  const LIMB = "var(--limb, rgba(226,240,232,0.38))";
  const LIMB_ON = "var(--limb-active, rgba(240,250,244,0.72))";

  return (
    <section
      className="path-panel tick-corners tick-corners-light relative overflow-hidden"
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
        <p className="mono" style={{ color: "var(--on-dark-muted)", fontSize: 10, letterSpacing: "0.06em" }}>
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
          <p style={{ color: "var(--on-dark-muted)", fontSize: 13, maxWidth: 340, lineHeight: 1.6 }}>
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
                    color: "var(--on-dark-muted)",
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
                  <span style={{ fontSize: 9, color: "var(--on-dark-muted)", marginLeft: 4 }}>
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
          <p style={{ color: "var(--on-dark-muted)", fontSize: 12, marginTop: 2 }}>
            {formatHours(active.hours)} hours across {active.count}{" "}
            {active.count === 1 ? "entry" : "entries"}. This limb thickens and forks again as you log more.
          </p>
        </div>
      )}
    </section>
  );
}
