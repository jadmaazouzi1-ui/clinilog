import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ARCHETYPES } from "@/lib/archetypes";

const MONO = "var(--font-jetbrains-mono, monospace)";
const RULE = "1px solid #000000";

const ABSTRACTS = [
  { n: "01", title: "Hours Tracker",       body: "Log clinical, shadowing, research, and volunteer hours with dates, organizations, and reflections attached to every entry." },
  { n: "02", title: "School Explorer",     body: "Filter 149 accredited medical schools by GPA, MCAT, mission focus, and state preference to identify realistic, well-matched programs." },
  { n: "03", title: "Archetype Engine",    body: "After three or more logged experiences, an AI model analyzes the pattern of your activity and assigns one of fifteen defined pre-med archetypes." },
  { n: "04", title: "Narrative Builder",   body: "Synthesizes your logged experience data into a cohesive application narrative suitable for personal statements and secondaries." },
  { n: "05", title: "Reframe Engine",      body: "Rewrites rough, informal experience descriptions into polished, AMCAS-ready clinical language while preserving factual content." },
  { n: "06", title: "AI Advisor",          body: "A standing advisory tool with access to your logged hours, GPA, and stated goals, available for consultation at any time." },
  { n: "07", title: "Specialty Explorer",  body: "A reference index of thirty-plus medical specialties, comparing lifestyle, compensation, residency length, and competitiveness." },
  { n: "08", title: "Resource Library",    body: "A curated collection of free MCAT preparation material, fee assistance programs, and pipeline opportunities for applicants." },
  { n: "09", title: "Gap Year Planner",    body: "Structured goal tracking with monthly logs and milestone checklists for applicants taking one or more years before matriculating." },
  { n: "10", title: "Post-bacc Tracker",   body: "Calculates BCPM and cumulative GPA in real time as post-baccalaureate coursework is logged, term by term." },
  { n: "11", title: "PDF Export",          body: "Produces a clean, formatted summary document of all logged experiences, suitable for advisors and committee letter writers." },
  { n: "12", title: "CSV Import",          body: "Imports existing experience records from a spreadsheet in a single step, for applicants migrating from another tracking method." },
];

const STATS = [
  { metric: "MEDICAL SCHOOLS INDEXED", value: "149" },
  { metric: "PRE-MED ARCHETYPES",      value: "015" },
  { metric: "TOOLS INCLUDED",          value: "012" },
  { metric: "COST TO USE",             value: "$0" },
];

// Three representative archetypes, presented as journal case studies.
const CASE_IDS = ["community_healer", "scientist", "first_gen_grinder"];
const CASES = CASE_IDS
  .map((id) => ARCHETYPES.find((a) => a.id === id))
  .filter((a): a is (typeof ARCHETYPES)[number] => !!a);

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <style>{`
        .nav-link { color: #000000; text-decoration: none; }
        .nav-link:hover { text-decoration: underline; text-decoration-thickness: 1px; }
        .invert-btn {
          background: #000000; color: #FFFFFF;
          border: 1px solid #000000;
          font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
          text-decoration: none; display: inline-block;
        }
        .invert-btn:hover { background: #FFFFFF; color: #000000; }
        .ghost-btn {
          background: #FFFFFF; color: #000000;
          border: 1px solid #000000;
          font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
          text-decoration: none; display: inline-block;
        }
        .ghost-btn:hover { background: #000000; color: #FFFFFF; }

        .journal-table { width: 100%; border-collapse: collapse; }
        .journal-table th, .journal-table td { border: 1px solid #000000; padding: 0.875rem 1.25rem; text-align: left; }
        .journal-table th { font-family: ${MONO}; font-size: 10px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .journal-table td.num { font-family: ${MONO}; font-size: 1.25rem; font-weight: 700; text-align: right; }

        .hero-actions { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .hero-btn { }
        .split-2col { display: grid; grid-template-columns: 1fr 1px 1fr; }
        .split-divider { background: #000000; }
        .abstracts-list > div { border-bottom: ${RULE}; }
        .abstracts-list > div:last-child { border-bottom: none; }

        /* Mobile hamburger menu - hidden by default, shown only under 767px */
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
          border-bottom: 1px solid #000000;
        }
        .mobile-menu-item-cta { background: #000000; color: #FFFFFF; }

        @media (max-width: 767px) {
          .split-2col { grid-template-columns: 1fr; }
          .split-divider { display: none; }
          .nav-center { display: none !important; }
          .nav-auth-desktop { display: none !important; }
          .nav-grid { grid-template-columns: auto 1fr !important; }
          .nav-divider { display: none; }
          .hamburger-label {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 44px; height: 44px;
            justify-self: end;
            background: transparent;
            border: none;
            cursor: pointer;
          }
          .hero-actions { flex-direction: column; align-items: stretch; }
          .hero-btn { width: 100%; text-align: center; }
          .masthead-headline { font-size: 2.25rem !important; }
        }
      `}</style>

      <div style={{ backgroundColor: "#FFFFFF", color: "#000000", minHeight: "100vh", fontFamily: "var(--font-inter, Inter, system-ui, sans-serif)" }}>

        {/* ── Journal masthead nav ── */}
        <header style={{ borderTop: RULE, borderBottom: RULE }}>
          <input type="checkbox" id="mobile-menu-toggle" className="mm-checkbox" aria-hidden="true" />
          <div className="nav-grid" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", alignItems: "center", height: 52, padding: "0 1.5rem", maxWidth: 1280, margin: "0 auto" }}>
            <span style={{ fontFamily: MONO, fontSize: "11px", fontWeight: 800, letterSpacing: "0.16em" }}>CLINICLOG MD</span>
            <nav className="nav-center" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem" }}>
              {[["Schools", "/schools"], ["Archetype", "/archetype"], ["Resources", "/resources"], ["Stories", "/stories"], ["About", "/about"]].map(([label, href]) => (
                <Link key={label} href={href} className="nav-link" style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</Link>
              ))}
            </nav>
            <div className="nav-auth-desktop" style={{ display: "flex", alignItems: "center", gap: "1.25rem", justifyContent: "flex-end" }}>
              <Link href="/auth/login" className="nav-link" style={{ fontSize: "0.8125rem", fontWeight: 600, textTransform: "uppercase" }}>Sign in</Link>
              <Link href="/auth/signup" className="invert-btn" style={{ fontSize: "0.75rem", padding: "0.375rem 0.875rem" }}>Get started</Link>
            </div>
            <label htmlFor="mobile-menu-toggle" className="hamburger-label" aria-label="Open menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </label>
          </div>

          <div className="mobile-menu-overlay">
            <label htmlFor="mobile-menu-toggle" className="mobile-menu-close" aria-label="Close menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round">
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

        {/* ── Volume line ── */}
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0.625rem 1.5rem", display: "flex", justifyContent: "space-between", borderBottom: RULE }}>
          <span style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em" }}>CLINICLOG MD</span>
          <span style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em" }}>VOL. 01, 2026</span>
        </div>

        {/* ── Masthead headline ── */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "3.5rem 1.5rem 2rem", textAlign: "center" }}>
          <h1 className="masthead-headline" style={{ fontSize: "clamp(2.5rem, 6vw, 4.25rem)", lineHeight: 1.02, marginBottom: "1.75rem" }}>
            Your Clinical Journey, Documented
          </h1>
          <div style={{ borderTop: RULE, maxWidth: 320, margin: "0 auto 1.75rem" }} />
          <p style={{ fontStyle: "italic", fontWeight: 400, fontSize: "1.0625rem", color: "rgba(0,0,0,0.7)" }}>
            Track. Build. Apply. Free.
          </p>
        </div>

        {/* ── Hero: 2-col editorial ── */}
        <section style={{ borderTop: RULE, borderBottom: RULE }}>
          <div className="split-2col" style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ padding: "3.5rem 3rem 3.5rem 1.5rem" }}>
              <p style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "1.25rem", color: "rgba(0,0,0,0.5)" }}>Abstract</p>
              <p style={{ fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem", maxWidth: 440 }}>
                ClinicLog MD is a free, all-in-one system for pre-medical students to record clinical activity, evaluate school fit, and prepare an evidence-based application. Every hour logged strengthens the record that eventually becomes your personal statement.
              </p>
              <div className="hero-actions">
                <Link href="/auth/signup" className="invert-btn hero-btn" style={{ fontSize: "0.875rem", padding: "0.875rem 1.75rem" }}>Get started</Link>
                <Link href="/auth/login" className="ghost-btn hero-btn" style={{ fontSize: "0.875rem", padding: "0.875rem 1.75rem" }}>Sign in</Link>
              </div>
            </div>
            <div className="split-divider" />
            <div style={{ padding: "3.5rem 1.5rem 3.5rem 3rem" }}>
              <p style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "1.25rem", color: "rgba(0,0,0,0.5)" }}>Sample Record</p>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: MONO, fontSize: "0.75rem" }}>
                <thead>
                  <tr>
                    {["ORGANIZATION", "CATEGORY", "HRS"].map((h) => (
                      <th key={h} style={{ borderBottom: RULE, textAlign: "left", padding: "0.5rem 0", fontWeight: 800, letterSpacing: "0.08em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["City General Hospital", "CLINICAL", "42.0"],
                    ["Free Clinic Downtown", "VOLUNTEER", "28.5"],
                    ["Dr. Patel, Cardiology", "SHADOWING", "16.0"],
                    ["Neuroscience Lab, State U.", "RESEARCH", "60.0"],
                    ["Campus Health Outreach", "VOLUNTEER", "12.0"],
                  ].map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, i) => (
                        <td key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.15)", padding: "0.625rem 0", color: i === 0 ? "#000000" : "rgba(0,0,0,0.6)" }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ fontSize: "0.6875rem", color: "rgba(0,0,0,0.4)", marginTop: "0.75rem" }}>Representative sample. Your record starts empty.</p>
            </div>
          </div>
        </section>

        {/* ── Feature abstracts ── */}
        <section style={{ borderBottom: RULE }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
            <p style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "2rem", color: "rgba(0,0,0,0.5)" }}>Contents: Twelve Tools</p>
            <div className="abstracts-list">
              {ABSTRACTS.map((a) => (
                <div key={a.n} style={{ padding: "1.5rem 0" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "1rem", marginBottom: "0.625rem" }}>
                    <span style={{ fontFamily: MONO, fontSize: "0.875rem", fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>{a.n}</span>
                    <p style={{ fontWeight: 900, fontSize: "1.0625rem", textTransform: "uppercase", letterSpacing: "-0.01em" }}>{a.title}</p>
                  </div>
                  <p style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "rgba(0,0,0,0.7)", maxWidth: 640 }}>{a.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats as journal data table ── */}
        <section style={{ borderBottom: RULE }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
            <p style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "1.5rem", color: "rgba(0,0,0,0.5)" }}>Table 1: Summary Statistics</p>
            <table className="journal-table">
              <thead>
                <tr><th>Metric</th><th style={{ textAlign: "right" }}>Value</th></tr>
              </thead>
              <tbody>
                {STATS.map((s) => (
                  <tr key={s.metric}>
                    <td>{s.metric}</td>
                    <td className="num">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Case studies (archetypes) ── */}
        <section style={{ borderBottom: RULE }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "3rem 1.5rem" }}>
            <p style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: "2rem", color: "rgba(0,0,0,0.5)" }}>Case Studies: Pre-Med Archetypes</p>
            <div className="abstracts-list">
              {CASES.map((c, i) => (
                <div key={c.id} style={{ padding: "1.5rem 0" }}>
                  <p style={{ fontFamily: MONO, fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
                    CASE {String(i + 1).padStart(2, "0")}: {c.name.toUpperCase()}
                  </p>
                  <p style={{ fontSize: "0.9375rem", fontStyle: "italic", marginBottom: "0.5rem", color: "rgba(0,0,0,0.75)" }}>{c.tagline}</p>
                  <p style={{ fontSize: "0.9375rem", lineHeight: 1.65, color: "rgba(0,0,0,0.7)", maxWidth: 640 }}>{c.description}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize: "0.8125rem", marginTop: "1.5rem" }}>
              <Link href="/archetype" className="nav-link" style={{ fontWeight: 600 }}>Fifteen archetypes total. See the full index →</Link>
            </p>
          </div>
        </section>

        {/* ── Closing CTA ── */}
        <section style={{ borderBottom: RULE }}>
          <div style={{ maxWidth: 900, margin: "0 auto", padding: "3.5rem 1.5rem", textAlign: "center" }}>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", marginBottom: "1.5rem" }}>Begin Your Record</h2>
            <p style={{ fontSize: "0.9375rem", color: "rgba(0,0,0,0.65)", maxWidth: 460, margin: "0 auto 2rem", lineHeight: 1.6 }}>
              Every tool on this page is free, permanently. No credit card, no trial period, no upsell.
            </p>
            <Link href="/auth/signup" className="invert-btn" style={{ fontSize: "0.9375rem", padding: "1rem 2.25rem" }}>Get started free</Link>
          </div>
        </section>

        {/* ── Journal footer ── */}
        <footer style={{ padding: "1.5rem" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
            <p style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em" }}>
              CLINICLOG MD, VOL. 01, 2026
            </p>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
              {[["Schools", "/schools"], ["Archetype", "/archetype"], ["Resources", "/resources"], ["Stories", "/stories"], ["About", "/about"]].map(([label, href]) => (
                <Link key={label} href={href} className="nav-link" style={{ fontFamily: MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  {label}
                </Link>
              ))}
            </div>
            <p style={{ fontFamily: MONO, fontSize: "10px", color: "rgba(0,0,0,0.5)" }}>
              © {new Date().getFullYear()} ClinicLog MD. All rights reserved.
            </p>
          </div>
        </footer>

      </div>
    </>
  );
}
