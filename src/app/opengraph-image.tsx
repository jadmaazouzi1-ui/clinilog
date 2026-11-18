import { ImageResponse } from "next/og";
import { taperedRibbon } from "@/lib/branch";
import { CATEGORY_ORDER, LEAF_KIND, TRUNK, TRUNK_W_BASE, TRUNK_W_TIP, VB_H, VB_W, buildBranches } from "@/lib/pathTree";
import { SAMPLE_EXPERIENCES } from "@/lib/sampleData";
import { markDataUri } from "@/lib/logo";
import { PALETTE, PATH_COLORS } from "@/lib/palette";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ClinicLog MD: keep every hour ready for AMCAS. A Your path tree drawn from sample data.";

// The black band with the mark, the headline and a Your path tree drawn from
// sample data. ImageResponse cannot read CSS variables, so colours come
// from the palette, in CATEGORY_ORDER like the Your Path card.
const LEAF: Record<string, string> = Object.fromEntries(CATEGORY_ORDER.map((t, i) => [t, PATH_COLORS[i]]));
const LIMB = PALETTE.night300;
const LIMB_OPACITY = 0.9;
export default function OpengraphImage() {
  const { branches } = buildBranches(SAMPLE_EXPERIENCES);
  const parts: string[] = [`<path d="${taperedRibbon(TRUNK, TRUNK_W_BASE, TRUNK_W_TIP, 34)}" fill="${PALETTE.creamMuted}"/>`];
  for (const b of branches) {
    const hollow = LEAF_KIND[b.type] === "hollow";
    const leaf = (d: string, t: string) =>
      `<path d="${d}" transform="${t}" fill="${hollow ? "none" : LEAF[b.type]}" stroke="${hollow ? LEAF[b.type] : "none"}" stroke-width="1.6"/>`;
    parts.push(`<path d="${b.d}" fill="${LIMB}" fill-opacity="${LIMB_OPACITY}"/>`);
    for (const s of b.subs) parts.push(`<path d="${s.d}" fill="${LIMB}" fill-opacity="${LIMB_OPACITY}"/>`, leaf(s.leafD, s.leafTransform));
    parts.push(leaf(b.leafD, b.leafTransform));
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="1056" height="396">${parts.join("")}</svg>`;

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: PALETTE.black, display: "flex", flexDirection: "column", padding: "56px 72px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: PALETTE.creamMuted, fontSize: 24, alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", color: PALETTE.cream, fontWeight: 600 }}>
            <img src={markDataUri(40)} width={40} height={40} alt="" style={{ marginRight: 16 }} />
            ClinicLog MD
          </span>
          <span>Sample data</span>
        </div>
        <div style={{ color: PALETTE.cream, fontSize: 72, fontWeight: 500, lineHeight: 1.02, letterSpacing: -2, marginTop: 36, maxWidth: 900 }}>
          Keep every hour ready for AMCAS.
        </div>
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} width={1056} height={396} alt="" style={{ marginTop: -40 }} />
      </div>
    ),
    { ...size }
  );
}
