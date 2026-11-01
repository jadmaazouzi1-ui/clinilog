"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Finding, Severity } from "@/lib/checks";

const LABEL: Record<Severity, string> = { important: "IMPORTANT", heads_up: "HEADS UP", note: "NOTE" };
const RULE: Record<Severity, string> = {
  important: "var(--margin-rule)",
  heads_up: "var(--warning)",
  note: "var(--border-strong)",
};

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
    <section className="glass-card tick-corners" style={{ padding: "var(--sp-2)", marginTop: "var(--sp-2)" }} aria-labelledby="app-check-title" data-tour="app-check">
      <p className="dept-header" id="app-check-title" style={{ marginBottom: 4 }}>Application check</p>
      <p className="text-xs" style={{ color: "var(--text-tertiary)", marginBottom: "var(--sp-2)" }}>
        Plain checks on your own entries. Benchmarks are common ones, not requirements.
      </p>

      {shown.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Nothing needs attention right now.</p>
      ) : (
        <ul style={{ display: "grid", gap: "var(--sp-1)" }}>
          {shown.map((f) => (
            <li
              key={f.key}
              style={{ borderLeft: `2px solid ${RULE[f.severity]}`, padding: "8px 0 8px 12px", borderBottom: "1px solid var(--border)" }}
            >
              <p className="exp-id" style={{ marginBottom: 4 }}>{LABEL[f.severity]}</p>
              <p className="text-sm" style={{ color: "var(--text-primary)", lineHeight: 1.55 }}>{f.message}</p>
              <div className="flex items-center gap-x-4 gap-y-1 flex-wrap" style={{ marginTop: 6 }}>
                {f.href && (
                  <Link href={f.href} className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                    {f.href.startsWith("/dashboard/new") ? "Log new hours" : f.href.includes("/edit") ? "Edit entry" : "See entries"}
                  </Link>
                )}
                <button type="button" className="text-xs" style={{ color: "var(--text-tertiary)", textDecoration: "underline", minHeight: 32 }} onClick={() => dismiss(f.key, "30d")}>
                  Hide for 30 days
                </button>
                <button type="button" className="text-xs" style={{ color: "var(--text-tertiary)", textDecoration: "underline", minHeight: 32 }} onClick={() => dismiss(f.key, "permanent")}>
                  Not relevant to me
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs" role="status" style={{ color: "var(--margin-rule)", marginTop: 8 }}>{error}</p>}
    </section>
  );
}
