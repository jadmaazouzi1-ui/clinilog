import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TICKER_ITEMS = [
  "HOURS TRACKER", "149 SCHOOLS", "15 ARCHETYPES", "NARRATIVE BUILDER",
  "AI ADVISOR", "REFRAME ENGINE", "SPECIALTY EXPLORER", "PDF EXPORT",
  "GAP YEAR PLANNER", "RESOURCE LIBRARY", "FIRST-GEN STORIES", "100% FREE",
];

const TOOLS = [
  { n: "01", name: "Hours Tracker",       desc: "Log clinical, shadowing, research, and volunteer hours with dates and reflections.", tag: "CORE" },
  { n: "02", name: "School Explorer",     desc: "Filter 149 accredited medical schools by GPA, MCAT, mission, and state preference.", tag: "CORE" },
  { n: "03", name: "Archetype Engine",    desc: "AI analyzes your experiences and reveals your unique pre-med identity from 15 types.", tag: "AI" },
  { n: "04", name: "Narrative Builder",   desc: "AI builds a cohesive medical school application story from your logged experience data.", tag: "AI" },
  { n: "05", name: "Reframe Engine",      desc: "Transform rough descriptions into polished, AMCAS-ready language with clinical depth.", tag: "AI" },
  { n: "06", name: "AI Advisor",          desc: "24/7 personalized guidance that knows your hours, GPA, goals, and school targets.", tag: "AI" },
  { n: "07", name: "Specialty Explorer",  desc: "Browse 30+ medical specialties by lifestyle, salary, residency length, and competitiveness.", tag: "EXPLORE" },
  { n: "08", name: "Resource Library",    desc: "Curated free MCAT prep, fee assistance programs, and pipeline opportunities.", tag: "EXPLORE" },
  { n: "09", name: "Gap Year Planner",    desc: "Structured goal tracking, monthly logs, and milestone checklists for your gap year.", tag: "PLAN" },
  { n: "10", name: "Post-bacc Tracker",   desc: "Calculate your BCPM and cumulative GPA in real time as you log post-bacc courses.", tag: "PLAN" },
  { n: "11", name: "PDF Export",          desc: "Download a clean, formatted summary of all your experiences for advisors and committees.", tag: "EXPORT" },
  { n: "12", name: "CSV Import",          desc: "Import your existing experience data from a spreadsheet in one step.", tag: "IMPORT" },
];

const SAMPLE_LOG = [
  { org: "ACS Cares",          type: "CLINICAL WORK",  hours: "04.4" },
  { org: "Cary Healthcare",    type: "SHADOWING",      hours: "04.0" },
  { org: "Mobile Clinic",      type: "CLINICAL WORK",  hours: "03.0" },
  { org: "VSC HHS",            type: "VOLUNTEERING",   hours: "03.0" },
  { org: "Mobile Clinic Jan",  type: "CLINICAL WORK",  hours: "03.0" },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const tickerText = [...TICKER_ITEMS, ...TICKER_ITEMS].join("  ·  ");

  return (
    <>
      <style>{`
        @keyframes ekg-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .ekg-track {
          animation: ekg-scroll 10s linear infinite;
          display: flex;
          width: 200%;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }
        .pulse-dot {
          animation: pulse-dot 1.6s ease-in-out infinite;
        }
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: ticker-scroll 32s linear infinite;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .tool-row:hover .tool-tag { opacity: 1; }
        .tool-row .tool-tag { opacity: 0.5; transition: opacity 0.15s; }
        a:hover, button:hover { opacity: inherit; }
      `}</style>

      <div style={{ backgroundColor: "#000000", color: "#FFFFFF", minHeight: "100vh", fontFamily: "var(--font-inter, Inter, system-ui, sans-serif)" }}>

        {/* ── Navbar ── */}
        <header style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#000000", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", height: 52 }}>
            {/* Left: Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <div style={{ width: 24, height: 24, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 1 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
                </svg>
              </div>
              <span style={{ fontWeight: 600, fontSize: "0.875rem", color: "#FFFFFF", letterSpacing: "-0.01em" }}>CliniLog</span>
              <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.12)", padding: "2px 5px", letterSpacing: "0.1em", textTransform: "uppercase" }}>BETA</span>
            </div>
            {/* Center: Nav links */}
            <nav style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
              {[["Schools", "/schools"], ["Archetype", "/archetype"], ["Resources", "/resources"], ["Stories", "/stories"], ["About", "/about"]].map(([label, href]) => (
                <Link key={label} href={href} style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.35)", textDecoration: "none", letterSpacing: "0", transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
                >{label}</Link>
              ))}
            </nav>
            {/* Right: Auth */}
            <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", justifyContent: "flex-end" }}>
              <Link href="/auth/login" style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Sign in</Link>
              <Link href="/auth/signup" style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.3)", padding: "0.375rem 0.875rem", borderRadius: 1, textDecoration: "none", transition: "border-color 0.15s, background 0.15s" }}>
                Get started
              </Link>
            </div>
          </div>
        </header>

        {/* ── Ticker ── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden", position: "relative" }}>
          <div className="ticker-track" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.16em", padding: "8px 0" }}>
            <span style={{ paddingRight: "4rem" }}>{tickerText}</span>
            <span style={{ paddingRight: "4rem" }}>{tickerText}</span>
          </div>
        </div>

        {/* ── Hero — 2 column split ── */}
        <section style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1px 1fr" }}>
            {/* Left */}
            <div style={{ padding: "5rem 3rem 5rem 2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
                <div className="pulse-dot" style={{ width: 6, height: 6, backgroundColor: "#FFFFFF", borderRadius: "50%" }} />
                <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase" }}>PRE-MED PLATFORM — 2026</span>
              </div>
              <h1 style={{ fontSize: "clamp(2.25rem, 4.5vw, 3rem)", fontWeight: 700, lineHeight: 1.08, letterSpacing: "-0.03em", color: "#FFFFFF", marginBottom: "1.5rem" }}>
                Your medical journey,<br />
                <span style={{ textDecoration: "underline", textUnderlineOffset: "4px", textDecorationThickness: 1 }}>precisely</span> tracked.
              </h1>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.7, color: "rgba(255,255,255,0.35)", marginBottom: "2.5rem", maxWidth: 400 }}>
                Track clinical hours, discover your archetype, explore 149 medical schools, and build your path to medicine — completely free.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link href="/auth/signup" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", backgroundColor: "#FFFFFF", color: "#000000", fontWeight: 700, fontSize: "0.875rem", padding: "0.75rem 1.5rem", borderRadius: 1, textDecoration: "none" }}>
                  Get started
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/auth/login" style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)", padding: "0.75rem 1.25rem", borderRadius: 1 }}>
                  Sign in
                </Link>
              </div>
            </div>
            {/* Vertical divider */}
            <div style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            {/* Right: 2x2 stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}>
              {[
                { tag: "MEDICAL SCHOOLS", num: "149", label: "Accredited programs" },
                { tag: "ARCHETYPES",      num: "015", label: "Unique pre-med profiles" },
                { tag: "TOOLS TOTAL",     num: "012", label: "Included at no cost" },
                { tag: "COST",            num: "FREE", label: "Forever, no card needed" },
              ].map((s, i) => (
                <div key={s.tag} style={{
                  padding: "2.5rem 2rem",
                  borderRight: i % 2 === 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                  borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none",
                }}>
                  <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{s.tag}</p>
                  <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "2.25rem", fontWeight: 500, color: "#FFFFFF", lineHeight: 1, letterSpacing: "-0.02em", marginBottom: "0.375rem" }}>{s.num}</p>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.25)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EKG bar ── */}
        <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "2rem", height: 56 }}>
            <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.18em", textTransform: "uppercase", flexShrink: 0 }}>CLINICAL HOURS — REAL TIME</span>
            <div style={{ overflow: "hidden", height: 40 }}>
              <div className="ekg-track">
                {[0, 1].map(i => (
                  <svg key={i} height="40" style={{ width: "50%", minWidth: "50%" }} viewBox="0 0 1200 40" preserveAspectRatio="xMidYMid meet">
                    <path d="M0,20 L80,20 L90,16 L100,20 L115,20 L120,26 L125,2 L130,32 L140,20 L200,20 L280,20 L290,16 L300,20 L315,20 L320,26 L325,2 L330,32 L340,20 L400,20 L480,20 L490,16 L500,20 L515,20 L520,26 L525,2 L530,32 L540,20 L600,20 L680,20 L690,16 L700,20 L715,20 L720,26 L725,2 L730,32 L740,20 L800,20 L880,20 L890,16 L900,20 L915,20 L920,26 L925,2 L930,32 L940,20 L1000,20 L1080,20 L1090,16 L1100,20 L1115,20 L1120,26 L1125,2 L1130,32 L1140,20 L1200,20"
                      stroke="rgba(255,255,255,0.2)" strokeWidth="1" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ))}
              </div>
            </div>
            <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "0.875rem", color: "rgba(255,255,255,0.35)", flexShrink: 0 }}>000.0 HRS</span>
          </div>
        </div>

        {/* ── Tools grid ── */}
        <section style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 2rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.18em", textTransform: "uppercase" }}>ALL TOOLS</span>
              <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.18em", textTransform: "uppercase" }}>12 INCLUDED — FREE</span>
            </div>
            {/* 4-column grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
              {TOOLS.map((t, i) => (
                <div
                  key={t.n}
                  className="tool-row"
                  style={{
                    padding: "1.75rem 1.5rem",
                    borderRight: (i + 1) % 4 !== 0 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    borderBottom: i < 8 ? "1px solid rgba(255,255,255,0.06)" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.1em" }}>{t.n}</span>
                    <span className="tool-tag" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)", padding: "2px 5px", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.tag}</span>
                  </div>
                  <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#FFFFFF", marginBottom: "0.5rem", lineHeight: 1.3 }}>{t.name}</p>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.28)", lineHeight: 1.55 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How It Works + Sample Log — 2 col ── */}
        <section style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1px 1fr" }}>
            {/* Left: How it works */}
            <div style={{ padding: "4rem 3rem 4rem 2rem" }}>
              <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.5rem" }}>HOW IT WORKS</p>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.025em", color: "#FFFFFF", lineHeight: 1.1, marginBottom: "2.5rem" }}>
                From sign-up to story<br />in four steps.
              </h2>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { n: "01", title: "Create your free account", desc: "Sign up in 30 seconds — no credit card, no upsells, ever." },
                  { n: "02", title: "Log your experiences", desc: "Track clinical, shadowing, research, and volunteer hours as you go." },
                  { n: "03", title: "Discover your archetype", desc: "AI analyzes your profile and reveals your unique pre-med identity." },
                  { n: "04", title: "Build your narrative", desc: "Reframe your experiences into a compelling medical school story." },
                ].map((step, i, arr) => (
                  <div key={step.n} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "1.25rem", padding: "1.25rem 0", borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                    <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.25)", paddingTop: 2 }}>{step.n}</span>
                    <div>
                      <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "#FFFFFF", marginBottom: "0.25rem" }}>{step.title}</p>
                      <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.3)", lineHeight: 1.55 }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Divider */}
            <div style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            {/* Right: Sample log */}
            <div style={{ padding: "4rem 2rem 4rem 3rem" }}>
              <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.5rem" }}>SAMPLE LOG</p>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.025em", color: "#FFFFFF", lineHeight: 1.1, marginBottom: "2.5rem" }}>
                What your dashboard<br />will look like.
              </h2>
              {/* Log table header */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: "0" }}>
                <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.14em", textTransform: "uppercase" }}>ORGANIZATION</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.14em", textTransform: "uppercase" }}>TYPE</span>
                <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.14em", textTransform: "uppercase" }}>HRS</span>
              </div>
              {SAMPLE_LOG.map((row, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "1rem", padding: "1rem 0", borderBottom: "1px solid rgba(255,255,255,0.06)", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                    <div style={{ width: 2, height: 16, backgroundColor: "#DC2626", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.875rem", color: "#FFFFFF", fontWeight: 500 }}>{row.org}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)", padding: "2px 6px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{row.type}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "0.875rem", color: "rgba(255,255,255,0.6)" }}>{row.hours}</span>
                </div>
              ))}
              <div style={{ marginTop: "1.5rem" }}>
                <Link href="/auth/signup" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
                  Start your log →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Archetype preview — 2 col ── */}
        <section style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1px 1fr" }}>
            {/* Left */}
            <div style={{ padding: "4rem 3rem 4rem 2rem" }}>
              <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.5rem" }}>PRE-MED ARCHETYPE</p>
              <div style={{ border: "1px solid rgba(255,255,255,0.12)", padding: "1.5rem", marginBottom: "1.75rem", borderRadius: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.14em" }}>01 / 15</span>
                  <span style={{ fontSize: "1.125rem", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.01em" }}>The Community Healer</span>
                </div>
                <p style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
                  Your experiences are rooted in underserved communities. You bring cultural competency, patient trust, and a systems-level perspective that mission-driven schools actively seek.
                </p>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,0.25)", lineHeight: 1.65 }}>
                CliniLog analyzes all your logged hours and reflections to reveal which of 15 pre-med archetypes best describes your path — and which schools are built for you.
              </p>
            </div>
            {/* Divider */}
            <div style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            {/* Right: School match grid */}
            <div style={{ padding: "4rem 2rem 4rem 3rem" }}>
              <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.5rem" }}>SCHOOL MATCHES</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, backgroundColor: "rgba(255,255,255,0.06)" }}>
                {[
                  { name: "UCSF", match: "01" },
                  { name: "UNC Chapel Hill", match: "02" },
                  { name: "Morehouse SOM", match: "03" },
                  { name: "Wake Forest SOM", match: "04" },
                ].map((s) => (
                  <div key={s.name} style={{ backgroundColor: "#000000", padding: "1.75rem 1.5rem" }}>
                    <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.625rem" }}>MATCH {s.match}</p>
                    <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "#FFFFFF" }}>{s.name}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1.75rem" }}>
                <Link href="/schools" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "11px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase", textDecoration: "none" }}>
                  Browse all 149 schools →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Closing CTA — 2 col ── */}
        <section style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1px 1fr" }}>
            {/* Left */}
            <div style={{ padding: "5rem 3rem 5rem 2rem" }}>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05, color: "#FFFFFF", marginBottom: "2rem" }}>
                Your path to medicine<br />starts here.
              </h2>
              <Link href="/auth/signup" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: "#FFFFFF", color: "#000000", fontWeight: 700, fontSize: "0.9375rem", padding: "0.875rem 1.75rem", borderRadius: 1, textDecoration: "none" }}>
                Get started free
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            {/* Divider */}
            <div style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            {/* Right: Pricing rows */}
            <div style={{ padding: "5rem 2rem 5rem 3rem" }}>
              <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: "1.5rem" }}>WHAT YOU GET</p>
              {TOOLS.map((t, i) => (
                <div key={t.n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: i < TOOLS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <span style={{ fontSize: "0.875rem", color: "rgba(255,255,255,0.5)" }}>{t.name}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.08)", padding: "2px 7px", letterSpacing: "0.1em" }}>FREE</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1.25rem 2rem" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              © {new Date().getFullYear()} CLINILOG — ALL RIGHTS RESERVED
            </p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {[["SCHOOLS", "/schools"], ["ARCHETYPE", "/archetype"], ["RESOURCES", "/resources"], ["STORIES", "/stories"], ["ABOUT", "/about"]].map(([label, href]) => (
                <Link key={label} href={href} style={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: "9px", color: "rgba(255,255,255,0.18)", letterSpacing: "0.14em", textDecoration: "none", textTransform: "uppercase" }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
