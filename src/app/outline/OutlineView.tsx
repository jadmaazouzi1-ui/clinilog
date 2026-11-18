"use client";

import { useState } from "react";
import { Loading } from "@/components/ui";

interface Outline {
  hook: string;
  themes: { title: string; evidence: string; development: string }[];
  closing: string;
  watch_out: string;
}

export default function OutlineView({ ready }: { ready: boolean }) {
  const [outline, setOutline] = useState<Outline | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/outline", { method: "POST" });
      const data = await res.json();
      if (data.outline) setOutline(data.outline);
      else setError(data.error ?? `Request failed (${res.status}).`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the outline service.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 flex-wrap" style={{ marginBottom: "var(--sp-3)" }}>
        <button
          onClick={generate}
          disabled={loading || !ready}
          className="btn btn-primary text-sm"
          style={{ padding: "10px var(--sp-3)", opacity: loading || !ready ? 0.6 : 1, cursor: ready ? "pointer" : "not-allowed" }}
        >
          {outline ? "Regenerate outline" : "Generate outline"}
        </button>
        <span className="meta">10 PER DAY</span>
      </div>

      {loading && (
        <div className="card" style={{ padding: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>
          <Loading label="Reading your record" />
        </div>
      )}

      {error && (
        <div
          className="card"
          style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-2)", borderLeft: "2px solid var(--danger)" }}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: 6 }}>{error}</p>
        </div>
      )}

      {outline && !loading && (
        <div className="card" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
          <p className="meta" style={{ marginBottom: "var(--sp-2)" }}>AI DRAFT / A STARTING POINT. WRITE THE STATEMENT IN YOUR OWN WORDS, FROM YOUR OWN EXPERIENCES</p>
          <p className="section-title flex items-center gap-2">Opening hook</p>
          <p className="text-sm" style={{ color: "var(--text)", lineHeight: 1.7, marginBottom: "var(--sp-3)" }}>
            {outline.hook}
          </p>

          <hr className="rule" />

          <p className="section-title flex items-center gap-2">Body themes</p>
          {outline.themes?.map((t, i) => (
            <div key={i} style={{ marginBottom: "var(--sp-3)", paddingLeft: 10, borderLeft: "2px solid var(--border-strong)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                {String(i + 1).padStart(2, "0")}. {t.title}
              </p>
              <p className="meta" style={{ margin: "3px 0 5px" }}>EVIDENCE: {t.evidence}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)", lineHeight: 1.7 }}>{t.development}</p>
            </div>
          ))}

          <hr className="rule" />

          <p className="section-title flex items-center gap-2">Closing</p>
          <p className="text-sm" style={{ color: "var(--text)", lineHeight: 1.7, marginBottom: "var(--sp-3)" }}>
            {outline.closing}
          </p>

          {outline.watch_out && (
            <div
              style={{
                padding: "10px var(--sp-2)",
                border: "1px solid var(--border-strong)",
                borderLeft: "2px solid var(--action)",
                borderRadius: "var(--radius)",
              }}
            >
              <p className="meta" style={{ marginBottom: 4 }}>WATCH OUT</p>
              <p className="text-sm" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>{outline.watch_out}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
