import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Logo from "@/components/brand/Logo";
import { AFFILIATION_NOTE } from "@/lib/brand";
import overview from "../../public/landing-overview.webp";
import logger from "../../public/landing-logger.webp";
import "./landing.css";

export const metadata = {
  description:
    "Log clinical hours, shadowing, research and volunteering, compare them to common AMCAS benchmarks, and find medical schools that fit your GPA and MCAT.",
};

// Every figure here is counted from the app itself (src/lib/schools.ts,
// src/lib/specialties.ts, src/lib/rateLimit.ts). Change them together.
const FACTS: { figure: string; label: string; body: string }[] = [
  {
    figure: "5",
    label: "AMCAS categories",
    body: "Clinical work, shadowing, research, volunteering and other, each with its own total and a common benchmark beside it.",
  },
  {
    figure: "248",
    label: "medical schools",
    body: "169 MD, 59 DO and 20 Caribbean programs, filtered by your GPA, MCAT, home state and mission.",
  },
  {
    figure: "1",
    label: "PDF of every entry",
    body: "Dates, hours, descriptions and reflections in one file, laid out for copying into the application.",
  },
  {
    figure: "31",
    label: "specialties",
    body: "Residency length, patient contact and a short summary of each, for deciding who to shadow next.",
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
    <div className="lp">
      <div className="lp-band">
        <header className="lp-wrap lp-header">
          <Link href="/" className="lp-wordmark">
            <Logo size={28} />
            ClinicLog MD
          </Link>
          <nav className="lp-header-links" aria-label="Site">
            <Link href="/about">About</Link>
            <Link href="/auth/login">Sign in</Link>
          </nav>
        </header>

        <section className="lp-wrap lp-hero" aria-labelledby="lp-title">
          <p className="lp-kicker">For pre-med students at Wake Forest</p>
          <h1 id="lp-title">Keep every hour ready for AMCAS.</h1>
          <p className="lp-sub">
            Log clinical work, shadowing, research and volunteering as it happens. When the application opens in
            May, your dates, totals and descriptions are already in one place.
          </p>
          <div className="lp-cta">
            <Link href="/auth/signup" className="btn btn-primary lp-btn-lg">Create an account</Link>
            <p className="lp-cta-note">Sign up with your @wfu.edu email.</p>
          </div>
        </section>

        <figure className="lp-shot lp-shot-hero">
          <Image
            src={overview}
            alt="The ClinicLog MD Overview page: 746 hours across 7 entries, a row of totals, and the Your path panel with one branch per category."
            sizes="(min-width: 1200px) 1100px, 92vw"
            priority
          />
          <figcaption>The Overview page, filled with sample data.</figcaption>
        </figure>
      </div>

      <main>
        <section className="lp-wrap lp-facts" aria-labelledby="lp-facts-title">
          <h2 id="lp-facts-title">What is in it</h2>
          <dl>
            {FACTS.map((f) => (
              <div key={f.label} className="lp-fact">
                <dt>
                  <span className="lp-figure">{f.figure}</span> {f.label}
                </dt>
                <dd>{f.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="lp-wrap lp-split" aria-labelledby="lp-log-title">
          <div className="lp-split-text">
            <h2 id="lp-log-title">One entry is five fields.</h2>
            <p>
              What you did, where, which AMCAS category, when it started and how many hours. The description and the
              reflection can wait until you have time to write them properly.
            </p>
            <p>
              If you already keep hours in a spreadsheet, import it as a CSV and fix anything the import could not read.
            </p>
          </div>
          <figure className="lp-shot">
            <Image
              src={logger}
              alt="The Log hours form with fields for what you did, where, AMCAS category, start and end dates and total hours, and three short tips beside it."
              sizes="(min-width: 1024px) 640px, 92vw"
            />
            <figcaption>The Log hours form, with a sample entry.</figcaption>
          </figure>
        </section>

        <section className="lp-wrap lp-prose" aria-labelledby="lp-data-title">
          <h2 id="lp-data-title">Your record stays yours</h2>
          <p>
            Entries are visible only to your account. The database checks that on every request, so another student
            cannot read them even by guessing a link.
          </p>
          <p>
            You can download everything you have entered as a single file at any time, and deleting your account deletes
            the entries with it. The AI tools see your logged entries when you ask them something, they have daily
            limits, and they can be wrong, so check what they say before you use it.
          </p>
        </section>

        <section className="lp-wrap lp-close" aria-labelledby="lp-close-title">
          <h2 id="lp-close-title">Start with the hours you already have.</h2>
          <Link href="/auth/signup" className="btn btn-primary lp-btn-lg">Create an account</Link>
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
