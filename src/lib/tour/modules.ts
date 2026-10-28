// Guided tour content. Static text only: no step ever renders user data.
// Each step points at a stable data-tour="..." attribute on the real page.
// A step whose target is missing (empty state, feature gated) is skipped.

export type SampleKind = "path" | "tracker" | "stats";

export interface TourStep {
  /** Pathname the step lives on. */
  page: string;
  /** data-tour value to spotlight, or null for a centered card. */
  target: string | null;
  /** 4 words or fewer. */
  title: string;
  /** 2 sentences at most. */
  body: string;
  /** Advance when the user performs the real action on the target. */
  advanceOn?: "click" | "change";
  /** Shown in place of real data when the user has no entries yet. */
  sample?: SampleKind;
}

export interface TourModule {
  id: string;
  title: string;
  /** Help Center group heading. */
  group: "Basics" | "Application tools" | "More";
  steps: TourStep[];
}

const D = "/dashboard";
const NEW = "/dashboard/new";

export const TOUR_MODULES: TourModule[] = [
  {
    id: "overview",
    title: "Overview",
    group: "Basics",
    steps: [
      { page: D, target: "signals", title: "Countdown and streak", body: "The countdown shows the days until AMCAS opens. The streak counts the weeks in a row you have logged hours." },
      { page: D, target: "key-stats", title: "Your key numbers", body: "Total hours, entries, organizations and how many of the five categories you have covered. They update every time you save or edit an entry.", sample: "stats" },
      { page: D, target: "path", title: "Your Path tree", body: "Each branch is a category, and it grows as you log hours there. Leaf shapes tell the categories apart: solid for clinical, hollow for shadowing, diamond for research, round for volunteering, narrow for other.", sample: "path" },
      { page: D, target: "hours-breakdown", title: "Hours breakdown", body: "The ring splits your total hours by category. Use it to spot a category that is falling behind." },
      { page: D, target: "amcas-tracker", title: "AMCAS Hours Tracker", body: "Each bar compares your hours with a commonly cited benchmark. These are guides that many applicants use, not requirements set by any school.", sample: "tracker" },
      { page: D, target: "insights", title: "Experience Insights", body: "Short suggestions based on your entries and graduation year. Treat them as prompts to think about, not rules." },
    ],
  },
  {
    id: "logging",
    title: "Logging hours",
    group: "Basics",
    steps: [
      { page: D, target: "log-new", title: "Log new hours", body: "Every experience starts here. Click Log new hours to open the form.", advanceOn: "click" },
      { page: NEW, target: "f-placement", title: "Title and organization", body: "Name the role the way you would on AMCAS, and the place you did it. Choose the closest category, and use Other only when none of the four fit." },
      { page: NEW, target: "f-dates", title: "Dates and hours", body: "Leave the end date blank if the experience is ongoing; it shows as present. Enter total hours so far, and update them as you go." },
      { page: NEW, target: "f-desc", title: "Describe what you did", body: "AMCAS descriptions are read closely, so specific details help. Reframe with AI rewrites your draft, and Undo reframe brings your words back." },
      { page: NEW, target: "f-reflection", title: "Optional reflection", body: "Note what you learned while it is fresh. Reflections are private and help when you write essays later." },
      { page: NEW, target: "f-save", title: "Save to record", body: "Saving files the entry under the record number shown at the top. Nothing is saved until you click this." },
    ],
  },
  {
    id: "managing",
    title: "Managing entries",
    group: "Basics",
    steps: [
      { page: D, target: "recent", title: "Recent Experiences", body: "All your entries, newest first. Click a title to open the full record." },
      { page: D, target: "entry-actions", title: "Edit or delete", body: "Edit changes an entry, and Delete removes it for good. Your totals, tree and tracker update right away." },
      { page: D, target: "see-all", title: "See everything", body: "See all jumps to the full list from the top of the page." },
    ],
  },
  {
    id: "import",
    title: "Import CSV",
    group: "Basics",
    steps: [
      { page: "/import", target: "import-template", title: "Start from the template", body: "Download the template to get the right columns. Required: name, organization, category, start date and hours." },
      { page: "/import", target: "import-upload", title: "Upload your file", body: "Files up to 1 MB and 500 rows, 3 imports a day. Nothing is saved yet." },
      { page: "/import", target: null, title: "Check the preview", body: "You see every row before saving, with problems flagged. Untick any row you do not want, then import." },
    ],
  },
  {
    id: "archetype",
    title: "Archetype",
    group: "Basics",
    steps: [
      { page: "/archetype", target: "archetype-locked", title: "Unlocks at three", body: "Your archetype unlocks once you have logged 3 experiences. Until then this page shows how many you have." },
      { page: "/archetype", target: "archetype-result", title: "How it is made", body: "AI reads your entries and picks the profile that fits them best. It reflects only what you have logged, so it changes as you add more." },
      { page: "/archetype", target: "archetype-regenerate", title: "Regenerate", body: "Run it again after logging new hours, up to 3 times a day." },
      { page: "/archetype", target: "archetype-schools", title: "Matched schools", body: "Schools the AI suggests for your profile. Use them as a starting point for research, not a prediction of admission." },
    ],
  },
  {
    id: "schools",
    title: "School Explorer",
    group: "Basics",
    steps: [
      { page: "/schools", target: "schools-stats", title: "Your GPA and MCAT", body: "Enter your stats to highlight schools near their reported averages. It compares numbers only, not your whole application." },
      { page: "/schools", target: "schools-home-state", title: "Home state", body: "Pick your state to see in-state friendly schools where you are a resident. Public schools often favor residents." },
      { page: "/schools", target: "schools-filters", title: "Mission and type", body: "Filter by mission, osteopathic (DO), Caribbean, and in-state or out-of-state friendly. Combine filters to narrow the list." },
      { page: "/schools", target: "school-add", title: "Add to your list", body: "Mark a school Target or Applying to add it to your list. Marked schools appear in Applications." },
      { page: "/schools", target: "school-gap", title: "Gap check", body: "On a marked school, Gap check compares your numbers with its averages. It shows where you fall below, not your chances." },
      { page: "/schools", target: null, title: "Verify before applying", body: "School data here is a guide and can be out of date. Confirm numbers and deadlines on each school's own website." },
    ],
  },
  { id: "tools-applications", title: "Applications", group: "Application tools", steps: [
    { page: "/applications", target: null, title: "My Applications", body: "Track each school from primary through decision. Most useful from June of your application year onward." },
  ] },
  { id: "tools-interviews", title: "Interviews", group: "Application tools", steps: [
    { page: "/interviews", target: null, title: "Interview Log", body: "Record invites, dates, notes and waitlist updates. Use it once interview invites start arriving." },
  ] },
  { id: "tools-letters", title: "Letters", group: "Application tools", steps: [
    { page: "/recommendations", target: null, title: "Letters", body: "Keep track of who is writing for you and when you asked. Start this a few months before you apply." },
  ] },
  { id: "tools-outline", title: "Statement outline", group: "Application tools", steps: [
    { page: "/outline", target: null, title: "Statement Outline", body: "Builds a personal statement outline from your entries. Useful when you start drafting; the writing should stay yours." },
  ] },
  { id: "tools-mock", title: "Mock Interview", group: "Application tools", steps: [
    { page: "/mock-interview", target: null, title: "Mock Interview", body: "Practice answering common interview questions, 10 a day. Best in the weeks before an interview." },
  ] },
  { id: "tools-fees", title: "Fee Tracker", group: "Application tools", steps: [
    { page: "/fee-tracker", target: null, title: "Fee Tracker", body: "Adds up application and secondary fees as you go. Helpful when budgeting, and when applying for fee assistance." },
  ] },
  { id: "tools-gapyear", title: "Gap Year", group: "Application tools", steps: [
    { page: "/gapyear", target: null, title: "Gap Year Planner", body: "Plan what you will do between graduation and medical school. Use it if you are taking one or more gap years." },
  ] },
  { id: "tools-postbacc", title: "Post-bacc", group: "Application tools", steps: [
    { page: "/postbacc", target: null, title: "Post-bacc Tracker", body: "Track post-baccalaureate courses and grades. Useful if you are completing prerequisites after college." },
  ] },
  {
    id: "advisor",
    title: "AI Advisor",
    group: "More",
    steps: [
      { page: "*", target: "advisor-header", title: "Your AI Advisor", body: "Ask about planning, hours or application steps; it can see your logged totals. Its answers are suggestions, not admissions advice." },
      { page: "*", target: "advisor-input", title: "Ask a question", body: "You get 20 messages a day. Do not enter sensitive personal details such as health information or ID numbers." },
    ],
  },
  {
    id: "exports",
    title: "Exports and sharing",
    group: "More",
    steps: [
      { page: D, target: "export-all", title: "Export All to PDF", body: "Downloads every entry as one PDF, ready to copy into AMCAS. It is made in your browser." },
      { page: D, target: "recap", title: "Monthly recap card", body: "After an active month, make a shareable image of that month's hours." },
      { page: D, target: null, title: "Print any page", body: "Pages print as clean documents. Use your browser's Print command." },
      { page: "/profile", target: "wallet-card", title: "Wallet card", body: "A small summary card of your totals you can download." },
      { page: "/profile", target: "referral", title: "Referral link", body: "Share your link with classmates. It only counts new accounts that confirm their email." },
    ],
  },
  {
    id: "profile",
    title: "Profile and settings",
    group: "More",
    steps: [
      { page: "/profile", target: "profile-grad-year", title: "Graduation year", body: "Your graduation year sets the timeline behind insights and suggestions. Keep it current if your plans change." },
      { page: "/profile", target: "theme-toggle", title: "Dark mode", body: "Switch between light and dark here. Your choice follows your account." },
      { page: "/profile", target: "account-data", title: "Your data", body: "Export a copy of everything you have stored, or delete your account and all its data. Deleting cannot be undone." },
      { page: "/profile", target: null, title: "Privacy", body: "Your entries are visible only to you. The Privacy page explains what is stored and who processes it." },
    ],
  },
];

export const MODULE_BY_ID: Record<string, TourModule> = Object.fromEntries(TOUR_MODULES.map((m) => [m.id, m]));
export const MODULE_IDS = TOUR_MODULES.map((m) => m.id);

/** The page a module starts on, used when replaying it from somewhere else. */
export function moduleHome(m: TourModule): string | null {
  const page = m.steps[0]?.page;
  return page && page !== "*" ? page : null;
}

/** Modules whose first step lives on this page, for the header "Page tour" link. */
export function modulesForPage(pathname: string): TourModule[] {
  return TOUR_MODULES.filter((m) => m.steps[0].page === pathname && m.id !== "exports" && m.id !== "managing");
}

export interface HelpAnswer {
  q: string;
  a: string;
}

export const HELP_ANSWERS: HelpAnswer[] = [
  { q: "How do I log hours?", a: "Click Log new hours on Overview, fill in the form and click Save to record." },
  { q: "How do I log an ongoing experience?", a: "Leave the end date blank. It shows as present, and you can update the hours any time with Edit." },
  { q: "Which category should I choose?", a: "Pick the closest of Clinical Work, Shadowing, Research or Volunteering. Use Other only when none of them fit." },
  { q: "How do I change or delete an entry?", a: "Use Edit or Delete on the entry in Recent Experiences. Totals update right away." },
  { q: "How do I import a spreadsheet?", a: "Go to Import CSV, download the template, fill it in and upload it. You can review every row before anything is saved." },
  { q: "When does my archetype unlock?", a: "After you log 3 experiences. You can regenerate it up to 3 times a day." },
  { q: "Are the AMCAS hour benchmarks requirements?", a: "No. They are common benchmarks many applicants use, not rules set by schools." },
  { q: "How accurate is the school data?", a: "It is a guide and can be out of date. Always confirm on each school's own website." },
  { q: "How do I export my entries?", a: "Export All on Overview makes a PDF. Profile has a full data export as a file." },
  { q: "How do I delete my account?", a: "Go to Profile, then Your data, and type DELETE to confirm. This removes all your data and cannot be undone." },
  { q: "Who can see my entries?", a: "Only you. Entries are private to your account, and ClinicLog MD does not share them with Wake Forest or anyone else." },
  { q: "What are the AI limits?", a: "Advisor 20 messages, Reframe 10, outlines 10, mock interviews 10 and archetype 3, each per day." },
  { q: "How do I turn tips off?", a: "Open Help and switch off Show tips. Tours then only run when you start them." },
];
