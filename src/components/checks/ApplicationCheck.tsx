"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Finding, Severity } from "@/lib/checks";

const LABEL: Record<Severity, string> = { important: "Important", heads_up: "Heads up", note: "Note" };
const BADGE: Record<Severity, string> = { important: "badge badge-danger", heads_up: "badge badge-warning", note: "badge" };

/** At most 3 findings, already filtered and ordered on the server. */
export default function ApplicationCheck({ findings }: { findings: Finding[] }) {
  const router = useRouter();
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const shown = findings.filter((f) => !hidden.has(f.key));

  async function dismiss(key: string, mode: "30d" | "permanent") {
    setError(null);
    setHidden((h) => new Set(h).add(key));
    const r = await fetch("/api/findings/dismiss", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, mode }),
    }).catch(() => null);
    if (!r || !r.ok) {
      setHidden((h) => {
        const n = new Set(h);
        n.delete(key);
        return n;
      });
      setError("That did not save. Please try again.");
      return;
    }
    router.refresh();
  }

  return (
    <section className="card" style={{ padding: "var(--sp-3)" }} aria-labelledby="app-check-title" data-tour="app-check">
      <div className="flex items-baseline justify-between gap-3 flex-wrap" style={{ marginBottom: "var(--sp-15)" }}>
        <h2 className="section-title" id="app-check-title" style={{ margin: 0 }}>Application check</h2>
        <p className="meta">Checks on your own entries. Benchmarks are common ones, not requirements.</p>
      </div>

      {shown.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Nothing needs attention right now.
        </p>
      ) : (
        <ul>
          {shown.map((f, i) => (
            <li
              key={f.key}
              style={{ padding: "var(--sp-15) 0", borderTop: i ? "1px solid var(--border)" : undefined }}
            >
              <div>
                <p className="text-sm measure" style={{ color: "var(--text)" }}>
                  <span className={BADGE[f.severity]} style={{ marginRight: "var(--sp-1)" }}>{LABEL[f.severity]}</span>
                  {f.message}
                </p>
                <div className="flex items-center gap-x-4 gap-y-1 flex-wrap" style={{ marginTop: "var(--sp-1)" }}>
                  {f.href && (
                    <Link href={f.href} className="link text-sm">
                      {f.href.startsWith("/dashboard/new") ? "Log hours" : f.href.includes("/edit") ? "Edit entry" : "See entries"}
                    </Link>
                  )}
                  <button type="button" className="btn btn-sm btn-ghost" style={{ color: "var(--text-muted)" }} onClick={() => dismiss(f.key, "30d")}>
                    Hide for 30 days
                  </button>
                  <button type="button" className="btn btn-sm btn-ghost" style={{ color: "var(--text-muted)" }} onClick={() => dismiss(f.key, "permanent")}>
                    Not relevant to me
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="field-error" role="status">{error}</p>}
    </section>
  );
}
