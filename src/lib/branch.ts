/* ──────────────────────────────────────────────────────────────────────────
   Branch geometry: tapered bezier limbs and leaf silhouettes.

   Shared by the dashboard's live "Your Path" drawing and the landing page's
   static illustration so both use the same botanical language.
   ────────────────────────────────────────────────────────────────────────── */

export interface Pt {
  x: number;
  y: number;
}
export type Cubic = [Pt, Pt, Pt, Pt];
export type LeafKind = "solid" | "hollow" | "diamond" | "round" | "narrow";

/**
 * Round emitted coordinates so SSR and the browser serialise them identically.
 * Math.cos/sin/atan2/pow are implementation-defined in their last bit, so raw
 * values differ between the server render and the browser's, and React flags
 * every numeric SVG attribute as a hydration mismatch.
 */
export function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function bezPoint([p0, p1, p2, p3]: Cubic, t: number): Pt {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}

export function bezTangent([p0, p1, p2, p3]: Cubic, t: number): Pt {
  const u = 1 - t;
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}

export function angleAt(curve: Cubic, t: number): number {
  const tan = bezTangent(curve, t);
  return (Math.atan2(tan.y, tan.x) * 180) / Math.PI;
}

/**
 * Trace a tapered outline around a bezier centreline and return a closed path.
 * An SVG stroke cannot change width along its length, so a limb that thins
 * toward its tip has to be drawn as a filled outline. The taper is eased
 * (t^1.15) rather than linear so the limb holds its girth near the base.
 */
export function taperedRibbon(curve: Cubic, wStart: number, wEnd: number, steps = 26): string {
  const left: Pt[] = [];
  const right: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = bezPoint(curve, t);
    const tan = bezTangent(curve, t);
    const len = Math.hypot(tan.x, tan.y) || 1;
    const nx = -tan.y / len;
    const ny = tan.x / len;
    const w = (wStart + (wEnd - wStart) * Math.pow(t, 1.15)) / 2;
    left.push({ x: p.x + nx * w, y: p.y + ny * w });
    right.push({ x: p.x - nx * w, y: p.y - ny * w });
  }
  const fwd = left.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const back = right
    .reverse()
    .map((p) => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  return `${fwd} ${back} Z`;
}

/** Build a swaying limb from an origin, a heading, a length and a sway amount. */
export function makeLimb(origin: Pt, angleDeg: number, length: number, sway: number): Cubic {
  const rad = (angleDeg * Math.PI) / 180;
  const dx = Math.cos(rad);
  const dy = Math.sin(rad);
  const px = -dy;
  const py = dx;
  return [
    origin,
    {
      x: origin.x + dx * length * 0.34 + px * sway * 0.45,
      y: origin.y + dy * length * 0.34 + py * sway * 0.45,
    },
    { x: origin.x + dx * length * 0.7 + px * sway, y: origin.y + dy * length * 0.7 + py * sway },
    { x: origin.x + dx * length, y: origin.y + dy * length },
  ];
}

/* ── Seeded RNG so a branch is irregular but identical on every reload ───── */

export function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Leaf silhouette, drawn pointing along +x from the origin. */
export function leafPath(kind: LeafKind, L: number): string {
  const W = kind === "narrow" ? L * 0.2 : L * 0.4;
  if (kind === "diamond") {
    return `M0,0 L${(L * 0.42).toFixed(1)},${(-W).toFixed(1)} L${L.toFixed(1)},0 L${(L * 0.42).toFixed(1)},${W.toFixed(1)} Z`;
  }
  if (kind === "round") {
    const r = L * 0.33;
    const cx = L * 0.56;
    return `M${(cx - r).toFixed(1)},0 A${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(cx + r).toFixed(1)},0 A${r.toFixed(1)},${r.toFixed(1)} 0 1,0 ${(cx - r).toFixed(1)},0 Z`;
  }
  // solid / hollow / narrow all use the classic two-arc leaf outline
  return [
    `M0,0`,
    `C${(L * 0.26).toFixed(1)},${(-W).toFixed(1)} ${(L * 0.72).toFixed(1)},${(-W * 0.8).toFixed(1)} ${L.toFixed(1)},0`,
    `C${(L * 0.72).toFixed(1)},${(W * 0.8).toFixed(1)} ${(L * 0.26).toFixed(1)},${W.toFixed(1)} 0,0`,
    `Z`,
  ].join(" ");
}
