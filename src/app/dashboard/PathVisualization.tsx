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

  const LIMB = "var(--data-inverse-4)";
  const LIMB_ON = "var(--data-inverse-1)";

  return (
    <section
      className="path-panel relative overflow-hidden"
      style={{
        background: "var(--surface-inverse)",
        border: "1px solid var(--border-inverse)",
        borderRadius: "var(--radius-card)",
      }}
    >
      <style>{`
        .tree-label { display: block; }
        .tree-sublabel { display: block; }
        @media (max-width: 700px) {
          .tree-label, .tree-sublabel { display: none; }
        }
      `}</style>

      {/* Panel header: left-aligned label, readout on the right */}
      <header
        className="relative flex flex-wrap items-baseline justify-between gap-2"
        style={{ padding: "var(--sp-2) var(--sp-3) 0" }}
      >
        <h2 className="section-title" style={{ color: "var(--text-inverse)", margin: 0 }}>
          Your path
        </h2>
        <p className="text-xs tnum" style={{ color: "var(--text-inverse-muted)" }}>
          {formatHours(totalHours)} hrs across {experiences.length} {experiences.length === 1 ? "entry" : "entries"}
        </p>
      </header>

      {branches.length === 0 ? (
        <div
          className="relative"
          style={{ padding: "var(--sp-6) var(--sp-3)", minHeight: 200 }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--text-inverse)", marginBottom: 6 }}>
            Nothing has grown here yet.
          </p>
          <p className="text-xs" style={{ color: "var(--text-inverse-muted)", maxWidth: 340, lineHeight: 1.6 }}>
            Log your first experience and a limb appears for its category. Each limb thickens and puts
            out new forks as you add hours to it.
          </p>
          <svg viewBox="0 0 200 90" className="mt-4" style={{ width: 200, height: 90, opacity: 0.32 }} aria-hidden="true">
            <path d={taperedRibbon([{ x: 14, y: 84 }, { x: 40, y: 60 }, { x: 96, y: 54 }, { x: 150, y: 20 }], 9, 2, 20)} fill={LIMB} />
            <line x1="6" y1="86" x2="194" y2="86" stroke="var(--border-inverse)" strokeWidth="1" strokeDasharray="4 4" />
          </svg>
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          className="relative w-full"
          style={{ display: "block", height: "auto" }}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >

          {/* Trunk */}
          <path d={taperedRibbon(TRUNK, TRUNK_W_BASE, TRUNK_W_TIP, 34)} fill="var(--data-inverse-3)" />

          {branches.map((b) => {
            const on = selected === b.type;
            const color = CATEGORY_COLOR[b.type];
            const kind = LEAF_KIND[b.type];
            return (
              <g
                key={b.type}
                onClick={() => setSelected(on ? null : b.type)}
                style={{ cursor: "pointer" }}
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
                fill="var(--text-inverse)"
                stroke="var(--surface-inverse)"
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
                fill="var(--text-inverse-muted)"
                stroke="var(--surface-inverse)"
                strokeWidth={2.5}
                paintOrder="stroke"
                strokeLinejoin="round"
                style={{ fontSize: b.label.fontSize * 0.72, fontVariantNumeric: "tabular-nums" }}
              >
                {formatHours(b.hours)} hrs
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
            borderTop: "1px solid var(--border-inverse)",
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
                aria-pressed={on}
                aria-label={`${CATEGORY_LABEL[b.type]}: ${formatHours(b.hours)} hours across ${b.count} ${b.count === 1 ? "entry" : "entries"}`}
                style={{
                  minHeight: 44,
                  background: "transparent",
                  border: 0,
                  borderBottom: `1px solid ${on ? CATEGORY_COLOR[b.type] : "var(--border-inverse)"}`,
                  padding: "0 0 5px",
                  cursor: "pointer",
                }}
              >
                <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-inverse-muted)", marginBottom: 2 }}>
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
                  className="tnum"
                  style={{ color: "var(--text-inverse)", fontSize: "var(--text-sm)", fontWeight: 600, display: "block" }}
                >
                  {formatHours(b.hours)}
                  <span className="text-xs" style={{ color: "var(--text-inverse-muted)", fontWeight: 400, marginLeft: 4 }}>
                    hrs
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
            border: "1px solid var(--border-inverse)",
            borderRadius: "var(--radius-card)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--text-inverse)" }}>{CATEGORY_LABEL[active.type]}</p>
          <p className="text-xs" style={{ color: "var(--text-inverse-muted)", marginTop: 2 }}>
            {formatHours(active.hours)} hours across {active.count}{" "}
            {active.count === 1 ? "entry" : "entries"}. This limb thickens and forks again as you log more.
          </p>
        </div>
      )}
    </section>
  );
}
