"use client";

import { useState } from "react";
import { EkgLoader, TabIndex, VitalFlat } from "@/components/MedicalIcons";

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
          className="teal-glow text-sm"
          style={{ padding: "10px var(--sp-3)", opacity: loading || !ready ? 0.6 : 1, cursor: ready ? "pointer" : "not-allowed" }}
        >
          {outline ? "Regenerate outline" : "Generate outline"}
        </button>
        <span className="exp-id">3 PER DAY</span>
      </div>

      {loading && (
        <div className="glass-card" style={{ padding: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>
          <EkgLoader label="Reading your record" width={150} />
        </div>
      )}

      {error && (
        <div
          className="glass-card"
          style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-2)", borderLeft: "2px solid var(--margin-rule)" }}
        >
          <VitalFlat />
          <p className="text-sm" style={{ color: "var(--text-secondary)", marginTop: 6 }}>{error}</p>
        </div>
      )}

      {outline && !loading && (
        <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
          <p className="dept-header flex items-center gap-2">Opening hook <TabIndex n={1} /></p>
          <p className="text-sm" style={{ color: "var(--text-primary)", lineHeight: 1.7, marginBottom: "var(--sp-3)" }}>
            {outline.hook}
          </p>

          <hr className="tear-line" />

          <p className="dept-header flex items-center gap-2">Body themes <TabIndex n={2} /></p>
          {outline.themes?.map((t, i) => (
            <div key={i} style={{ marginBottom: "var(--sp-3)", paddingLeft: 10, boxShadow: "inset 3px 0 0 -1px var(--accent)" }}>
              <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                {String(i + 1).padStart(2, "0")}. {t.title}
              </p>
              <p className="exp-id" style={{ margin: "3px 0 5px" }}>EVIDENCE: {t.evidence}</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>{t.development}</p>
            </div>
          ))}

          <hr className="tear-line" />

          <p className="dept-header flex items-center gap-2">Closing <TabIndex n={3} /></p>
          <p className="text-sm" style={{ color: "var(--text-primary)", lineHeight: 1.7, marginBottom: "var(--sp-3)" }}>
            {outline.closing}
          </p>

          {outline.watch_out && (
            <div
              style={{
                padding: "10px var(--sp-2)",
                border: "1px solid var(--border-strong)",
                borderLeft: "2px solid var(--warning)",
                borderRadius: "var(--radius)",
              }}
            >
              <p className="exp-id" style={{ marginBottom: 4 }}>WATCH OUT</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{outline.watch_out}</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
