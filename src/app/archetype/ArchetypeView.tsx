"use client";

import { useEffect, useState, useRef } from "react";
import { PALETTE } from "@/lib/palette";
import Link from "next/link";
import { ARCHETYPES, ArchetypeAnalysis, getArchetype } from "@/lib/archetypes";
import { formatDate } from "@/lib/format";
import { Loading } from "@/components/ui";

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

  // How much evidence the assessment rests on. Three entries is the minimum
  // the analysis will run on, so that floor reads as LOW rather than as a
  // confident result drawn from almost nothing.
  const confidence =
    experienceCount >= 10
      ? { level: "HIGH", color: "var(--text-muted)" }
      : experienceCount >= 6
      ? { level: "MODERATE", color: "var(--text-muted)" }
      : { level: "LOW", color: "var(--text-muted)" };

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
      // A request on first view, the documented case for an effect. The
      // loading flag it sets is what the user should see straight away.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      runAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Not enough experiences ────────────────────────────────────────────
  if (experienceCount < 3) {
    return (
      <div className="card rounded-2xl p-10 text-center" data-tour="archetype-locked">
        <h1 className="text-2xl mb-2">Almost there</h1>
        <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
          Your archetype is available after you log <strong>3 experiences</strong>. You have {experienceCount} so far.
        </p>
        <Link
          href="/dashboard/new"
          className="btn btn-primary"
        >
          Log an experience
        </Link>
      </div>
    );
  }

  // ── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="card" style={{ padding: "var(--sp-6) var(--sp-3)" }}>
        <Loading label="Analyzing experience data" />
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)", marginTop: "var(--sp-2)", marginBottom: 4 }}>
          Analyzing your experiences
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", maxWidth: 440 }}>
          Reading every hour, every reflection, every organization. This usually takes 10 to 20 seconds.
        </p>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────
  if (error && !analysis) {
    return (
      <div className="card" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
        <h1 className="text-lg font-bold" style={{ color: "var(--text)", marginTop: "var(--sp-1)", marginBottom: 4 }}>
          Couldn&apos;t generate your archetype
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", maxWidth: 440, marginBottom: "var(--sp-3)" }}>{error}</p>
        <button onClick={runAnalysis} className="btn btn-primary">
          Try again
        </button>
      </div>
    );
  }

  if (!analysis) return null;

  const archetype = getArchetype(analysis.archetype_id) ?? ARCHETYPES[0];
  const color = "var(--action)";

  function downloadCard() {
    const canvas = document.createElement("canvas");
    const w = 1200, h = 630;
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas cannot read CSS variables: colours come from the palette, and
    // the faces are the page's own, read from the root font variables.
    const root = getComputedStyle(document.documentElement);
    const SERIF = `${root.getPropertyValue("--font-newsreader").trim() || "Georgia"}, Georgia, serif`;
    const SANS = `${root.getPropertyValue("--font-public-sans").trim() || "system-ui"}, system-ui, sans-serif`;
    ctx.fillStyle = PALETTE.black;
    ctx.fillRect(0, 0, w, h);

    // Left-aligned, like the page it comes from.
    const left = 96;
    ctx.textAlign = "left";
    ctx.fillStyle = PALETTE.creamMuted;
    ctx.font = `400 28px ${SANS}`;
    ctx.fillText("My pre-med archetype", left, 120);

    ctx.fillStyle = PALETTE.cream;
    ctx.font = `500 84px ${SERIF}`;
    ctx.fillText(archetype.name, left, 230);

    ctx.fillStyle = PALETTE.creamMuted;
    ctx.font = `italic 400 36px ${SERIF}`;
    ctx.fillText(archetype.tagline, left, 296);

    // Description (wrap)
    ctx.fillStyle = PALETTE.cream;
    ctx.font = `400 28px ${SANS}`;
    const words = archetype.description.split(" ");
    let line = "";
    let y = 390;
    for (const word of words) {
      const test = line + word + " ";
      if (ctx.measureText(test).width > 960) {
        ctx.fillText(line.trim(), left, y);
        line = word + " ";
        y += 42;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line.trim(), left, y);

    ctx.fillStyle = PALETTE.creamMuted;
    ctx.font = `400 24px ${SANS}`;
    ctx.fillText("ClinicLog MD, cliniclogmd.com", left, h - 64);

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
      {/* Reveal hero: cinematic fade-in */}
      <div
        ref={cardRef}
        data-tour="archetype-result"
        className="card relative overflow-hidden"
        style={{
          padding: "var(--sp-4) var(--sp-3)",
          borderLeft: `2px solid ${color}`,
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0) scale(1)" : "translateY(20px) scale(0.95)",
          transition: "opacity 0.8s, transform 0.8s",
        }}
      >
        <div className="relative">
          <div className="flex items-start justify-between gap-3 flex-wrap" style={{ marginBottom: "var(--sp-2)" }}>
            <p className="section-title flex items-center gap-2" style={{ border: 0, padding: 0, margin: 0 }}>
              Assessment
            </p>
            <div className="flex items-center gap-3">
              <span className="meta" style={{ color: confidence.color }}>
                Confidence: {confidence.level.toLowerCase()}
              </span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl mb-2">
            {archetype.name.split("").map((ch, i) => (
              <span
                key={i}
                style={{ animationDelay: `${0.4 + i * 0.04}s`, whiteSpace: ch === " " ? "pre" : "normal" }}
              >
                {ch}
              </span>
            ))}
          </h1>
          <p className="text-base italic mb-4" style={{ color: "var(--text-muted)" }}>
            &ldquo;{archetype.tagline}&rdquo;
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text)", maxWidth: 620 }}>
            {archetype.description}
          </p>

          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <button
              onClick={downloadCard}
              className="btn btn-primary"
            >
                Download Card
            </button>
            <button
              data-tour="archetype-regenerate"
              onClick={runAnalysis}
              disabled={loading}
              className="btn btn-secondary">
              Regenerate
            </button>
          </div>
          {generatedAt && (
            <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
              Generated {formatDate(generatedAt)}
            </p>
          )}
          <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--sp-1)" }}>
            Written by an AI model from what you logged. It can be wrong, so check it before you use it.{" "}
            <Link href="/data-sources" className="link">About this data</Link>
          </p>
        </div>
      </div>

      {/* Why this archetype */}
      <Section title="Based on your entries" color={color}>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>
          {analysis.why_paragraph}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: 8 }}>
          AI assisted. It only sees what you logged, so it changes as you add entries.
        </p>
      </Section>

      {/* Strengths */}
      <Section title="Strengths in your log" color={color}>
        <ul className="space-y-3">
          {analysis.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "var(--surface-alt)", border: `1px solid ${color}` }}
              >
                <svg className="w-3 h-3" fill="none" stroke="var(--success)" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Where to look next: the app no longer suggests schools per
          archetype, because those lists had no source. */}
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        Looking for schools that fit? Compare published averages on the{" "}
        <Link href="/schools" className="link">Schools page</Link>, and see{" "}
        <Link href="/data-sources" className="link">where that data comes from</Link>.
      </p>

      {/* Statement angle */}
      <Section title="A possible statement angle" color={color}>
        <p className="text-sm leading-relaxed italic" style={{ color: "var(--text)" }}>
          {analysis.statement_angle}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: 8 }}>
          AI draft to edit. Your statement should be in your voice and about what you actually did.
        </p>
      </Section>

      {/* Experiences to add */}
      <Section title="Experiences to consider" color={color}>
        <ul className="space-y-3">
          {analysis.experiences_to_add.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-strong)" }}
              >
                <svg className="w-3 h-3" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-sm leading-relaxed" style={{ color: "var(--text)" }}>{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      {error && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{ background: "var(--surface-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; color?: string; children: React.ReactNode }) {
  return (
    <div className="card rounded-2xl p-6">
      <p
        className="text-xs font-bold mb-3"
        style={{ color: "var(--text-muted)" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}
