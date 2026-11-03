import Link from "next/link";
import { redirect } from "next/navigation";
import { Archivo } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import SamplePath from "@/components/landing/SamplePath";
import Logo from "@/components/brand/Logo";
import { AFFILIATION_NOTE } from "@/lib/brand";
import "./landing.css";

// Archivo for every word on this page; JetBrains Mono (from the root layout)
// for the mono labels. No other face is used here.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  variable: "--font-archivo",
});

export const metadata = {
  title: "ClinicLog MD | Pre-med hours tracker",
  description:
    "Log clinical hours, shadowing, research and volunteering, compare them to common AMCAS benchmarks, and find medical schools that fit your GPA and MCAT.",
};

const ROWS: { title: string; body: string }[] = [
  {
    title: "Hours that stay organized",
    body: "Log each session with dates, hours and the organization. Import a spreadsheet, export a PDF, and keep one total that matches everywhere.",
  },
  {
    title: "Schools that fit your numbers",
    body: "Enter your GPA and MCAT, pick a home state, and filter MD, DO and Caribbean programs by mission. Check each school's own site before you apply.",
  },
  {
    title: "A story drawn from your record",
    body: "AI assisted drafts for descriptions, personal statement outlines and mock interview questions. They use only what you logged, and they are yours to rewrite.",
  },
  {
    title: "The rest of the cycle",
    body: "Track secondary essays, interviews, letters, fee assistance and a gap year plan in the same account.",
  },
];

const FOOTER_LINKS: [string, string][] = [
  ["About", "/about"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Changelog", "/changelog"],
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className={`lp ${archivo.variable}`}>
      <div className="lp-dark">
        <header className="lp-wrap lp-header">
          <Link href="/" className="lp-wordmark"><Logo size={28} />CLINICLOG MD</Link>
          <nav className="lp-header-actions" aria-label="Account">
            <Link href="/auth/login" className="lp-textlink">Sign in</Link>
            <Link href="/auth/signup" className="lp-btn lp-btn-solid lp-btn-sm">Create account</Link>
          </nav>
        </header>

        <section className="lp-wrap lp-hero" aria-labelledby="lp-title">
          <p className="lp-eyebrow mono">HOURS, SCHOOLS, STORY</p>
          <h1 id="lp-title">Watch your experience grow into a record.</h1>
          <p className="lp-sub">
            Every hour you log adds a branch. See clinical work, shadowing, research and volunteering take shape,
            and know what to add next before application season.
          </p>
          <div className="lp-actions">
            <Link href="/auth/signup" className="lp-btn lp-btn-solid">Start logging hours</Link>
            <Link href="/auth/login" className="lp-btn lp-btn-outline">Sign in</Link>
          </div>

          <SamplePath />
        </section>
      </div>

      <main className="lp-light">
        <section className="lp-wrap lp-section" aria-labelledby="lp-get">
          <p className="lp-eyebrow lp-eyebrow-light mono" id="lp-get">WHAT YOU GET</p>
          <ol className="lp-rows">
            {ROWS.map((r, i) => (
              <li key={r.title} className="lp-row">
                <span className="lp-row-num mono">{String(i + 1).padStart(2, "0")}</span>
                <h2 className="lp-row-title">{r.title}</h2>
                <p className="lp-row-body">{r.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lp-close" aria-labelledby="lp-close-title">
          <div className="lp-wrap lp-close-inner">
            <h2 id="lp-close-title">Log your first entry in under a minute.</h2>
            <Link href="/auth/signup" className="lp-btn lp-btn-solid">Create account</Link>
          </div>
        </section>
      </main>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-inner">
          <div>
            <p>Built by a first-generation pre-med student at Wake Forest.</p>
            <p className="lp-disclaimer">{AFFILIATION_NOTE}</p>
          </div>
          <nav aria-label="Footer">
            {FOOTER_LINKS.map(([label, href]) => (
              <Link key={href} href={href}>{label}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
