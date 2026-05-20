"use client";

import { useState } from "react";
import { Experience } from "@/lib/types";

interface NarrativeResult {
  theme: string;
  whoIAm: string;
  descriptions: { id: string; title: string; description: string }[];
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="text-xs px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 flex-shrink-0"
      style={{
        color: copied ? "#10B981" : "#00D4FF",
        border: `1px solid ${copied ? "rgba(16,185,129,0.35)" : "rgba(0,212,255,0.35)"}`,
        background: copied ? "rgba(16,185,129,0.08)" : "rgba(0,212,255,0.08)",
      }}
    >
      {copied ? (
        <>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function CharCount({ text }: { text: string }) {
  const count = text.length;
  const over = count > 700;
  return (
    <span className="text-xs" style={{ color: over ? "#FF4757" : "rgba(248,250,252,0.35)" }}>
      {count}/700{over && " — over limit!"}
    </span>
  );
}

export default function NarrativeBuilder({ experiences }: { experiences: Experience[] }) {
  const [result, setResult] = useState<NarrativeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ experiences }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (experiences.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)" }}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2" style={{ color: "#F8FAFC" }}>No experiences logged yet</h2>
        <p className="text-sm" style={{ color: "rgba(248,250,252,0.5)" }}>
          Add clinical experiences from your dashboard first, then come back to generate your narrative.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generate button card */}
      <div className="glass-card rounded-2xl p-6 flex items-center justify-between gap-6 flex-wrap">
        <div>
          <h2 className="text-base font-semibold mb-1" style={{ color: "#F8FAFC" }}>
            Ready to build your narrative
          </h2>
          <p className="text-sm" style={{ color: "rgba(248,250,252,0.55)" }}>
            Analyzing {experiences.length} experience{experiences.length !== 1 ? "s" : ""} · {experiences.reduce((s, e) => s + e.hours, 0)} total hours
          </p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="teal-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
          style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0110 10" />
              </svg>
              Generating…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              {result ? "Regenerate" : "Generate Narrative"}
            </>
          )}
        </button>
      </div>

      {error && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", color: "#FF4757" }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "rgba(0,212,255,0.3)", borderTopColor: "#00D4FF" }}
            />
            <p className="text-sm" style={{ color: "rgba(248,250,252,0.6)" }}>
              Analyzing your experiences with Gemini AI…
            </p>
          </div>
        </div>
      )}

      {result && !loading && (
        <>
          {/* Personal Statement Theme */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(0,212,255,0.12)", border: "1px solid rgba(0,212,255,0.2)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm" style={{ color: "#F8FAFC" }}>Personal Statement Theme</h3>
              </div>
              <CopyButton text={result.theme} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.8)" }}>
              {result.theme}
            </p>
          </div>

          {/* Who I Am */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="#A78BFA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-sm" style={{ color: "#F8FAFC" }}>&ldquo;Who I Am&rdquo; Summary</h3>
              </div>
              <CopyButton text={result.whoIAm} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.8)" }}>
              {result.whoIAm}
            </p>
          </div>

          {/* AMCAS Descriptions */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: "rgba(248,250,252,0.45)" }}>
              AMCAS-Ready Descriptions
            </h3>
            <div className="space-y-4">
              {result.descriptions.map((d) => (
                <div key={d.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-semibold text-sm" style={{ color: "#F8FAFC" }}>{d.title}</h4>
                    <CopyButton text={d.description} />
                  </div>
                  <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(248,250,252,0.75)" }}>
                    {d.description}
                  </p>
                  <CharCount text={d.description} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
