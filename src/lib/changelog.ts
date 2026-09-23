/* Public changelog. Newest first. Dates are ISO and rendered in the
   medical timestamp style at display time. */

export interface ChangelogEntry {
  date: string;
  title: string;
  body: string;
  tags: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "2026-09-23",
    title: "Application cycle tools",
    body: "Secondary essay tracking, an interview log with waitlist movement, a letter of recommendation tracker, and a running application budget. Schools can now be marked Target or Applying from the Schools page.",
    tags: ["Applications", "Interviews", "Letters"],
  },
  {
    date: "2026-09-23",
    title: "School database expanded to 248 programs",
    body: "Every LCME MD program including regional campuses, every COCA DO program with branch campuses listed separately, and a fuller set of offshore programs. Schools that do not publish applicant averages are now marked Not reported rather than carrying an invented figure, and are excluded from stat matching.",
    tags: ["Schools", "Data"],
  },
  {
    date: "2026-09-23",
    title: "Clinical chart interface",
    body: "The interface moved to a medical chart language: intake-form fields, perforated section dividers, registration tick marks, record numbers on every page, and an oscilloscope readout for AMCAS progress.",
    tags: ["Design"],
  },
  {
    date: "2026-09-22",
    title: "Your Path branch visualisation",
    body: "The dashboard now grows an organic branch from your logged categories. Each limb thickens and forks as you add hours to that category, and its label grows with it.",
    tags: ["Dashboard"],
  },
  {
    date: "2026-09-21",
    title: "Archetype engine",
    body: "After three logged experiences, an assessment assigns one of fifteen pre-med archetypes, with matched schools and a personal statement angle drawn from your own entries.",
    tags: ["Archetype", "AI"],
  },
  {
    date: "2026-09-20",
    title: "Hours tracking and AMCAS targets",
    body: "Log clinical, shadowing, research and volunteer hours with dates, organisations and reflections, tracked against AMCAS category targets.",
    tags: ["Dashboard"],
  },
];
