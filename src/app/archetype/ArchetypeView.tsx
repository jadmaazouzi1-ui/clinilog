"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ARCHETYPES, ArchetypeAnalysis, getArchetype } from "@/lib/archetypes";

interface Props {
  initialAnalysis: ArchetypeAnalysis | null;
  experienceCount: number;
  generatedAt: string | null;
}

export default function ArchetypeView({ initialAnalysis, experienceCount, generatedAt: initialGeneratedAt }: Props) {
  const [analysis, setAnalysis] = useState<ArchetypeAnalysis | null>(initialAnalysis);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(initialGeneratedAt);
  const [revealed, setRevealed] = useState(initialAnalysis !== null);
  const cardRef = useRef<HTMLDivElement>(null);

  async function runAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/archetype", { method: "POST" });
      const raw = await res.text();
      let data: { analysis?: ArchetypeAnalysis; error?: string } = {};
      try { data = JSON.parse(raw); } catch {
        setError(`Server returned non-JSON (status ${res.status}): ${raw.slice(0, 200)}`);
        return;
      }
      if (data.analysis) {
        setAnalysis(data.analysis);
        setGeneratedAt(new Date().toISOString());
        setRevealed(false);
        // Small delay so the reveal animation triggers
        setTimeout(() => setRevealed(true), 50);
      } else {
        setError(data.error ?? `Request failed (status ${res.status})`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(`Could not reach /api/archetype: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  // Auto-run when no stored analysis yet
  useEffect(() => {
    if (!initialAnalysis && experienceCount >= 3) {
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Not enough experiences ────────────────────────────────────────────
  if (experienceCount < 3) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          <svg className="w-7 h-7" fill="none" stroke="#FFFFFF" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2" style={{ color: "#FFFFFF" }}>Almost there</h1>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
          Your Pre-Med Archetype unlocks after you&apos;ve logged <strong>3 experiences</strong>. You have {experienceCount} so far.
        </p>
        <Link
          href="/dashboard/new"
          className="inline-flex items-center gap-2 teal-glow px-5 py-2.5 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
        >
          Log an experience
        </Link>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="loading-text mb-6">Analyzing experience data</p>
        <h1 className="text-xl font-bold mb-2" style={{ color: "#FFFFFF" }}>
          Analyzing your experiences…
        </h1>
        <p className="text-sm max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
          Reading every hour, every reflection, every organization. This usually takes 10–20 seconds.
        </p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────
  if (error && !analysis) {
    return (
      <div className="glass-card rounded-2xl p-10 text-center">
        <h1 className="text-lg font-bold mb-3" style={{ color: "#DC2626" }}>Couldn&apos;t generate your archetype</h1>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>{error}</p>
        <button
          onClick={runAnalysis}
          className="inline-flex items-center gap-2 teal-glow px-5 py-2.5 rounded-xl font-semibold text-sm"
          style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  const archetype = getArchetype(analysis.archetype_id) ?? ARCHETYPES[0];
  const color = "#FFFFFF";

  function downloadCard() {
    const canvas = document.createElement("canvas");
    const w = 1200, h = 630;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, w, h);

    // Dot grid
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    for (let x = 14; x < w; x += 32) {
      for (let y = 14; y < h; y += 32) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // Radial glow
    const grad = ctx.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, 500);
    grad.addColorStop(0, "rgba(255,255,255,0.06)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Top label
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 22px -apple-system, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("MY PRE-MED ARCHETYPE", w / 2, 130);

    // Archetype color accent line
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 60, 165);
    ctx.lineTo(w / 2 + 60, 165);
    ctx.stroke();

    // Archetype name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 76px -apple-system, system-ui, sans-serif";
    ctx.fillText(archetype.name, w / 2, 290);

    // Tagline
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.font = "italic 36px -apple-system, system-ui, sans-serif";
    ctx.fillText(`"${archetype.tagline}"`, w / 2, 365);

    // Description (wrap)
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "28px -apple-system, system-ui, sans-serif";
    const words = archetype.description.split(" ");
    let line = "";
    let y = 450;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 900) {
        ctx.fillText(line.trim(), w / 2, y);
        line = word + " ";
        y += 40;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line.trim(), w / 2, y);

    // CliniLog brand
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "bold 24px -apple-system, system-ui, sans-serif";
    ctx.fillText("CliniLog · Your Pre-Med Journey, Organized", w / 2, h - 50);

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${archetype.id}-archetype.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <div className="space-y-6">
      {/* Reveal hero — cinematic fade-in */}
      <div
        ref={cardRef}
        className="glass-card rounded-2xl p-8 text-center relative overflow-hidden archetype-reveal"
        style={{
          borderColor: `${color}40`,
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          transition: "opacity 0.8s, transform 0.8s",
        }}
      >
        <div className="relative">
          <p
            className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            Your Pre-Med Archetype
          </p>
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              backgroundColor: `${color}1f`,
              border: `1px solid ${color}`,
            }}
          >
            <svg className="w-8 h-8" fill="none" stroke={color} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d={archetype.iconPath} />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 letter-reveal" style={{ color: "#FFFFFF" }}>
            {archetype.name.split("").map((ch, i) => (
              <span
                key={i}
                style={{ animationDelay: `${0.4 + i * 0.04}s`, whiteSpace: ch === " " ? "pre" : "normal" }}
              >
                {ch}
              </span>
            ))}
          </h1>
          <p className="text-base italic mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
            &ldquo;{archetype.tagline}&rdquo;
          </p>
          <p className="text-sm leading-relaxed max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.7)" }}>
            {archetype.description}
          </p>

          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <button
              onClick={downloadCard}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Card
            </button>
            <button
              onClick={runAnalysis}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-opacity"
              style={{ color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.14)", background: "transparent" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          </div>
          {generatedAt && (
            <p className="text-xs mt-3" style={{ color: "rgba(255,255,255,0.55)" }}>
              Generated {new Date(generatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>
      </div>

      {/* Why this archetype */}
      <Section title="Why This Archetype" color={color}>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
          {analysis.why_paragraph}
        </p>
      </Section>

      {/* Strengths */}
      <Section title="Your Strengths" color={color}>
        <ul className="space-y-3">
          {analysis.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: `${color}22`, border: `1px solid ${color}` }}
              >
                <svg className="w-3 h-3" fill="none" stroke={color} strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Ideal schools */}
      <Section title="Schools That Love Your Archetype" color={color}>
        <ul className="space-y-2">
          {archetype.idealSchools.map((s, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
              style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
            >
              <span
                className="text-xs font-bold flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${color}22`, color }}
              >
                {i + 1}
              </span>
              <span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{s}</span>
            </li>
          ))}
        </ul>
        <Link
          href="/schools"
          className="inline-flex items-center gap-1.5 text-xs font-semibold mt-4"
          style={{ color: "#FFFFFF" }}
        >
          Browse all schools
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </Section>

      {/* Statement angle */}
      <Section title="Your Ideal Personal Statement Angle" color={color}>
        <p className="text-sm leading-relaxed italic" style={{ color: "rgba(255,255,255,0.85)" }}>
          {analysis.statement_angle}
        </p>
      </Section>

      {/* Experiences to add */}
      <Section title="Experiences To Add" color={color}>
        <ul className="space-y-3">
          {analysis.experiences_to_add.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                <svg className="w-3 h-3" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      {error && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#DC2626" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <p
        className="text-xs font-bold uppercase tracking-wider mb-3"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}
