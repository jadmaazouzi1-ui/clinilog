import Link from "next/link";

const DOES = [
  "Logs clinical, shadowing, research and volunteer hours with dates and descriptions, and totals them by category.",
  "Exports your entries as a PDF to copy into the AMCAS Work and Activities section.",
  "Lists medical schools with approximate average GPA and MCAT so you can see which are close to your numbers.",
  "Tracks applications, interviews, letter writers and fees.",
  "Offers AI help (Advisor, Reframe, Outline, Mock Interview, Archetype). Each is labelled, and the output is a draft for you to check and rewrite.",
];

const DOES_NOT = [
  "It does not predict or promise admission anywhere.",
  "It is not run, sponsored or endorsed by Wake Forest University, and it does not share your entries with the university.",
  "It has no ads and does not sell data.",
];

export const metadata = {
  title: "About | ClinicLog MD",
  description: "What ClinicLog MD does, what it does not do, and who runs it.",
};

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

      {/* A short, plain document */}
      <section className="px-6" style={{ paddingTop: "var(--sp-8)", paddingBottom: "var(--sp-6)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="exp-id" style={{ marginBottom: "var(--sp-2)" }}>ABOUT</p>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight" style={{ color: "var(--text-primary)", marginBottom: "var(--sp-2)" }}>
            About ClinicLog MD
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            ClinicLog MD is a tool for pre-med students at Wake Forest. A pre-med student builds and runs it. Sign-up needs a @wfu.edu email.
          </p>

          <hr className="tear-line" />

          <p className="dept-header">What it does</p>
          <ul className="legal-prose" style={{ marginBottom: "var(--sp-4)" }}>
            {DOES.map((d) => <li key={d}>{d}</li>)}
          </ul>

          <p className="dept-header">What it does not do</p>
          <ul className="legal-prose" style={{ marginBottom: "var(--sp-4)" }}>
            {DOES_NOT.map((d) => <li key={d}>{d}</li>)}
          </ul>

          <p className="dept-header">Questions or problems</p>
          <p className="text-base" style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-3)" }}>
            Inside the app, open Help and use Report a problem. The <Link href="/privacy" style={{ color: "var(--accent)" }}>Privacy Policy</Link> explains what is stored and who processes it.
          </p>

          <Link
            href="/auth/signup"
            className="teal-glow inline-flex items-center font-semibold text-sm"
            style={{ padding: "12px var(--sp-3)", textDecoration: "none" }}
          >
            Create account
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
            &copy; {new Date().getFullYear()} ClinicLog MD
          </p>
          <div className="flex items-center gap-5">
            <Link href="/about" className="text-xs" style={{ color: "var(--text-secondary)" }}>About</Link>
            <Link href="/privacy" className="text-xs" style={{ color: "var(--text-secondary)" }}>Privacy</Link>
            <Link href="/terms" className="text-xs" style={{ color: "var(--text-secondary)" }}>Terms</Link>
            <Link href="/auth/login" className="text-xs" style={{ color: "var(--text-secondary)" }}>Sign in</Link>
            <Link href="/auth/signup" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>Create account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
