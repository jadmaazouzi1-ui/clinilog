import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const TICKER_ITEMS = [
  "HOURS TRACKER", "149 SCHOOLS", "15 ARCHETYPES", "NARRATIVE BUILDER",
  "AI ADVISOR", "REFRAME ENGINE", "SPECIALTY EXPLORER", "PDF EXPORT",
  "GAP YEAR PLANNER", "RESOURCE LIBRARY", "FIRST-GEN STORIES", "100% FREE",
];

const TOOLS = [
  { n: "01", name: "Hours Tracker",       desc: "Log clinical, shadowing, research, and volunteer hours with dates and reflections." },
  { n: "02", name: "School Explorer",     desc: "Filter 149 accredited medical schools by GPA, MCAT, mission, and state preference." },
  { n: "03", name: "Archetype Engine",    desc: "AI analyzes your experiences and reveals your unique pre-med identity from 15 types." },
  { n: "04", name: "Narrative Builder",   desc: "AI builds a cohesive medical school application story from your logged experience data." },
  { n: "05", name: "Reframe Engine",      desc: "Transform rough descriptions into polished, AMCAS-ready language with clinical depth." },
  { n: "06", name: "AI Advisor",          desc: "24/7 personalized guidance that knows your hours, GPA, goals, and school targets." },
  { n: "07", name: "Specialty Explorer",  desc: "Browse 30+ medical specialties by lifestyle, salary, residency length, and competitiveness." },
  { n: "08", name: "Resource Library",    desc: "Curated free MCAT prep, fee assistance programs, and pipeline opportunities." },
  { n: "09", name: "Gap Year Planner",    desc: "Structured goal tracking, monthly logs, and milestone checklists for your gap year." },
  { n: "10", name: "Post-bacc Tracker",   desc: "Calculate your BCPM and cumulative GPA in real time as you log post-bacc courses." },
  { n: "11", name: "PDF Export",          desc: "Download a clean, formatted summary of all your experiences for advisors and committees." },
  { n: "12", name: "CSV Import",          desc: "Import your existing experience data from a spreadsheet in one step." },
];

const STEPS = [
  { n: "01", title: "Create your free account", desc: "Sign up in 30 seconds. No credit card, no upsells, ever." },
  { n: "02", title: "Log your experiences",     desc: "Track clinical, shadowing, research, and volunteer hours as you go." },
  { n: "03", title: "Discover your archetype",  desc: "AI analyzes your profile and reveals your unique pre-med identity." },
  { n: "04", title: "Build your narrative",     desc: "Reframe your experiences into a compelling medical school story." },
];

const MONO = "var(--font-jetbrains-mono, monospace)";

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
        .ticker-track {
          display: inline-flex;
          white-space: nowrap;
          animation: ticker-scroll 32s linear infinite;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .nav-link { color: #000000; text-decoration: none; }
        .nav-link:hover { text-decoration: underline; text-decoration-thickness: 2px; }
        .invert-btn {
          background: #000000; color: #FFFFFF;
          border: 2px solid #000000;
          font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
          text-decoration: none; display: inline-block;
        }
        .invert-btn:hover { background: #FFFFFF; color: #000000; }
        .ghost-btn {
          background: #FFFFFF; color: #000000;
          border: 2px solid #000000;
          font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
          text-decoration: none; display: inline-block;
        }
        .ghost-btn:hover { background: #000000; color: #FFFFFF; }
        .tool-cell { background: #FFFFFF; }
        .tool-cell:hover { background: #000000; }
        .tool-cell:hover p, .tool-cell:hover span { color: #FFFFFF !important; }

        .split-2col { display: grid; grid-template-columns: 1fr 2px 1fr; }
        .steps-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; background: #000000; }
        .tools-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2px; background: #000000; }
        .nav-grid { display: grid; grid-template-columns: auto 2px 1fr 2px auto; align-items: stretch; }

        /* Mobile hamburger menu — hidden by default, shown only under 767px */
        .hamburger-label { display: none; }
        .mm-checkbox { position: absolute; opacity: 0; pointer-events: none; width: 0; height: 0; }
        .mobile-menu-overlay {
          display: none;
          position: fixed;
          inset: 0;
          z-index: 150;
          background: #FFFFFF;
          flex-direction: column;
          overflow-y: auto;
        }
        .mm-checkbox:checked ~ .mobile-menu-overlay { display: flex; }
        .mobile-menu-close {
          position: absolute;
          top: 6px; right: 6px;
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          background: transparent; border: none; cursor: pointer;
        }
        .mobile-menu-links { display: flex; flex-direction: column; margin-top: 64px; }
        .mobile-menu-item {
          display: block;
          padding: 1.25rem 1.5rem;
          font-size: 1.5rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: #000000;
          text-decoration: none;
          border-bottom: 2px solid #000000;
        }
        .mobile-menu-item-cta { background: #000000; color: #FFFFFF; }

        @media (max-width: 900px) {
          .tools-grid { grid-template-columns: repeat(2, 1fr); }
          .steps-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 767px) {
          .split-2col { grid-template-columns: 1fr; }
          .split-divider { display: none; }
          /* nav-center / nav-auth-desktop carry an inline display:flex style,
             which beats a plain class rule — !important is required here. */
          .nav-center { display: none !important; }
          .nav-auth-desktop { display: none !important; }
          .ekg-label-left { display: none; }
          .nav-divider { display: none; }

          .nav-grid { grid-template-columns: auto 1fr !important; height: 54px !important; }
          .site-header {
            position: fixed !important;
            top: 0; left: 0; right: 0;
            z-index: 100;
            height: 56px;
            box-sizing: border-box;
          }
          .hamburger-label {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px; height: 44px;
            justify-self: end;
            margin-right: 0.5rem;
            background: transparent;
            border: none;
            cursor: pointer;
          }

          .ticker-wrap { display: none; }
          .hero-section { margin-top: 56px; }

          .hero-headline { font-size: clamp(2rem, 11vw, 2.625rem) !important; }
          .hero-actions { flex-direction: column !important; align-items: stretch !important; }
          .hero-btn { width: 100%; text-align: center; }
        }
        @media (max-width: 500px) {
          .tools-grid { grid-template-columns: 1fr; }
          .steps-row { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ backgroundColor: "#FFFFFF", color: "#000000", minHeight: "100vh", fontFamily: "var(--font-inter, Inter, system-ui, sans-serif)" }}>

        {/* ── Navbar — full width, vertical 2px dividers between sections ── */}
        <header className="site-header" style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "#FFFFFF", borderBottom: "2px solid #000000" }}>
          <input type="checkbox" id="mobile-menu-toggle" className="mm-checkbox" aria-hidden="true" />
          <div className="nav-grid" style={{ height: 56 }}>
            {/* Left: wordmark */}
            <div style={{ display: "flex", alignItems: "center", padding: "0 1.5rem" }}>
              <span style={{ fontWeight: 900, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "-0.01em" }}>ClinicLog</span>
              <span style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 800, border: "2px solid #000000", padding: "1px 5px", marginLeft: 10, letterSpacing: "0.1em" }}>BETA</span>
            </div>
            <div className="nav-divider" style={{ background: "#000000" }} />
            {/* Center: nav links */}
            <nav className="nav-center" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
              {[["Schools", "/schools"], ["Archetype", "/archetype"], ["Resources", "/resources"], ["Stories", "/stories"], ["About", "/about"]].map(([label, href]) => (
                <Link key={label} href={href} className="nav-link" style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</Link>
              ))}
            </nav>
            <div className="nav-divider" style={{ background: "#000000" }} />
            {/* Right: auth (desktop only) */}
            <div className="nav-auth-desktop" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0 1.5rem", justifyContent: "flex-end" }}>
              <Link href="/auth/login" className="nav-link" style={{ fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase" }}>Sign in</Link>
              <Link href="/auth/signup" className="invert-btn" style={{ fontSize: "0.8125rem", padding: "0.375rem 1rem" }}>
                Get started
              </Link>
            </div>
            {/* Hamburger (mobile only) */}
            <label htmlFor="mobile-menu-toggle" className="hamburger-label" aria-label="Open menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </label>
          </div>

          {/* Full-screen mobile menu overlay */}
          <div className="mobile-menu-overlay">
            <label htmlFor="mobile-menu-toggle" className="mobile-menu-close" aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.2" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </label>
            <nav className="mobile-menu-links">
              <Link href="/schools" className="mobile-menu-item">Schools</Link>
              <Link href="/archetype" className="mobile-menu-item">Archetype</Link>
              <Link href="/resources" className="mobile-menu-item">Resources</Link>
              <Link href="/stories" className="mobile-menu-item">Stories</Link>
              <Link href="/about" className="mobile-menu-item">About</Link>
              <Link href="/auth/login" className="mobile-menu-item">Sign in</Link>
              <Link href="/auth/signup" className="mobile-menu-item mobile-menu-item-cta">Get started</Link>
            </nav>
          </div>
        </header>

        {/* ── Ticker — 2px top/bottom borders, hidden on mobile ── */}
        <div className="ticker-wrap" style={{ borderBottom: "2px solid #000000", overflow: "hidden" }}>
          <div className="ticker-track" style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 700, color: "#000000", letterSpacing: "0.14em", padding: "8px 0", textTransform: "uppercase" }}>
            <span style={{ paddingRight: "4rem" }}>{tickerText}</span>
            <span style={{ paddingRight: "4rem" }}>{tickerText}</span>
          </div>
        </div>

        {/* ── Hero — giant stacked headline | 2x2 stat grid ── */}
        <section className="hero-section" style={{ borderBottom: "2px solid #000000" }}>
          <div className="split-2col" style={{ maxWidth: 1280, margin: "0 auto" }}>
            {/* Left */}
            <div style={{ padding: "4.5rem 3rem 4.5rem 1.5rem" }}>
              <p style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "1.5rem" }}>PRE-MED PLATFORM — 2026</p>
              <h1 className="hero-headline" style={{ fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.03em", textTransform: "uppercase", marginBottom: "2rem" }}>
                Track.<br />Build.<br />Apply.
              </h1>
              <p style={{ fontSize: "0.9375rem", lineHeight: 1.6, color: "rgba(0,0,0,0.7)", marginBottom: "2.5rem", maxWidth: 420 }}>
                Track clinical hours, discover your archetype, explore 149 medical schools, and build your path to medicine — completely free.
              </p>
              <div className="hero-actions" style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <Link href="/auth/signup" className="invert-btn hero-btn" style={{ fontSize: "0.875rem", padding: "0.875rem 1.75rem" }}>
                  Get started
                </Link>
                <Link href="/auth/login" className="ghost-btn hero-btn" style={{ fontSize: "0.875rem", padding: "0.875rem 1.5rem" }}>
                  Sign in
                </Link>
              </div>
            </div>
            {/* Divider */}
            <div className="split-divider" style={{ backgroundColor: "#000000" }} />
            {/* Right: 2x2 stat grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 2, backgroundColor: "#000000" }}>
              {[
                { tag: "MEDICAL SCHOOLS", num: "149" },
                { tag: "ARCHETYPES",      num: "015" },
                { tag: "TOOLS",           num: "012" },
                { tag: "COST",            num: "$0"  },
              ].map((s) => (
                <div key={s.tag} style={{ padding: "2.5rem 2rem", backgroundColor: "#FFFFFF", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "0.75rem" }}>{s.tag}</p>
                  <p style={{ fontFamily: MONO, fontSize: "3rem", fontWeight: 700, lineHeight: 1, letterSpacing: "-0.02em" }}>{s.num}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── EKG bar — black heartbeat line on white ── */}
        <div style={{ borderBottom: "2px solid #000000", overflow: "hidden" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem", display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", gap: "2rem", height: 56 }}>
            <span className="ekg-label-left" style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", flexShrink: 0 }}>CLINICAL HOURS — REAL TIME</span>
            <div style={{ overflow: "hidden", height: 40 }}>
              <div className="ekg-track">
                {[0, 1].map(i => (
                  <svg key={i} height="40" style={{ width: "50%", minWidth: "50%" }} viewBox="0 0 1200 40" preserveAspectRatio="xMidYMid meet">
                    <path d="M0,20 L80,20 L90,16 L100,20 L115,20 L120,26 L125,2 L130,32 L140,20 L200,20 L280,20 L290,16 L300,20 L315,20 L320,26 L325,2 L330,32 L340,20 L400,20 L480,20 L490,16 L500,20 L515,20 L520,26 L525,2 L530,32 L540,20 L600,20 L680,20 L690,16 L700,20 L715,20 L720,26 L725,2 L730,32 L740,20 L800,20 L880,20 L890,16 L900,20 L915,20 L920,26 L925,2 L930,32 L940,20 L1000,20 L1080,20 L1090,16 L1100,20 L1115,20 L1120,26 L1125,2 L1130,32 L1140,20 L1200,20"
                      stroke="#000000" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ))}
              </div>
            </div>
            <span style={{ fontFamily: MONO, fontSize: "0.875rem", fontWeight: 700, flexShrink: 0 }}>000.0 HRS</span>
          </div>
        </div>

        {/* ── Tools grid — 4 columns, every cell bordered ── */}
        <section style={{ borderBottom: "2px solid #000000" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderBottom: "2px solid #000000" }}>
              <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>ALL TOOLS</span>
              <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>12 INCLUDED — FREE</span>
            </div>
            <div className="tools-grid">
              {TOOLS.map((t) => (
                <div key={t.n} className="tool-cell" style={{ padding: "1.75rem 1.5rem" }}>
                  <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 800, color: "#000000", display: "block", marginBottom: "0.75rem" }}>{t.n}</span>
                  <p style={{ fontWeight: 900, fontSize: "0.9375rem", textTransform: "uppercase", letterSpacing: "-0.01em", color: "#000000", marginBottom: "0.5rem", lineHeight: 1.2 }}>{t.name}</p>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.65)", lineHeight: 1.55 }}>{t.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works — 4 horizontal bordered cells ── */}
        <section style={{ borderBottom: "2px solid #000000" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ padding: "1rem 1.5rem", borderBottom: "2px solid #000000" }}>
              <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>HOW IT WORKS</span>
            </div>
            <div className="steps-row">
              {STEPS.map((step) => (
                <div key={step.n} style={{ padding: "2rem 1.5rem", backgroundColor: "#FFFFFF" }}>
                  <p style={{ fontFamily: MONO, fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>{step.n}</p>
                  <p style={{ fontWeight: 900, fontSize: "0.9375rem", textTransform: "uppercase", marginBottom: "0.5rem", lineHeight: 1.2 }}>{step.title}</p>
                  <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.65)", lineHeight: 1.55 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Bottom CTA — 2 column ── */}
        <section style={{ borderBottom: "2px solid #000000" }}>
          <div className="split-2col" style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ padding: "4rem 3rem 4rem 1.5rem" }}>
              <h2 style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.03em", lineHeight: 0.98 }}>
                Your path to medicine starts here.
              </h2>
            </div>
            <div className="split-divider" style={{ backgroundColor: "#000000" }} />
            <div style={{ padding: "4rem 1.5rem 4rem 3rem", display: "flex", flexDirection: "column", justifyContent: "center", gap: "1.5rem" }}>
              <p style={{ fontSize: "0.9375rem", color: "rgba(0,0,0,0.7)", lineHeight: 1.6, maxWidth: 420 }}>
                Every tool — hours tracking, 149 schools, AI archetype analysis, narrative building — free forever. No credit card required.
              </p>
              <Link href="/auth/signup" className="invert-btn" style={{ fontSize: "0.9375rem", padding: "1rem 2rem", alignSelf: "flex-start" }}>
                Get started free
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer — single row, 2px top border ── */}
        <footer style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              © {new Date().getFullYear()} CLINICLOG — ALL RIGHTS RESERVED
            </p>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {[["SCHOOLS", "/schools"], ["ARCHETYPE", "/archetype"], ["RESOURCES", "/resources"], ["STORIES", "/stories"], ["ABOUT", "/about"]].map(([label, href]) => (
                <Link key={label} href={href} className="nav-link" style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em" }}>
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
