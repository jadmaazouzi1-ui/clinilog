"use client";

import { useState } from "react";
import { EkgLoader, TabIndex, VitalFlat } from "@/components/MedicalIcons";

interface Q { question: string; why: string }
interface Questions { traditional: Q[]; mmi: Q[] }

function Block({ title, tab, items }: { title: string; tab: number; items: Q[] }) {
  if (!items?.length) return null;
  return (
    <>
      <p className="dept-header flex items-center gap-2">{title} <TabIndex n={tab} /></p>
      <div style={{ marginBottom: "var(--sp-3)" }}>
        {items.map((q, i) => (
          <div
            key={i}
            style={{ padding: "10px 0 10px 10px", borderBottom: "1px solid var(--border)", boxShadow: "inset 3px 0 0 -1px var(--accent)" }}
          >
            <p className="text-sm" style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>
              <span className="mono" style={{ color: "var(--text-tertiary)", marginRight: 8 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {q.question}
            </p>
            {q.why && (
              <p className="text-xs" style={{ color: "var(--text-secondary)", marginTop: 4, fontStyle: "italic" }}>
                {q.why}
              </p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default function MockInterviewView({ ready }: { ready: boolean }) {
  const [questions, setQuestions] = useState<Questions | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/mock-interview", { method: "POST" });
      const data = await res.json();
      if (data.questions) {
        setQuestions(data.questions);
        if (typeof data.remaining === "number") setRemaining(data.remaining);
      } else {
        setError(data.error ?? `Request failed (${res.status}).`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the question service.");
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
          {questions ? "Regenerate" : "Generate questions"}
        </button>
        <span className="exp-id">
          {remaining === null ? "3 REGENERATES PER DAY" : `${remaining} REGENERATE${remaining === 1 ? "" : "S"} LEFT TODAY`}
        </span>
      </div>

      {loading && (
        <div className="glass-card" style={{ padding: "var(--sp-3)", marginBottom: "var(--sp-2)" }}>
          <EkgLoader label="Reading your record" width={150} />
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-2)", borderLeft: "2px solid var(--margin-rule)" }}>
          <VitalFlat />
          <p className="text-sm" style={{ color: "var(--text-secondary)", marginTop: 6 }}>{error}</p>
        </div>
      )}

      {questions && !loading && (
        <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
          <Block title="Traditional" tab={1} items={questions.traditional} />
          <hr className="tear-line" />
          <Block title="MMI scenarios" tab={2} items={questions.mmi} />
        </div>
      )}
    </>
  );
}
