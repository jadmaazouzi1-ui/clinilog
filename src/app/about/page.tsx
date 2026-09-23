import Link from "next/link";

const VALUES = [
  {
    num: "01",
    title: "Accessibility",
    desc: "Core tools are free, always. Cost should never be the reason someone can't track their pre-med journey.",
  },
  {
    num: "02",
    title: "Clarity",
    desc: "Your hours and experiences deserve more than a spreadsheet. ClinicLog MD turns scattered data into a clear narrative.",
  },
  {
    num: "03",
    title: "Community",
    desc: "No student should have to navigate this alone. Real stories, shared resources, peer-tested guidance.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--bg-page)", color: "var(--text-primary)" }}>
      {/* Navbar */}
      <header className="relative z-20 px-6 py-4" style={{ borderBottom: "1px solid var(--border-strong)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
            <span className="text-xl" style={{ color: "var(--text-primary)", fontWeight: 900, letterSpacing: "-0.02em" }}>ClinicLog MD</span>
            <span className="beta-pill">BETA</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/about" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>About</Link>
            <Link
              href="/auth/login"
              className="btn-ghost text-sm font-semibold"
              style={{ padding: "8px var(--sp-2)", textDecoration: "none" }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* Hero: left aligned, as a document opens */}
      <section className="px-6" style={{ paddingTop: "var(--sp-8)", paddingBottom: "var(--sp-6)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="exp-id" style={{ marginBottom: "var(--sp-2)" }}>ABOUT CLINICLOG MD</p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight tracking-tight" style={{ color: "var(--text-primary)" }}>
            The pre-med journey deserves better tools.
          </h1>
        </div>
      </section>

      <div className="max-w-3xl mx-auto w-full px-6"><hr className="tear-line" /></div>

      {/* Story */}
      <section className="px-6" style={{ paddingBottom: "var(--sp-6)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="dept-header">Our Story</p>
          <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            ClinicLog MD started from a simple observation: pre-med students, especially those navigating
            without guidance, spend more time figuring out the system than actually building their experience.
            We built the tool to change that. A place to track every hour, understand your strengths,
            find the right schools, and build a narrative that reflects who you actually are.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6" style={{ paddingBottom: "var(--sp-6)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="dept-header">Our Mission</p>
          <div
            className="tick-corners"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-strong)",
              borderLeft: "2px solid var(--margin-rule)",
              borderRadius: "var(--radius)",
              padding: "var(--sp-4) var(--sp-3)",
            }}
          >
            <p className="text-xl leading-relaxed" style={{ color: "var(--text-primary)" }}>
              Make the pre-med journey more organized, more accessible, and less intimidating,
              for every student, regardless of background.
            </p>
          </div>
        </div>
      </section>

      {/* Values: numbered entries, no decorative icons */}
      <section className="px-6" style={{ paddingBottom: "var(--sp-6)" }}>
        <div className="max-w-5xl mx-auto">
          <p className="dept-header">What We Believe</p>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: "var(--sp-2)" }}>
            {VALUES.map((v) => (
              <div
                key={v.num}
                className="glass-card flex flex-col"
                style={{ padding: "var(--sp-2)" }}
              >
                <span className="exp-id" style={{ marginBottom: "var(--sp-1)" }}>{v.num}</span>
                <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)", marginBottom: 6 }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6" style={{ paddingBottom: "var(--sp-8)" }}>
        <div
          className="max-w-3xl mx-auto tick-corners"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius)",
            padding: "var(--sp-6) var(--sp-4)",
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)", marginBottom: "var(--sp-1)" }}>
            Ready to get organized?
          </h2>
          <p className="text-base" style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-3)" }}>
            Build your pre-med journey in one place. Free, forever.
          </p>
          <Link
            href="/auth/signup"
            className="teal-glow inline-flex items-center font-semibold text-base"
            style={{ padding: "12px var(--sp-3)", textDecoration: "none" }}
          >
            Get started free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 mt-auto"
        style={{ borderTop: "1px solid var(--border-strong)", paddingTop: "var(--sp-3)", paddingBottom: "var(--sp-3)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            &copy; {new Date().getFullYear()} ClinicLog MD. The all-in-one pre-med toolkit.
          </p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="text-xs" style={{ color: "var(--text-secondary)" }}>About</Link>
            <Link href="/auth/login" className="text-xs" style={{ color: "var(--text-secondary)" }}>Sign in</Link>
            <Link href="/auth/signup" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Get started</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
