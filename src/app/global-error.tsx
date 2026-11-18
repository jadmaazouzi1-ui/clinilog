"use client";

import { PALETTE as P } from "@/lib/palette";

// Last-resort boundary for errors thrown in the root layout. It replaces the
// whole document, so the stylesheet may not have loaded: colours come from
// the palette instead of CSS variables. It shows nothing from the error
// itself: digests and messages stay in the server log.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <head>
        <title>ClinicLog MD</title>
      </head>
      <body style={{ margin: 0, background: P.paper, color: P.ink, fontFamily: "Georgia, serif" }}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "96px 24px" }}>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 15, fontWeight: 600, margin: "0 0 48px" }}>ClinicLog MD</p>
          <h1 style={{ fontSize: 40, fontWeight: 500, lineHeight: 1.1, margin: 0 }}>The site did not load.</h1>
          <p style={{ fontFamily: "system-ui, sans-serif", fontSize: 16, lineHeight: 1.6, color: P.stone700, margin: "16px 0 32px" }}>
            Something failed on our side. Anything you saved before this is safe. Reload once, and if it keeps
            happening, come back in a few minutes.
          </p>
          <button
            onClick={() => reset()}
            style={{ fontFamily: "system-ui, sans-serif", fontSize: 15, fontWeight: 600, background: P.gold500, color: P.black, border: 0, borderRadius: 4, padding: "0 18px", minHeight: 44, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
