"use client";

import { PALETTE as P } from "@/lib/palette";

// Last-resort boundary for errors thrown in the root layout. It replaces the
// whole document, so the stylesheet may not have loaded: colours come from
// the palette instead of CSS variables. It shows nothing from the error
// itself: digests and messages stay in the server log.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: P.paper, color: P.ink, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 440, margin: "64px auto 0", background: P.black, borderBottom: `3px solid ${P.gold500}`, padding: "14px 16px", color: P.cream, fontWeight: 700, fontSize: 14, letterSpacing: ".06em" }}>
          CLINICLOG MD
        </div>
        <div style={{ maxWidth: 440, margin: "0 auto", padding: 24, background: P.white, border: `2px solid ${P.black}`, borderTop: 0 }}>
          <h1 style={{ fontSize: 18, marginTop: 0 }}>Something went wrong</h1>
          <p style={{ color: P.gray700 }}>Please try again. If it keeps happening, reload the page.</p>
          <button onClick={() => reset()} style={{ background: P.gold500, color: P.black, border: `2px solid ${P.gold500}`, padding: "10px 18px", minHeight: 44, fontWeight: 700, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
