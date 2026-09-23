import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ARCHETYPES } from "@/lib/archetypes";
import {
  Cubic,
  LeafKind,
  angleAt,
  bezPoint,
  leafPath,
  makeLimb,
  r2,
  taperedRibbon,
} from "@/lib/branch";

const FEATURES = [
  { title: "Hours Tracker",     body: "Log clinical, shadowing, research, and volunteer hours with dates, organizations, and reflections attached to every entry." },
  { title: "School Explorer",   body: "Filter 149 accredited medical schools by GPA, MCAT, mission focus, and state preference." },
  { title: "Archetype Engine",  body: "After three or more logged experiences, AI assigns one of fifteen defined pre-med archetypes with matched schools." },
  { title: "Narrative Builder", body: "Synthesizes your logged experience data into a cohesive application narrative for personal statements." },
  { title: "AI Advisor",        body: "A standing advisor with access to your logged hours, GPA, and goals, available for consultation any time." },
  { title: "Post-bacc Tracker", body: "Calculates BCPM and cumulative GPA in real time as you log post-baccalaureate coursework." },
];

const STATS = [
  { value: "149", label: "Medical schools indexed" },
  { value: "15",  label: "Pre-med archetypes" },
  { value: "12",  label: "Tools included" },
  { value: "$0",  label: "Cost, forever" },
];

const CASE_IDS = ["community_healer", "scientist", "first_gen_grinder"];
const CASES = CASE_IDS
  .map((id) => ARCHETYPES.find((a) => a.id === id))
  .filter((a): a is (typeof ARCHETYPES)[number] => !!a);

/* ── Static hero branch, built from the same geometry the dashboard uses ── */

const HERO_BOUGH: Cubic = [
  { x: -10, y: 182 },
  { x: 116, y: 210 },
  { x: 276, y: 116 },
  { x: 452, y: 140 },
];

const HERO_FORKS: { t: number; side: number; len: number; w: number; kind: LeafKind; color: string; leaf: number }[] = [
  { t: 0.20, side: -1, len: 92, w: 7.5, kind: "solid",   color: "#B7E4C7", leaf: 22 },
  { t: 0.44, side:  1, len: 70, w: 5.5, kind: "hollow",  color: "#74C69D", leaf: 17 },
  { t: 0.62, side: -1, len: 80, w: 6,   kind: "diamond", color: "#B9AEFF", leaf: 16 },
  { t: 0.84, side:  1, len: 54, w: 4,   kind: "round",   color: "#F4A261", leaf: 13 },
];

function HeroBranch() {
  return (
    <svg
      viewBox="0 0 440 300"
      className="w-full"
      style={{ display: "block", height: "auto" }}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <defs>
        <pattern id="herogrid" width="36" height="36" patternUnits="userSpaceOnUse">
          <path d="M36,0 L0,0 L0,36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="440" height="300" fill="url(#herogrid)" />

      <path d={taperedRibbon(HERO_BOUGH, 22, 2, 30)} fill="rgba(226,240,232,0.38)" />

      {HERO_FORKS.map((f, i) => {
        const origin = bezPoint(HERO_BOUGH, f.t);
        const limb = makeLimb(origin, angleAt(HERO_BOUGH, f.t) + f.side * 34, f.len, f.side * 12);
        const tip = limb[3];
        const tipA = angleAt(limb, 1);
        return (
          <g key={i}>
            <path d={taperedRibbon(limb, f.w, 1, 16)} fill="rgba(226,240,232,0.38)" />
            <path
              d={leafPath(f.kind, f.leaf)}
              transform={`translate(${r2(tip.x)} ${r2(tip.y)}) rotate(${r2(tipA)})`}
              fill={f.kind === "hollow" ? "none" : f.color}
              stroke={f.kind === "hollow" ? f.color : "none"}
              strokeWidth={f.kind === "hollow" ? 1.6 : 0}
            />
          </g>
        );
      })}
    </svg>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <style>{`
        .nav-link { color: var(--text-secondary); text-decoration: none; font-weight: 500; }
        .nav-link:hover { color: var(--text-primary); }
        .mobile-menu-btn { display: none; }
        @media (max-width: 767px) {
          .nav-center, .nav-auth-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Navbar */}
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: "rgba(243,247,244,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border-strong)" }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 30, height: 30, borderRadius: "var(--radius)", background: "var(--accent)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
              </svg>
            </div>
            <span className="font-bold" style={{ fontSize: "1.0625rem", color: "var(--text-primary)" }}>ClinicLog MD</span>
          </Link>
          <nav className="nav-center flex items-center gap-8">
            {[["Schools", "/schools"], ["Archetype", "/archetype"], ["Resources", "/resources"], ["Stories", "/stories"], ["About", "/about"]].map(([label, href]) => (
              <Link key={label} href={href} className="nav-link text-sm">{label}</Link>
            ))}
          </nav>
          <div className="nav-auth-desktop flex items-center gap-3">
            <Link href="/auth/login" className="nav-link text-sm">Sign in</Link>
            <Link href="/auth/signup" className="teal-glow text-sm" style={{ padding: "8px 16px", textDecoration: "none" }}>Get started</Link>
          </div>
          <Link href="/auth/signup" className="mobile-menu-btn teal-glow text-sm" style={{ padding: "8px 16px", textDecoration: "none" }}>Get started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-5)" }}>
        <div>
          <span className="beta-pill" style={{ marginBottom: "var(--sp-2)" }}>Free for pre-med students</span>
          <h1 className="font-bold" style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)", lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: "var(--sp-2)" }}>
            Your clinical journey, organized.
          </h1>
          <p className="text-base" style={{ color: "var(--text-secondary)", lineHeight: 1.65, maxWidth: 440, marginBottom: "var(--sp-4)" }}>
            Track clinical hours, discover your pre-med archetype, explore 149 medical schools, and build your path to medicine, completely free.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/auth/signup" className="teal-glow text-sm" style={{ padding: "12px var(--sp-3)", textDecoration: "none" }}>Get started free</Link>
            <Link href="/auth/login" className="btn-ghost text-sm" style={{ padding: "12px var(--sp-3)", textDecoration: "none" }}>Sign in</Link>
          </div>
        </div>

        {/* Branch illustration: the same drawing the dashboard grows from your data */}
        <div
          className="tick-corners tick-corners-light relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--bg-hero-1), var(--bg-hero-2) 58%, var(--bg-hero-3))",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "var(--radius)",
          }}
        >
          <p
            className="absolute"
            style={{ top: 14, left: 16, color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", zIndex: 1 }}
          >
            Your Path
          </p>
          <HeroBranch />
          <p
            className="mono absolute"
            style={{ bottom: 14, left: 16, color: "rgba(255,255,255,0.5)", fontSize: 10, letterSpacing: "0.06em" }}
          >
            EVERY LIMB IS A CATEGORY. IT THICKENS AS YOU LOG.
          </p>
        </div>
      </section>

      {/* Stats: chart readouts on hairlines, left aligned */}
      <section className="max-w-6xl mx-auto px-6" style={{ paddingBottom: "var(--sp-5)" }}>
        <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "var(--sp-3)" }}>
          {STATS.map((s) => (
            <div key={s.label} className="data-field">
              <span className="data-field-label">{s.label}</span>
              <span className="mono" style={{ fontSize: "2rem", fontWeight: 600, color: "var(--accent)", lineHeight: 1.1 }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6"><hr className="tear-line" /></div>

      {/* Features: numbered entries, no decorative icons */}
      <section className="max-w-6xl mx-auto px-6" style={{ paddingTop: "var(--sp-4)", paddingBottom: "var(--sp-5)" }}>
        <p className="dept-header">Everything you need</p>
        <h2 className="font-bold" style={{ fontSize: "2rem", marginBottom: "var(--sp-4)" }}>Twelve tools, zero cost.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3" style={{ gap: "var(--sp-2)" }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass-card" style={{ padding: "var(--sp-2)" }}>
              <span className="exp-id" style={{ display: "block", marginBottom: "var(--sp-1)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-semibold" style={{ fontSize: "1.0625rem", marginBottom: 6 }}>{f.title}</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6"><hr className="tear-line" /></div>

      {/* Archetype case studies */}
      <section className="max-w-6xl mx-auto px-6" style={{ paddingTop: "var(--sp-4)", paddingBottom: "var(--sp-5)" }}>
        <p className="dept-header">Find your fit</p>
        <h2 className="font-bold" style={{ fontSize: "2rem", marginBottom: "var(--sp-4)" }}>Fifteen pre-med archetypes.</h2>
        <div className="grid md:grid-cols-3" style={{ gap: "var(--sp-2)" }}>
          {CASES.map((c) => (
            <div key={c.id} className="glass-card" style={{ padding: "var(--sp-2)" }}>
              <p className="font-semibold" style={{ fontSize: "1.0625rem" }}>{c.name}</p>
              <p className="text-sm italic" style={{ color: "var(--accent)", marginBottom: "var(--sp-1)" }}>{c.tagline}</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{c.description}</p>
            </div>
          ))}
        </div>
        <p style={{ marginTop: "var(--sp-3)" }}>
          <Link href="/archetype" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>See all fifteen archetypes &rarr;</Link>
        </p>
      </section>

      {/* Closing CTA */}
      <section className="max-w-6xl mx-auto px-6" style={{ paddingBottom: "var(--sp-6)" }}>
        <div
          className="tick-corners tick-corners-light"
          style={{
            background: "linear-gradient(135deg, var(--bg-hero-1), var(--bg-hero-2) 58%, var(--bg-hero-3))",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: "var(--radius)",
            padding: "var(--sp-6) var(--sp-4)",
          }}
        >
          <h2 className="font-bold" style={{ fontSize: "2rem", color: "#FFFFFF", marginBottom: "var(--sp-1)" }}>
            Your path to medicine starts here.
          </h2>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)", maxWidth: 440, marginBottom: "var(--sp-3)" }}>
            Every tool, free forever. No credit card, no trial period, no upsell.
          </p>
          <Link
            href="/auth/signup"
            className="inline-block text-sm font-semibold"
            style={{ background: "#FFFFFF", color: "var(--accent)", textDecoration: "none", padding: "12px var(--sp-3)", borderRadius: "var(--radius)" }}
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--border-strong)" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-between gap-4" style={{ paddingTop: "var(--sp-3)", paddingBottom: "var(--sp-3)" }}>
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>&copy; {new Date().getFullYear()} ClinicLog MD. All rights reserved.</p>
          <div className="flex gap-5 flex-wrap">
            {[["Schools", "/schools"], ["Archetype", "/archetype"], ["Resources", "/resources"], ["Stories", "/stories"], ["About", "/about"]].map(([label, href]) => (
              <Link key={label} href={href} className="nav-link text-xs">{label}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
