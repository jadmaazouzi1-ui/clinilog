import { ImageResponse } from "next/og";
import { taperedRibbon } from "@/lib/branch";
import { LEAF_KIND, TRUNK, TRUNK_W_BASE, TRUNK_W_TIP, VB_H, VB_W, buildBranches } from "@/lib/pathTree";
import { SAMPLE_EXPERIENCES } from "@/components/landing/SamplePath";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ClinicLog MD: watch your experience grow into a record. A sample Your Path tree.";

// The dark hero with the headline and the same sample tree as the home page.
const LEAF: Record<string, string> = {
  clinical_work: "#FFFFFF",
  shadowing: "#D6E8DC",
  research: "#AECFBB",
  volunteer: "#8FC2A5",
  other: "#6FA98B",
};
const LIMB = "rgba(230,242,234,0.36)";

export default function OpengraphImage() {
  const { branches } = buildBranches(SAMPLE_EXPERIENCES);
  const parts: string[] = [`<path d="${taperedRibbon(TRUNK, TRUNK_W_BASE, TRUNK_W_TIP, 34)}" fill="${LIMB}"/>`];
  for (const b of branches) {
    const hollow = LEAF_KIND[b.type] === "hollow";
    const leaf = (d: string, t: string) =>
      `<path d="${d}" transform="${t}" fill="${hollow ? "none" : LEAF[b.type]}" stroke="${hollow ? LEAF[b.type] : "none"}" stroke-width="1.6"/>`;
    parts.push(`<path d="${b.d}" fill="${LIMB}"/>`);
    for (const s of b.subs) parts.push(`<path d="${s.d}" fill="${LIMB}"/>`, leaf(s.leafD, s.leafTransform));
    parts.push(leaf(b.leafD, b.leafTransform));
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="1056" height="396">${parts.join("")}</svg>`;

  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: "#14342A", display: "flex", flexDirection: "column", padding: "56px 72px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "#8FC2A5", fontSize: 22, letterSpacing: 3 }}>
          <span style={{ color: "#FFFFFF", fontWeight: 800 }}>CLINICLOG MD</span>
          <span>SAMPLE DATA / 118 HRS / 14 ENTRIES</span>
        </div>
        <div style={{ color: "#FFFFFF", fontSize: 66, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, marginTop: 36, maxWidth: 900 }}>
          Watch your experience grow into a record.
        </div>
        <img src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`} width={1056} height={396} alt="" style={{ marginTop: -40 }} />
      </div>
    ),
    { ...size }
  );
}
