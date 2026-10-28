import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ClinicLog MD: clinical hours tracker for pre-med students";

// Logo and plain description. No screenshot: every number on it would be invented.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, background: "#F3F7F4", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, borderLeft: "16px solid #1F4D3A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, background: "#1F4D3A", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="52" height="52" viewBox="0 0 24 24">
              <polyline points="2,12 5,12 7,7 9,17 11,10 13,14 15,12 22,12" stroke="#FFFFFF" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, color: "#0E1A15" }}>ClinicLog MD</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#0E1A15", lineHeight: 1.1 }}>Keep your hours ready for AMCAS.</div>
          <div style={{ fontSize: 30, color: "#40594D" }}>Log clinical hours and compare medical schools with your numbers.</div>
        </div>
        <div style={{ fontSize: 22, color: "#40594D", letterSpacing: 2 }}>CLINICLOGMD.COM</div>
      </div>
    ),
    { ...size }
  );
}
