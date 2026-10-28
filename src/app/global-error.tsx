"use client";

// Last-resort boundary for errors thrown in the root layout. It replaces the
// whole document, so it renders its own <html> and shows nothing from the
// error itself: digests and messages stay in the server log.
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F5FAF7", color: "#0E1A15", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 440, margin: "64px auto", padding: 24, background: "#fff", border: "1px solid rgba(31,77,58,.34)" }}>
          <h1 style={{ fontSize: 18, marginTop: 0 }}>Something went wrong</h1>
          <p style={{ color: "#40594D" }}>Please try again. If it keeps happening, reload the page.</p>
          <button onClick={() => reset()} style={{ background: "#1F4D3A", color: "#fff", border: 0, padding: "10px 18px", fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
