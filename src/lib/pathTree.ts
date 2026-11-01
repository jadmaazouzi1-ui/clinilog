// Geometry for the Your Path tree, shared by the dashboard and the landing
// page sample so both draw exactly the same branch from the same data.
import { Experience, ExperienceType } from "@/lib/types";
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
   YOUR PATH: an organic branch drawn from the user's logged categories.

   Every limb is a tapered ribbon (a filled outline around a cubic bezier
   centreline), not a stroked line, because an SVG stroke cannot change width
   along its length. Curvature, fork angles and twig placement are drawn from
   a seeded RNG keyed on the category and its entry ids, so the branch looks
   hand-grown and irregular but is identical on every reload.
   ────────────────────────────────────────────────────────────────────────── */

export const CATEGORY_ORDER: ExperienceType[] = ["clinical_work", "shadowing", "research", "volunteer", "other"];
export const CATEGORY_LABEL: Record<ExperienceType, string> = {
  clinical_work: "Clinical Work",
  shadowing: "Shadowing",
  research: "Research",
  volunteer: "Volunteering",
  other: "Other",
};
/* Leaf colours come from the --leaf-* ramp, which is the chart ramp shifted
   light. The --cat-* values are tuned against the white donut card, and the
   darker end of that ramp is close enough to this panel's own gradient that a
   mark drawn in it would vanish. Category identity is carried by shape, so
   these only need to separate each mark from the field. */
export const CATEGORY_COLOR: Record<ExperienceType, string> = {
  clinical_work: "var(--leaf-clinical)",
  shadowing: "var(--leaf-shadowing)",
  research: "var(--leaf-research)",
  volunteer: "var(--leaf-volunteer)",
  other: "var(--leaf-other)",
};
/* Leaf silhouette per category, so a limb is identifiable by shape alone
   and not by colour only. */
export const LEAF_KIND: Record<ExperienceType, LeafKind> = {
  clinical_work: "solid",
  shadowing: "hollow",
  research: "diamond",
  volunteer: "round",
  other: "narrow",
};

export const VB_W = 880;
export const VB_H = 330;

/* The bough: enters thick at the left edge and tapers away to the right,
   with a gentle organic sway. Cropped at the left like a botanical plate. */
export const TRUNK: Cubic = [
  { x: -12, y: 200 },
  { x: 236, y: 248 },
  { x: 566, y: 126 },
  { x: 862, y: 152 },
];
export const TRUNK_W_BASE = 26;
export const TRUNK_W_TIP = 2.5;

/* ── Derived branch model ───────────────────────────────────────────────── */

export interface Twig {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
export interface SubLimb {
  d: string;
  leafD: string;
  leafTransform: string;
}
export interface Branch {
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

export function buildBranches(experiences: Experience[]): { branches: Branch[]; totalHours: number } {
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
