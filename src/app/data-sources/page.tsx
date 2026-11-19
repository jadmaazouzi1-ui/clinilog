import Link from "next/link";
import PublicPage from "@/components/PublicPage";
import { DATA_SOURCES, REPORT_ERROR, reviewedLabel } from "@/lib/data-sources";
import { SCHOOLS, hasPublishedStats } from "@/lib/schools";
import { SPECIALTIES } from "@/lib/specialties";

export const metadata = {
  description: "Where ClinicLog MD's school and specialty figures come from, how current they are, and what they do not cover.",
};

export default function DataSourcesPage() {
  const both = SCHOOLS.filter(hasPublishedStats).length;
  const some = SCHOOLS.filter((s) => !hasPublishedStats(s) && (s.avgGpa !== null || s.avgMcat !== null)).length;
  const specialtiesWithData = SPECIALTIES.filter((s) => s.md).length;

  return (
    <PublicPage>
      <div className="grid lg:grid-cols-12" style={{ gap: "var(--sp-4)" }}>
        <div className="lg:col-span-4">
          <h1 className="text-3xl">About this data</h1>
          <p className="meta" style={{ marginTop: "var(--sp-1)" }}>Where every school and specialty figure in ClinicLog MD comes from.</p>
        </div>

        <div className="lg:col-span-8 legal-prose">
          <p>
            ClinicLog MD compiles the figures below from the sources listed. They can be out of date or wrong, and
            they are for planning your application, not a prediction of whether you will be admitted. School
            requirements and statistics change every cycle.
          </p>
          <p>
            <strong>Before you apply, confirm GPA, MCAT, prerequisites, deadlines, residency rules and costs</strong> on
            each school&apos;s official website and in the official resources from the{" "}
            <a href="https://students-residents.aamc.org/applying-medical-school" target="_blank" rel="noopener noreferrer">AAMC</a> (MD
            programs) or{" "}
            <a href="https://www.aacom.org/become-a-doctor" target="_blank" rel="noopener noreferrer">AACOM</a> (DO programs).
          </p>

          <h2 id="school-stats">Medical school GPA and MCAT figures</h2>
          <p>
            Each figure was read on the school&apos;s own website, on the page linked beside it on the Schools page,
            and describes the entering class named there. Schools publish different things: some give a mean, some a
            median, some only an MCAT, and some nothing. Figures for a class that entered before 2022 are not shown.
          </p>
          <p>
            Of {SCHOOLS.length} schools listed, {both} publish both figures for a recent class, {some} publish one, and the rest
            show as Not reported and are left out of matching. These are not AAMC MSAR figures, which are available only
            by subscription.
          </p>

          <h2 id="school-list">The list of schools</h2>
          <p>
            Names, states and program type (MD, DO, Caribbean or international) were checked against each school&apos;s
            website where it could be reached. A few sites blocked automated checks. The list is not complete, and
            inclusion says nothing about a school&apos;s quality or accreditation.
          </p>

          <h2 id="specialty-match">Specialty match figures</h2>
          <p>
            For {specialtiesWithData} of {SPECIALTIES.length} specialties, the Specialties page shows how many U.S. MD and DO
            seniors who ranked only that specialty matched in the 2025 Main Residency Match, from Table 12A of the
            National Resident Matching Program&apos;s report. The other {SPECIALTIES.length - specialtiesWithData}, including
            ophthalmology, urology and cardiology, are not in that report, so they have no figures. This is general
            context, not career advice: outcomes vary by year and by applicant.
          </p>

          <h2>Earlier data that was removed</h2>
          <p>
            Until November 2026 the app showed school mission tags, in-state preference labels, specialty salaries,
            lifestyle and competitiveness ratings, residency lengths and suggested school lists. Nothing recorded where
            they came from, and some were compiled with the help of an AI model, so they were removed rather than shown
            without a source.
          </p>

          <h2>AI features</h2>
          <p>
            The AI Advisor, Archetype, statement outline and mock interview tools work from what you logged. Any school or
            specialty facts in their answers come from the AI model, not from the sources on this page. Check anything you
            rely on.
          </p>

          <h2>Independence</h2>
          <p>
            ClinicLog MD is an independent student project. It is not affiliated with or endorsed by any medical school,
            Wake Forest University, the AAMC, AACOM, the NRMP or any organization named here.
          </p>

          <h2>Sources and dates</h2>
        </div>
      </div>

      <div className="lg:ml-[33.3333%]" style={{ marginTop: "var(--sp-2)" }}>
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Source</th>
                <th>Covers</th>
                <th>Last reviewed</th>
              </tr>
            </thead>
            <tbody>
              {DATA_SOURCES.map((d) => (
                <tr key={d.id}>
                  <td className="font-semibold">{d.name}</td>
                  <td>
                    {d.sourceUrl.startsWith("http") ? (
                      <a href={d.sourceUrl} className="link" target="_blank" rel="noopener noreferrer">{d.source}</a>
                    ) : (
                      d.source
                    )}
                    <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: 2 }}>{d.limits}</p>
                  </td>
                  <td>{d.dataYear}</td>
                  <td className="tnum" style={{ whiteSpace: "nowrap" }}>{reviewedLabel(d.lastReviewed)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="legal-prose" style={{ marginTop: "var(--sp-4)" }}>
          <h2 id="report">Found a mistake?</h2>
          <p>
            {REPORT_ERROR.note} If you are not signed in, <Link href="/auth/login">sign in</Link> first. Corrections are
            checked against the school&apos;s own site or the NRMP report before they change here.
          </p>
        </div>
      </div>
    </PublicPage>
  );
}
