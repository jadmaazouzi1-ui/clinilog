import Link from "next/link";
import { AFFILIATION_NOTE } from "@/lib/brand";
import PublicPage from "@/components/PublicPage";

const DOES = [
  "Logs clinical, shadowing, research and volunteer hours with dates and descriptions, and totals them by category.",
  "Exports your entries as a PDF to copy into the AMCAS Work and Activities section.",
  "Lists medical schools with the GPA and MCAT figures each school publishes, with the class year and a link to the source. See Data sources.",
  "Tracks applications, interviews, letter writers and fees.",
  "Offers AI help (Advisor, Outline, Mock Interview, Archetype). Each is labelled, and the output is a draft for you to check and rewrite.",
];

const DOES_NOT = [
  "It does not predict or promise admission anywhere.",
  "It is not run, sponsored or endorsed by Wake Forest University, and it does not share your entries with the university.",
  "It has no ads and does not sell data.",
];

export const metadata = {
  description: "What ClinicLog MD does, what it does not do, and who runs it.",
};

export default function AboutPage() {
  return (
    <PublicPage>
      <div className="grid lg:grid-cols-12" style={{ gap: "var(--sp-4)" }}>
        <div className="lg:col-span-4">
          <h1 className="text-3xl">About ClinicLog MD</h1>
        </div>
        <div className="lg:col-span-8 legal-prose">
          <p className="text-lg" style={{ color: "var(--text)" }}>
            ClinicLog MD is a tool for pre-med students at Wake Forest. A pre-med student builds and runs it. Sign-up needs a @wfu.edu email.
          </p>
          <p>{AFFILIATION_NOTE}</p>

          <h2>What it does</h2>
          <ul>
            {DOES.map((d) => <li key={d}>{d}</li>)}
          </ul>

          <h2>What it does not do</h2>
          <ul>
            {DOES_NOT.map((d) => <li key={d}>{d}</li>)}
          </ul>

          <h2>Questions or problems</h2>
          <p>
            Inside the app, open Help and use Report a problem. The <Link href="/privacy">Privacy Policy</Link> explains what is stored and who processes it.
          </p>
          <p style={{ marginTop: "var(--sp-3)" }}>
            <Link href="/auth/signup" className="btn btn-primary" style={{ color: "var(--on-action)", textDecoration: "none" }}>Create an account</Link>
          </p>
        </div>
      </div>
    </PublicPage>
  );
}
