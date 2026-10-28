import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ARCHETYPES } from "@/lib/archetypes";
import { SCHOOLS } from "@/lib/schools";
import { SITE_URL } from "@/lib/site";
import "./landing.css";

const TITLE = "ClinicLog MD: clinical hours tracker for pre-med students";
const DESCRIPTION = `Log clinical, shadowing, research and volunteer hours in AMCAS categories, compare your GPA and MCAT with ${SCHOOLS.length} medical schools, and draft your application story from what you logged.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "ClinicLog MD",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
  },
};

/* ── Sample dashboard ──
   One illustrative student, labelled as such on the page. The school count
   is not typed in: it runs the same range rule as the school explorer
   (GPA within 0.3 and MCAT within 5 of the school average) over the real
   school list, so it stays true when the list changes. */
const SAMPLE = {
  gpa: 3.72,
  mcat: 513,
  hours: [
    { label: "Clinical work", hours: 212, target: 100 },
    { label: "Shadowing", hours: 48, target: 40 },
    { label: "Research", hours: 120, target: 20 },
    { label: "Volunteering", hours: 26, target: 40 },
  ],
};
const SAMPLE_TOTAL = SAMPLE.hours.reduce((n, h) => n + h.hours, 0);
const SAMPLE_IN_RANGE = SCHOOLS.filter(
  (s) =>
    s.avgGpa !== null &&
    s.avgMcat !== null &&
    Math.abs(s.avgGpa - SAMPLE.gpa) <= 0.3 &&
    Math.abs(s.avgMcat - SAMPLE.mcat) <= 5,
).length;

const ABSTRACTS = [
  {
    n: "01",
    title: "Log hours in AMCAS categories",
    body: "Record clinical work, shadowing, research and volunteering with dates, the organization and a short reflection. Totals update against common targets for each category, and you can import past entries from a spreadsheet.",
  },
  {
    n: "02",
    title: "Find schools that match your numbers",
    body: `Enter your GPA and MCAT to see which of ${SCHOOLS.length} MD, DO and Caribbean programs fall within range of their published averages. Filter by state, mission and in-state preference.`,
  },
  {
    n: "03",
    title: "Build your story from your entries",
    body: "Once you have three or more experiences logged, ClinicLog MD reads them together, names the pattern they form and outlines a personal statement grounded in what you actually did.",
  },
];

const TOOLS = [
  { name: "Applications", body: "Track each school you apply to, its secondary essays and where every application stands." },
  { name: "Interviews", body: "Keep a log of interview dates and notes, and practice common questions with written feedback." },
  { name: "Letters", body: "Follow each recommendation letter from request to submission." },
  { name: "Post-bacc tracker", body: "Recalculates BCPM and cumulative GPA as you add post-baccalaureate courses." },
  { name: "Gap year planner", body: "Set goals for the year and record what you did each month." },
  { name: "AI advisor", body: "Ask questions and get answers that draw on your logged hours, GPA and goals." },
];

const CASE_IDS = ["clinical_immersive", "scientist", "community_healer"];
const CASES = CASE_IDS
  .map((id) => ARCHETYPES.find((a) => a.id === id))
  .filter((a): a is (typeof ARCHETYPES)[number] => !!a);

/* Live platform totals. Each one is shown only once it is large enough to
   mean something; below that it reads as an empty product. A slow or failed
   query hides the block rather than holding up the page or showing zeros. */
const MIN_HOURS = 1000;
const MIN_STUDENTS = 50;
const STATS_TIMEOUT_MS = 1200;

type PublicStats = { total_hours: number; total_users: number };

async function loadStats(supabase: Awaited<ReturnType<typeof createClient>>) {
  const query = supabase
    .rpc("public_stats")
    .single<PublicStats>()
    .then(({ data }) => data, () => null);
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), STATS_TIMEOUT_MS));
  const data = await Promise.race([query, timeout]);

  const out: { label: string; value: string }[] = [];
  const hours = Math.round(Number(data?.total_hours ?? 0));
  const students = Math.round(Number(data?.total_users ?? 0));
  if (hours >= MIN_HOURS) out.push({ label: "Hours logged by students", value: hours.toLocaleString("en-US") });
  if (students >= MIN_STUDENTS) out.push({ label: "Students with a record", value: students.toLocaleString("en-US") });
  return out;
}

const NAV = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Tools", href: "#tools" },
  { label: "Archetypes", href: "#archetypes" },
  { label: "About", href: "/about" },
];

const FOOTER = [
  { label: "About", href: "/about" },
  { label: "Changelog", href: "/changelog" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

function LogoMark() {
  return (
    <span className="lp-logo-mark" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
      </svg>
    </span>
  );
}

function SampleDashboard() {
  return (
    <figure className="lp-sample" aria-labelledby="sample-caption">
      <div className="lp-sample-top">
        <span className="lp-sample-title">AMCAS hours</span>
        <span className="lp-label">Sample dashboard</span>
      </div>
      <div className="lp-bars">
        {SAMPLE.hours.map((h) => (
          <div key={h.label}>
            <div className="lp-bar-row">
              <span className="lp-bar-name">{h.label}</span>
              <span className="lp-bar-num">
                <b>{h.hours}</b> <span>/ {h.target} hrs</span>
              </span>
            </div>
            <div className="lp-bar-track" aria-hidden="true">
              <div className="lp-bar-fill" style={{ width: `${Math.min(100, (h.hours / h.target) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <dl className="lp-sample-foot">
        <div>
          <dt className="lp-label">Total hours</dt>
          <dd className="lp-readout-value">{SAMPLE_TOTAL}</dd>
        </div>
        <div>
          <dt className="lp-label">GPA</dt>
          <dd className="lp-readout-value">{SAMPLE.gpa.toFixed(2)}</dd>
        </div>
        <div>
          <dt className="lp-label">MCAT</dt>
          <dd className="lp-readout-value">{SAMPLE.mcat}</dd>
        </div>
        <div>
          <dt className="lp-label">In range</dt>
          <dd className="lp-readout-value">{SAMPLE_IN_RANGE}</dd>
        </div>
      </dl>
      <figcaption id="sample-caption" className="lp-label" style={{ marginTop: 16, textTransform: "none", letterSpacing: "0.02em" }}>
        Sample student for illustration. In range counts schools within 0.3 GPA and 5 MCAT points of their averages.
      </figcaption>
    </figure>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  const stats = await loadStats(supabase);

  return (
    <div className="lp">
      <header className="lp-header">
        <div className="lp-wrap lp-header-row">
          <Link href="/" className="lp-logo">
            <LogoMark />
            ClinicLog MD
          </Link>
          <nav className="lp-nav" aria-label="Main">
            {NAV.map((l) => (
              <Link key={l.href} href={l.href} className="lp-link">{l.label}</Link>
            ))}
          </nav>
          <div className="lp-nav-auth">
            <Link href="/auth/login" className="lp-btn lp-btn-secondary lp-btn-sm">Sign in</Link>
            <Link href="/auth/signup" className="lp-btn lp-btn-primary lp-btn-sm">Create account</Link>
          </div>
          <details className="lp-menu">
            <summary aria-label="Menu">
              <svg className="lp-icon-open" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
              <svg className="lp-icon-close" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 18L18 6M6 6l12 12" /></svg>
            </summary>
            <nav className="lp-menu-panel" aria-label="Mobile">
              {NAV.map((l) => (
                <Link key={l.href} href={l.href} className="lp-link">{l.label}</Link>
              ))}
              <div className="lp-actions">
                <Link href="/auth/login" className="lp-btn lp-btn-secondary">Sign in</Link>
                <Link href="/auth/signup" className="lp-btn lp-btn-primary">Create account</Link>
              </div>
            </nav>
          </details>
        </div>
      </header>

      <main>
        <div className="lp-wrap">
          {/* Journal header row */}
          <div className="lp-masthead">
            <span className="lp-label">Record for pre-med applicants</span>
            <span className="lp-label lp-masthead-aside">Hours &middot; Schools &middot; Story</span>
          </div>

          {/* Hero: two column editorial layout */}
          <section className="lp-hero" aria-labelledby="hero-title">
            <div>
              <h1 id="hero-title" className="lp-h1">Track your clinical hours for AMCAS and see where you fit.</h1>
              <p className="lp-lead">
                Log every clinical, shadowing, research and volunteer hour as it happens. ClinicLog MD
                totals them by AMCAS category, compares your GPA and MCAT with {SCHOOLS.length} medical
                schools, and turns what you logged into material for your personal statement.
              </p>
              <div className="lp-actions">
                <Link href="/auth/signup" className="lp-btn lp-btn-primary">Create account</Link>
                <Link href="/auth/login" className="lp-btn lp-btn-secondary">Sign in</Link>
              </div>
            </div>
            <SampleDashboard />
          </section>
        </div>

        {stats.length > 0 && (
          <section className="lp-section" aria-labelledby="stats-title">
            <div className="lp-wrap">
              <h2 id="stats-title" className="lp-label lp-kicker">On ClinicLog MD so far</h2>
              <dl className="lp-stats">
                {stats.map((s) => (
                  <div key={s.label} className="lp-stat">
                    <dt className="lp-label">{s.label}</dt>
                    <dd className="lp-stat-value">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        {/* Abstracts */}
        <section id="how-it-works" className="lp-section" aria-labelledby="how-title">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="lp-label lp-kicker">How it works</span>
              <h2 id="how-title" className="lp-h2">Hours, schools and your story.</h2>
            </div>
            <div className="lp-abstracts">
              {ABSTRACTS.map((a) => (
                <article key={a.n} className="lp-abstract">
                  <span className="lp-label">Abstract {a.n}</span>
                  <h3 className="lp-h3">{a.title}</h3>
                  <p className="lp-body">{a.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Data table */}
        <section id="tools" className="lp-section" aria-labelledby="tools-title">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="lp-label lp-kicker">Also in your account</span>
              <h2 id="tools-title" className="lp-h2">Tools for the rest of the cycle.</h2>
            </div>
            <table className="lp-table">
              <thead>
                <tr>
                  <th scope="col" className="lp-label">Tool</th>
                  <th scope="col" className="lp-label">What it does</th>
                </tr>
              </thead>
              <tbody>
                {TOOLS.map((t) => (
                  <tr key={t.name}>
                    <th scope="row">{t.name}</th>
                    <td>{t.body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Case studies */}
        <section id="archetypes" className="lp-section" aria-labelledby="cases-title">
          <div className="lp-wrap">
            <div className="lp-head">
              <span className="lp-label lp-kicker">Case studies</span>
              <h2 id="cases-title" className="lp-h2">See the pattern in your experiences.</h2>
              <p className="lp-body">
                After three logged experiences, ClinicLog MD matches you to one of {ARCHETYPES.length} pre-med
                archetypes and lists schools whose mission fits it. Three of them:
              </p>
            </div>
            <div className="lp-cases">
              {CASES.map((c) => (
                <article key={c.id} className="lp-case">
                  <h3 className="lp-h3">{c.name}</h3>
                  <p className="lp-case-tag">{c.tagline}</p>
                  <p className="lp-body">{c.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="lp-section" aria-labelledby="close-title">
          <div className="lp-wrap lp-close">
            <div>
              <h2 id="close-title" className="lp-h2">Start with the hours you already have.</h2>
              <p className="lp-body" style={{ marginTop: 16 }}>
                Add past experiences one at a time or import them from a spreadsheet, then keep logging as you go.
              </p>
            </div>
            <div className="lp-actions">
              <Link href="/auth/signup" className="lp-btn lp-btn-primary">Start logging hours</Link>
              <Link href="/auth/login" className="lp-btn lp-btn-secondary">Sign in</Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-row">
          <p>&copy; {new Date().getFullYear()} ClinicLog MD</p>
          <nav aria-label="Footer">
            {FOOTER.map((l) => (
              <Link key={l.href} href={l.href} className="lp-link">{l.label}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
