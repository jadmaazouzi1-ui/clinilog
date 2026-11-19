// Where every piece of school and specialty information in ClinicLog MD comes
// from. The Schools and Specialties pages, the PDF exports, the AI notes and
// /data-sources all read from here, so a source is described once.
// SOURCES_AUDIT.md records how each one was checked.

export interface DataSource {
  id: string;
  /** What the dataset is, in a few words. */
  name: string;
  /** The fields this source covers in the app. */
  fields: string[];
  /** Who publishes the data. */
  source: string;
  sourceUrl: string;
  /** The year the figures describe. */
  dataYear: string;
  /** When ClinicLog MD last checked the source. ISO date. */
  lastReviewed: string;
  /** One line on what it does not tell you. */
  limits: string;
}

export const SCHOOL_STATS: DataSource = {
  id: "school-stats",
  name: "Medical school GPA and MCAT averages",
  fields: ["Average or median GPA", "Average or median MCAT", "Entering class year"],
  source: "Each school's own website (its published entering class profile)",
  sourceUrl: "/data-sources#school-stats",
  dataYear: "Varies by school. Each figure shows the entering class it describes.",
  lastReviewed: "2026-11-18",
  limits:
    "Schools publish different things: some give a mean, some a median, some only an MCAT, and some nothing. Figures older than the class that entered in 2022 are not shown.",
};

export const SCHOOL_LIST: DataSource = {
  id: "school-list",
  name: "Medical school list",
  fields: ["School name", "State", "MD, DO or Caribbean"],
  source: "Each school's own website",
  sourceUrl: "/data-sources#school-list",
  dataYear: "Checked November 2026",
  lastReviewed: "2026-11-18",
  limits:
    "Not every school is listed, and a few school websites could not be reached for checking. Inclusion says nothing about quality or accreditation.",
};

export const SPECIALTY_MATCH: DataSource = {
  id: "specialty-match",
  name: "Residency match results by specialty",
  fields: ["U.S. MD seniors who ranked only this specialty, and how many matched", "The same for U.S. DO seniors"],
  source: "National Resident Matching Program, Results and Data: 2025 Main Residency Match, Table 12A",
  sourceUrl: "https://www.nrmp.org/match-data/results-and-data-2025-main-residency-match/",
  dataYear: "2025 Main Residency Match",
  lastReviewed: "2026-11-18",
  limits:
    "13 of the 30 specialties listed, including ophthalmology, urology and cardiology, do not appear in this report, so they have no figures here. These are one year's results, and outcomes change every year and with each applicant.",
};

export const DATA_SOURCES: DataSource[] = [SCHOOL_STATS, SCHOOL_LIST, SPECIALTY_MATCH];

/** Where people report a mistake. Help Center's Report a problem already
 *  exists in the app; this is the public route to it. */
export const REPORT_ERROR = {
  label: "Report a problem in the Help Center",
  note: "Signed in, open Help and choose Report a problem. Tell us the school or specialty and what looks wrong.",
};

export const DATA_PAGE = "/data-sources";

/** "Nov 18, 2026" from an ISO date. */
export function reviewedLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** The short "About this data" notes, two or three sentences each. The long
 *  version is on /data-sources. */
export const NOTES = {
  schools:
    "GPA and MCAT figures come from each school's own website, with the entering class they describe. They can be out of date or wrong, and they are for planning, not a prediction of admission. Confirm GPA, MCAT, prerequisites, deadlines, residency rules and costs on the school's site and in the official AAMC or AACOM resources before you apply.",
  specialties:
    "Match figures come from the NRMP 2025 Main Residency Match report and describe one year. They are general context, not career advice, and outcomes vary by year and by applicant.",
  ai: "AI answers are built from what you logged and can be wrong, and any school or specialty facts in them come from the model, not from these sources. Check them before you rely on them.",
};

/** The one-line attribution used under school and specialty figures. */
export function basedOn(src: DataSource): string {
  return `Based on ${src.source}, ${src.dataYear.replace(/\.$/, "")}.`;
}
