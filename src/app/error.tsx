"use client";

import Link from "next/link";

// Shown when a page throws. Nothing from the error itself is displayed:
// messages and digests stay in the server log.
export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main style={{ background: "var(--background)", padding: "var(--sp-12) var(--sp-3)", minHeight: "70vh" }}>
      <div style={{ maxWidth: 560, marginInline: "auto" }}>
        <h1 className="text-3xl">This page did not load.</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "var(--sp-2)" }}>
          Something failed on our side, not yours. Anything you saved before this is safe. Try once more, and if it
          keeps happening, come back in a few minutes.
        </p>
        <div className="flex flex-wrap gap-2" style={{ marginTop: "var(--sp-4)" }}>
          <button type="button" onClick={() => reset()} className="btn btn-primary">Try again</button>
          <Link href="/dashboard" className="btn btn-ghost">Go to your Overview</Link>
        </div>
      </div>
    </main>
  );
}
