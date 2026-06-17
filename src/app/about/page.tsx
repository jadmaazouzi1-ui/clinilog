import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#000000", color: "#FFFFFF" }}>
      {/* ── Navbar ── */}
      <header className="relative z-20 px-6 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: "#FFFFFF" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
              </svg>
            </div>
            <span className="font-medium text-base tracking-tight" style={{ color: "#FFFFFF" }}>CliniLog</span>
            <span className="beta-pill">BETA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm font-medium" style={{ color: "#FFFFFF" }}>About</Link>
            <Link
              href="/auth/login"
              className="text-sm font-semibold px-5 py-2 rounded-md transition-colors"
              style={{ color: "#FFFFFF", border: "0.5px solid #FFFFFF" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="px-6 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] mono uppercase tracking-[0.22em] mb-5" style={{ color: "#FFFFFF" }}>
            About CliniLog
          </p>
          <h1 className="text-3xl sm:text-5xl font-medium leading-tight tracking-tight" style={{ color: "#FFFFFF" }}>
            The pre-med journey deserves <span style={{ color: "#FFFFFF" }}>better tools</span>.
          </h1>
        </div>
      </section>

      {/* ── Story ── */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <p className="dept-header">— Our Story</p>
          <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.8)" }}>
            CliniLog started from a simple observation — pre-med students, especially those navigating
            without guidance, spend more time figuring out the system than actually building their experience.
            We built the tool to change that. A place to track every hour, understand your strengths,
            find the right schools, and build a narrative that reflects who you actually are.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <p className="dept-header">— Our Mission</p>
          <div
            className="rounded-lg p-8"
            style={{ backgroundColor: "#000000", border: "0.5px solid rgba(255,255,255,0.12)" }}
          >
            <p className="text-xl leading-relaxed" style={{ color: "#FFFFFF" }}>
              Make the pre-med journey more organized, more accessible, and less intimidating —
              <span style={{ color: "#FFFFFF" }}> for every student, regardless of background.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <p className="dept-header">— What We Believe</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
            {[
              {
                num: "01",
                title: "Accessibility",
                desc: "Core tools are free, always. Cost should never be the reason someone can't track their pre-med journey.",
                iconPath: "M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z",
              },
              {
                num: "02",
                title: "Clarity",
                desc: "Your hours and experiences deserve more than a spreadsheet. CliniLog turns scattered data into a clear narrative.",
                iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                num: "03",
                title: "Community",
                desc: "No student should have to navigate this alone. Real stories, shared resources, peer-tested guidance.",
                iconPath: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
              },
            ].map((v) => (
              <div
                key={v.num}
                className="rounded-lg p-6 flex flex-col"
                style={{ backgroundColor: "#000000", border: "0.5px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="mono text-sm font-medium px-2 py-0.5 rounded"
                    style={{ background: "rgba(255,255,255,0.04)", color: "#FFFFFF", border: "0.5px solid rgba(255,255,255,0.12)" }}
                  >
                    {v.num}
                  </span>
                  <div
                    className="w-9 h-9 rounded-md flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.12)" }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d={v.iconPath} />
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-medium mb-2" style={{ color: "#FFFFFF" }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="px-6 pb-24">
        <div
          className="max-w-3xl mx-auto rounded-lg p-12 text-center"
          style={{ backgroundColor: "#000000", border: "0.5px solid rgba(255,255,255,0.12)" }}
        >
          <h2 className="text-2xl sm:text-3xl font-medium mb-3" style={{ color: "#FFFFFF" }}>
            Ready to get organized?
          </h2>
          <p className="text-base mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
            Build your pre-med journey in one place. Free, forever.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-md font-semibold text-base transition-colors"
            style={{ backgroundColor: "#FFFFFF", color: "#000000" }}
          >
            Get Started Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-8 mt-auto"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#000000" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            &copy; {new Date().getFullYear()} CliniLog. The all-in-one pre-med toolkit.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>About</Link>
            <Link href="/auth/login" className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Sign In</Link>
            <Link href="/auth/signup" className="text-xs" style={{ color: "#FFFFFF" }}>Get Started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
