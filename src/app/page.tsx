import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ARCHETYPES } from "@/lib/archetypes";

const FEATURES = [
  { title: "Hours Tracker",       body: "Log clinical, shadowing, research, and volunteer hours with dates, organizations, and reflections attached to every entry.", color: "var(--cat-clinical)" },
  { title: "School Explorer",     body: "Filter 149 accredited medical schools by GPA, MCAT, mission focus, and state preference.", color: "var(--cat-shadowing)" },
  { title: "Archetype Engine",    body: "After three or more logged experiences, AI assigns one of fifteen defined pre-med archetypes with matched schools.", color: "var(--cat-research)" },
  { title: "Narrative Builder",   body: "Synthesizes your logged experience data into a cohesive application narrative for personal statements.", color: "var(--cat-volunteer)" },
  { title: "AI Advisor",          body: "A standing advisor with access to your logged hours, GPA, and goals, available for consultation any time.", color: "var(--cat-other)" },
  { title: "Post-bacc Tracker",   body: "Calculates BCPM and cumulative GPA in real time as you log post-baccalaureate coursework.", color: "var(--cat-clinical)" },
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

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)", minHeight: "100vh" }}>
      <style>{`
        .nav-link { color: var(--text-secondary); text-decoration: none; font-weight: 500; }
        .nav-link:hover { color: var(--text-primary); }
        .feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
        .feature-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover); }
        .mobile-menu-btn { display: none; }
        @media (max-width: 767px) {
          .nav-center, .nav-auth-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>

      {/* Navbar */}
      <header className="sticky top-0 z-50" style={{ backgroundColor: "rgba(243,247,244,0.85)", backdropFilter: "blur(8px)", borderBottom: "1px solid var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, var(--accent), var(--accent-bright))" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
              </svg>
            </div>
            <span className="font-bold" style={{ fontSize: "1.0625rem" }}>ClinicLog MD</span>
          </Link>
          <nav className="nav-center flex items-center gap-8">
            {[["Schools", "/schools"], ["Archetype", "/archetype"], ["Resources", "/resources"], ["Stories", "/stories"], ["About", "/about"]].map(([label, href]) => (
              <Link key={label} href={href} className="nav-link text-sm">{label}</Link>
            ))}
          </nav>
          <div className="nav-auth-desktop flex items-center gap-3">
            <Link href="/auth/login" className="nav-link text-sm">Sign in</Link>
            <Link href="/auth/signup" className="teal-glow px-4 py-2 rounded-full text-sm font-semibold" style={{ textDecoration: "none" }}>Get started</Link>
          </div>
          <Link href="/auth/signup" className="mobile-menu-btn teal-glow px-4 py-2 rounded-full text-sm font-semibold" style={{ textDecoration: "none" }}>Get started</Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="beta-pill mb-5 inline-flex">Free for pre-med students</span>
          <h1 className="font-bold" style={{ fontSize: "clamp(2.25rem, 5vw, 3.25rem)", lineHeight: 1.08, letterSpacing: "-0.02em", marginBottom: "1.25rem" }}>
            Your clinical journey, organized.
          </h1>
          <p className="text-base mb-8" style={{ color: "var(--text-secondary)", lineHeight: 1.65, maxWidth: 440 }}>
            Track clinical hours, discover your pre-med archetype, explore 149 medical schools, and build your path to medicine, completely free.
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/auth/signup" className="teal-glow px-6 py-3 rounded-full text-sm font-semibold" style={{ textDecoration: "none" }}>Get started free</Link>
            <Link href="/auth/login" className="btn-ghost px-6 py-3 rounded-full text-sm font-semibold" style={{ textDecoration: "none" }}>Sign in</Link>
          </div>
        </div>

        {/* Mini path-graph preview */}
        <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, var(--bg-hero-1), var(--bg-hero-2) 55%, var(--bg-hero-3))", minHeight: 320, boxShadow: "var(--shadow-hero)" }}>
          <svg className="absolute inset-0 w-full h-full" style={{ overflow: "visible" }}>
            {[
              { x: 22, y: 28, color: "var(--cat-clinical)" },
              { x: 78, y: 24, color: "var(--cat-shadowing)" },
              { x: 84, y: 70, color: "var(--cat-research)" },
              { x: 20, y: 76, color: "var(--cat-volunteer)" },
            ].map((n, i) => (
              <line key={i} x1="50%" y1="50%" x2={`${n.x}%`} y2={`${n.y}%`} stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} />
            ))}
          </svg>
          <div className="absolute flex flex-col items-center justify-center" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 76, height: 76, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #74C69D, var(--accent) 70%)", boxShadow: "0 0 0 6px rgba(255,255,255,0.06)" }}>
            <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 16 }}>149</span>
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 8, textTransform: "uppercase", fontWeight: 600 }}>hrs</span>
          </div>
          {[
            { x: 22, y: 28, color: "var(--cat-clinical)", size: 40 },
            { x: 78, y: 24, color: "var(--cat-shadowing)", size: 30 },
            { x: 84, y: 70, color: "var(--cat-research)", size: 34 },
            { x: 20, y: 76, color: "var(--cat-volunteer)", size: 26 },
          ].map((n, i) => (
            <div key={i} className="absolute" style={{ left: `${n.x}%`, top: `${n.y}%`, transform: "translate(-50%,-50%)", width: n.size, height: n.size, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #FFFFFF33, ${n.color} 75%)`, boxShadow: `0 0 16px ${n.color}88` }} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-6 text-center">
              <p className="font-bold" style={{ fontSize: "2rem", color: "var(--accent)" }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <p className="dept-header text-center" style={{ marginBottom: "0.5rem" }}>Everything you need</p>
        <h2 className="font-bold text-center mb-10" style={{ fontSize: "2rem" }}>Twelve tools, zero cost.</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card glass-card rounded-2xl p-6">
              <div className="w-10 h-10 rounded-xl mb-4" style={{ background: f.color, opacity: 0.85 }} />
              <p className="font-semibold mb-2" style={{ fontSize: "1.0625rem" }}>{f.title}</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Archetype case studies */}
      <section className="max-w-6xl mx-auto px-6 py-10">
        <p className="dept-header text-center" style={{ marginBottom: "0.5rem" }}>Find your fit</p>
        <h2 className="font-bold text-center mb-10" style={{ fontSize: "2rem" }}>Fifteen pre-med archetypes.</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {CASES.map((c) => (
            <div key={c.id} className="glass-card rounded-2xl p-6">
              <p className="font-semibold mb-1" style={{ fontSize: "1.0625rem" }}>{c.name}</p>
              <p className="text-sm italic mb-3" style={{ color: "var(--accent)" }}>{c.tagline}</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>{c.description}</p>
            </div>
          ))}
        </div>
        <p className="text-center mt-8">
          <Link href="/archetype" className="text-sm font-semibold" style={{ color: "var(--accent)" }}>See all fifteen archetypes →</Link>
        </p>
      </section>

      {/* Closing CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="rounded-2xl p-12 text-center" style={{ background: "linear-gradient(135deg, var(--bg-hero-1), var(--bg-hero-2) 55%, var(--bg-hero-3))", boxShadow: "var(--shadow-hero)" }}>
          <h2 className="font-bold mb-3" style={{ fontSize: "2rem", color: "#FFFFFF" }}>Your path to medicine starts here.</h2>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.7)", maxWidth: 440, margin: "0 auto 2rem" }}>
            Every tool, free forever. No credit card, no trial period, no upsell.
          </p>
          <Link href="/auth/signup" className="inline-block px-7 py-3 rounded-full text-sm font-semibold" style={{ background: "#FFFFFF", color: "var(--accent)", textDecoration: "none" }}>
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: "var(--border)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>© {new Date().getFullYear()} ClinicLog MD. All rights reserved.</p>
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
