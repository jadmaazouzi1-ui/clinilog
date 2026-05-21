import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <>
      <style>{`
        @keyframes ekg-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes btn-pulse {
          0%, 100% { box-shadow: 0 0 18px rgba(0,212,255,0.45), 0 0 36px rgba(0,212,255,0.2); }
          50%       { box-shadow: 0 0 28px rgba(0,212,255,0.75), 0 0 56px rgba(0,212,255,0.35); }
        }
        @keyframes dot-fade {
          0%, 100% { opacity: 0.35; }
          50%       { opacity: 0.55; }
        }
        .ekg-track {
          animation: ekg-scroll 7s linear infinite;
          display: flex;
          width: 200%;
        }
        .btn-glow {
          animation: btn-pulse 2.4s ease-in-out infinite;
        }
        .dot-grid {
          animation: dot-fade 6s ease-in-out infinite;
        }
        .glass-card {
          background: rgba(30, 42, 58, 0.55);
          border: 1px solid rgba(0, 212, 255, 0.14);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .glass-card:hover {
          border-color: rgba(0, 212, 255, 0.35);
          background: rgba(30, 42, 58, 0.75);
          transition: border-color 0.25s, background 0.25s;
        }
        .teal-hover:hover {
          background: rgba(0, 212, 255, 0.08);
        }
        .signin-btn {
          transition: box-shadow 0.25s, background 0.25s, border-color 0.25s;
        }
        .signin-btn:hover {
          background: rgba(0, 212, 255, 0.12);
          border-color: #00D4FF !important;
          box-shadow: 0 0 18px rgba(0, 212, 255, 0.45), 0 0 32px rgba(0, 212, 255, 0.2);
        }
        .step-line {
          background-image: linear-gradient(to right, rgba(0,212,255,0.4) 50%, transparent 50%);
          background-size: 8px 2px;
          background-repeat: repeat-x;
          background-position: center;
        }
      `}</style>

      <div
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{ backgroundColor: "#0A1628", color: "#F8FAFC" }}
      >
        {/* Dot-matrix background */}
        <div
          className="dot-grid absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(0,212,255,0.18) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Subtle radial gradient glow behind hero */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "800px",
            height: "600px",
            background:
              "radial-gradient(ellipse at center, rgba(0,212,255,0.07) 0%, transparent 70%)",
          }}
        />

        {/* ── Navbar ── */}
        <header
          className="relative z-20 px-6 py-4"
          style={{
            backgroundColor: "rgba(10,22,40,0.92)",
            borderBottom: "1px solid rgba(0,212,255,0.18)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-end">
            <Link
              href="/auth/login"
              className="signin-btn text-sm font-semibold px-5 py-2 rounded-lg"
              style={{
                color: "#00D4FF",
                border: "1.5px solid #00D4FF",
                background: "rgba(0,212,255,0.05)",
              }}
            >
              Sign In
            </Link>
          </div>
        </header>

        {/* ── Hero ── */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-24 relative z-10">
          {/* EKG strip — positioned horizontally across the middle */}
          <div
            className="absolute inset-x-0 overflow-hidden pointer-events-none"
            style={{ top: "calc(50% - 30px)", height: "60px", opacity: 0.45 }}
          >
            <div className="ekg-track">
              {[0, 1].map((i) => (
                <svg
                  key={i}
                  height="60"
                  style={{ width: "50%", minWidth: "50%" }}
                  viewBox="0 0 1200 60"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <path
                    d="
                      M0,30
                      L50,30 L60,25 L70,30 L85,30 L90,35 L95,5 L100,40 L110,30 L130,30 L140,22 L155,30
                      L200,30
                      L250,30 L260,25 L270,30 L285,30 L290,35 L295,5 L300,40 L310,30 L330,30 L340,22 L355,30
                      L400,30
                      L450,30 L460,25 L470,30 L485,30 L490,35 L495,5 L500,40 L510,30 L530,30 L540,22 L555,30
                      L600,30
                      L650,30 L660,25 L670,30 L685,30 L690,35 L695,5 L700,40 L710,30 L730,30 L740,22 L755,30
                      L800,30
                      L850,30 L860,25 L870,30 L885,30 L890,35 L895,5 L900,40 L910,30 L930,30 L940,22 L955,30
                      L1000,30
                      L1050,30 L1060,25 L1070,30 L1085,30 L1090,35 L1095,5 L1100,40 L1110,30 L1130,30 L1140,22 L1155,30
                      L1200,30
                    "
                    stroke="#00D4FF"
                    strokeWidth="1.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ))}
            </div>
          </div>

          <div className="max-w-3xl mx-auto text-center">
            {/* Hero logo */}
            <div className="flex flex-col items-center gap-6 mb-12">
              <div
                style={{
                  width: "140px",
                  height: "140px",
                  borderRadius: "32px",
                  backgroundColor: "#00D4FF",
                  boxShadow: "0 0 80px rgba(0,212,255,0.5), 0 0 160px rgba(0,212,255,0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="88"
                  height="88"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0A1628"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2,12 5,12 7,7 9,17 11,10 13,14 15,12 22,12" />
                </svg>
              </div>
              <span className="text-4xl font-bold tracking-wide" style={{ color: "#F8FAFC" }}>
                CliniLog
              </span>
            </div>

            {/* Headline */}
            <h1
              className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight mb-5"
              style={{ color: "#F8FAFC" }}
            >
              Built for First-Gen{" "}
              <span style={{ color: "#00D4FF" }}>Pre-Med</span> Students
            </h1>

            <p
              className="text-xl leading-relaxed mb-5 max-w-2xl mx-auto"
              style={{ color: "rgba(248,250,252,0.65)" }}
            >
              Track your clinical hours, explore 150+ medical schools, and build
              your path to medicine — all in one free tool.
            </p>

            {/* Social proof */}
            <div className="mb-10 flex items-center justify-center gap-2 flex-wrap">
              <div className="flex -space-x-2">
                {["#00D4FF", "#10B981", "#A78BFA", "#F59E0B"].map((c, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                    style={{
                      backgroundColor: c,
                      borderColor: "#0A1628",
                      color: "#0A1628",
                    }}
                  >
                    {["M", "D", "P", "A"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm" style={{ color: "rgba(248,250,252,0.55)" }}>
                Join <span className="font-bold" style={{ color: "#00D4FF" }}>500+</span> first-gen pre-med students building their path to medicine
              </p>
            </div>

            {/* CTA */}
            <Link
              href="/auth/signup"
              className="btn-glow inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-base transition-transform hover:scale-[1.03]"
              style={{
                backgroundColor: "#00D4FF",
                color: "#0A1628",
              }}
            >
              Get Started Free
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>

            {/* Feature cards */}
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
              {[
                {
                  title: "Track Every Hour",
                  desc: "Log clinical work, shadowing, research, and volunteering with dates, hours, and reflections.",
                  iconPath: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
                },
                {
                  title: "Explore 150+ Schools",
                  desc: "Filter by GPA, MCAT, mission focus, and state preference to find programs that fit your profile.",
                  iconPath: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                },
                {
                  title: "Export to PDF",
                  desc: "Download a clean, formatted summary of all your experiences to share with advisors or for applications.",
                  iconPath: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
                },
                {
                  title: "Narrative Builder",
                  desc: "AI analyzes your experiences and helps shape them into a cohesive med school story that lands.",
                  iconPath: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                },
                {
                  title: "AI Advisor",
                  desc: "Get personalized pre-med guidance anytime — your AI mentor knows your hours, GPA, and goals.",
                  iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
                },
                {
                  title: "Reframe Engine",
                  desc: "Turn rough descriptions into polished AMCAS-ready language that highlights clinical depth and impact.",
                  iconPath: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                },
                {
                  title: "Resource Library",
                  desc: "Curated free MCAT prep, fee assistance programs, and pipeline opportunities for first-gen students.",
                  iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
                },
                {
                  title: "First-Gen Stories",
                  desc: "Real stories from first-gen pre-med students who made it — proof that your path belongs in medicine too.",
                  iconPath: "M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z",
                },
              ].map((f) => (
                <div key={f.title} className="glass-card rounded-2xl p-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(0,212,255,0.12)" }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={{ color: "#00D4FF" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d={f.iconPath}
                      />
                    </svg>
                  </div>
                  <h3
                    className="font-semibold mb-1.5"
                    style={{ color: "#F8FAFC" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(248,250,252,0.55)" }}
                  >
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* ── How It Works ── */}
            <div className="mt-24 text-left">
              <div className="text-center mb-12">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "#F8FAFC" }}>
                  How It Works
                </h2>
                <p className="text-base" style={{ color: "rgba(248,250,252,0.6)" }}>
                  Three steps from sign-up to a polished application story.
                </p>
              </div>

              <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
                {/* Dotted connector — desktop only, hidden behind the cards */}
                <div
                  className="hidden sm:block absolute top-7 left-[16.66%] right-[16.66%] step-line"
                  style={{ height: 2, zIndex: 0 }}
                />

                {[
                  {
                    n: "1",
                    title: "Create Your Free Account",
                    desc: "Sign up in under 30 seconds — no credit card, no upsells, ever.",
                  },
                  {
                    n: "2",
                    title: "Log Your Experiences",
                    desc: "Track clinical hours, shadowing, research, and volunteering as you go.",
                  },
                  {
                    n: "3",
                    title: "Build Your Narrative",
                    desc: "Use AI tools to reframe your experiences into a compelling med school story.",
                  },
                ].map((step) => (
                  <div key={step.n} className="relative z-10 flex flex-col items-center text-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-4"
                      style={{
                        backgroundColor: "#0A1628",
                        border: "2px solid #00D4FF",
                        color: "#00D4FF",
                        boxShadow: "0 0 20px rgba(0,212,255,0.3)",
                      }}
                    >
                      {step.n}
                    </div>
                    <h3 className="font-bold text-base mb-2" style={{ color: "#F8FAFC" }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: "rgba(248,250,252,0.55)" }}>
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer
          className="relative z-10 px-6 pt-14 pb-6"
          style={{
            borderTop: "1px solid rgba(0,212,255,0.18)",
            background: "rgba(6,14,28,0.6)",
          }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">
              {/* Brand column */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#00D4FF", boxShadow: "0 0 12px rgba(0,212,255,0.4)" }}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 12 6 9 9 13 12 7 15 11 18 8 21 12" />
                    </svg>
                  </div>
                  <span className="font-bold text-base" style={{ color: "#F8FAFC" }}>CliniLog</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(248,250,252,0.5)" }}>
                  Built by and for first-generation pre-med students. Free forever — because your path to medicine shouldn&apos;t cost more than it already does.
                </p>
              </div>

              {/* Product column */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-4"
                  style={{ color: "#00D4FF" }}
                >
                  Product
                </p>
                <ul className="space-y-2.5">
                  {[
                    { label: "Dashboard", href: "/dashboard" },
                    { label: "Schools", href: "/schools" },
                    { label: "Narrative Builder", href: "/dashboard" },
                    { label: "Resources", href: "/resources" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:opacity-80"
                        style={{ color: "rgba(248,250,252,0.65)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Community column */}
              <div>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-4"
                  style={{ color: "#00D4FF" }}
                >
                  Community
                </p>
                <ul className="space-y-2.5">
                  {[
                    { label: "First-Gen Stories", href: "/stories" },
                    { label: "AI Advisor", href: "/dashboard" },
                    { label: "Share Your Story", href: "/stories" },
                    { label: "Fee Tracker", href: "/fee-tracker" },
                  ].map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm transition-colors hover:opacity-80"
                        style={{ color: "rgba(248,250,252,0.65)" }}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Copyright bar */}
            <div
              className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
              style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}
            >
              <p className="text-xs" style={{ color: "rgba(248,250,252,0.4)" }}>
                &copy; {new Date().getFullYear()} CliniLog. Built for first-generation pre-med students.
              </p>
              <p className="text-xs" style={{ color: "rgba(248,250,252,0.3)" }}>
                Made with <span style={{ color: "#00D4FF" }}>♥</span> for the next generation of physicians.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
