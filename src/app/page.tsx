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
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#00D4FF" }}
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0A1628"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="2,12 5,12 7,7 9,17 11,10 13,14 15,12 22,12" />
                </svg>
              </div>
              <span className="font-bold text-lg" style={{ color: "#F8FAFC" }}>
                CliniLog
              </span>
            </div>

            <Link
              href="/auth/login"
              className="teal-hover text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              style={{
                color: "#00D4FF",
                border: "1px solid rgba(0,212,255,0.35)",
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
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full mb-8"
              style={{
                backgroundColor: "rgba(0,212,255,0.1)",
                border: "1px solid rgba(0,212,255,0.3)",
                color: "#00D4FF",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "#00D4FF" }}
              />
              100% free — no credit card required
            </div>

            {/* Headline */}
            <h1
              className="text-5xl font-bold leading-tight tracking-tight mb-5"
              style={{ color: "#F8FAFC" }}
            >
              Built for First-Gen{" "}
              <span style={{ color: "#00D4FF" }}>Pre-Med</span> Students
            </h1>

            <p
              className="text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
              style={{ color: "rgba(248,250,252,0.65)" }}
            >
              Track your clinical hours, explore 150+ medical schools, and build
              your path to medicine — all in one free tool.
            </p>

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
            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
              {[
                {
                  icon: (
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
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  ),
                  title: "Track Every Hour",
                  desc: "Log clinical work, shadowing, research, and volunteering with dates, hours, and reflections.",
                },
                {
                  icon: (
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
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  ),
                  title: "Explore 150+ Schools",
                  desc: "Filter by GPA, MCAT, mission focus, and state preference to find programs that fit your profile.",
                },
                {
                  icon: (
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
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  ),
                  title: "Export to PDF",
                  desc: "Download a clean, formatted summary of all your experiences to share with advisors or for applications.",
                },
              ].map((f) => (
                <div key={f.title} className="glass-card rounded-2xl p-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: "rgba(0,212,255,0.12)" }}
                  >
                    {f.icon}
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
          </div>
        </main>

        {/* Footer */}
        <footer
          className="relative z-10 px-6 py-6 text-center text-sm"
          style={{
            borderTop: "1px solid rgba(0,212,255,0.1)",
            color: "rgba(248,250,252,0.35)",
          }}
        >
          &copy; {new Date().getFullYear()} CliniLog. Built for
          first-generation pre-med students.
        </footer>
      </div>
    </>
  );
}
