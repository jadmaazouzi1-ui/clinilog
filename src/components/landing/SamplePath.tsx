import { Experience, ExperienceType, formatHours } from "@/lib/types";
import { leafPath, taperedRibbon } from "@/lib/branch";
import { CATEGORY_COLOR, CATEGORY_LABEL, LEAF_KIND, TRUNK, TRUNK_W_BASE, TRUNK_W_TIP, VB_H, VB_W, buildBranches } from "@/lib/pathTree";

// Hard-coded sample for the logged-out home page. It never reads user data.
// Clinical work 64 hrs / 7 entries, Shadowing 24 / 2, Research 12 / 1,
// Volunteering 18 / 4: 118 hours across 14 entries.
const SAMPLE: [ExperienceType, number[]][] = [
  ["clinical_work", [12, 10, 9, 9, 8, 8, 8]],
  ["shadowing", [16, 8]],
  ["research", [12]],
  ["volunteer", [6, 4, 4, 4]],
];

export const SAMPLE_EXPERIENCES: Experience[] = SAMPLE.flatMap(([type, hours]) =>
  hours.map((h, i) => ({ id: `sample-${type}-${i}`, type, hours: h }) as unknown as Experience)
);
export const SAMPLE_TOTAL_HOURS = SAMPLE_EXPERIENCES.reduce((s, e) => s + e.hours, 0);

const LIMB = "rgba(230, 242, 234, 0.36)";

/** The dashboard's Your Path tree, drawn from the sample above. Server-rendered, no state. */
export default function SamplePath() {
  const { branches } = buildBranches(SAMPLE_EXPERIENCES);
  const summary = branches.map((b) => `${CATEGORY_LABEL[b.type]} ${formatHours(b.hours)} hours across ${b.count} entries`).join("; ");

  return (
    <figure className="lp-path" aria-labelledby="lp-path-caption">
      <div className="lp-path-head mono">
        <span>YOUR PATH</span>
        <span>
          SAMPLE DATA / {formatHours(SAMPLE_TOTAL_HOURS)} HRS / {SAMPLE_EXPERIENCES.length} ENTRIES
        </span>
      </div>

      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="lp-path-svg"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Sample Your Path tree, not real data. Each branch is a category and grows with logged hours. ${summary}.`}
      >
        <path d={taperedRibbon(TRUNK, TRUNK_W_BASE, TRUNK_W_TIP, 34)} fill={LIMB} />
        {branches.map((b) => {
          const color = CATEGORY_COLOR[b.type];
          const hollow = LEAF_KIND[b.type] === "hollow";
          return (
            <g key={b.type}>
              <path d={b.d} fill={LIMB} />
              {b.subs.map((s, i) => <path key={i} d={s.d} fill={LIMB} />)}
              {b.twigs.map((t, i) => (
                <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} stroke={LIMB} strokeWidth="1.1" strokeLinecap="round" />
              ))}
              {[...b.subs.map((s) => ({ d: s.leafD, t: s.leafTransform, w: 1.2 })), { d: b.leafD, t: b.leafTransform, w: 1.6 }].map((l, i) => (
                <path key={`leaf-${i}`} d={l.d} transform={l.t} fill={hollow ? "none" : color} stroke={hollow ? color : "none"} strokeWidth={hollow ? l.w : 0} />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Labels sit below the drawing so they can never cover a branch or each other. */}
      <figcaption id="lp-path-caption">
        <span className="lp-sr">Sample data. {summary}.</span>
        <ul className="lp-path-legend" aria-hidden="true">
          {branches.map((b) => {
            const hollow = LEAF_KIND[b.type] === "hollow";
            const color = CATEGORY_COLOR[b.type];
            return (
              <li key={b.type}>
                <svg viewBox="-1 -7 14 14" width="22" height="22" aria-hidden="true">
                  <path d={leafPath(LEAF_KIND[b.type], 12)} fill={hollow ? "none" : color} stroke={hollow ? color : "none"} strokeWidth={hollow ? 1.6 : 0} />
                </svg>
                <span>
                  <span className="lp-path-label">{CATEGORY_LABEL[b.type]}</span>
                  <span className="lp-path-hours mono">
                    <span>{formatHours(b.hours)} HRS</span>
                    <span className="lp-path-sep"> / </span>
                    <span>{b.count} {b.count === 1 ? "ENTRY" : "ENTRIES"}</span>
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </figcaption>
    </figure>
  );
}
