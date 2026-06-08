// The 15 Pre-Med Archetypes — static metadata. Personalized analysis
// (the "why" paragraph, strengths, etc.) comes from Gemini per user.

export interface Archetype {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Hex color used for accents on this archetype's page */
  color: string;
  /** SVG path data for the icon (24x24 viewBox) */
  iconPath: string;
  /** 5 school names that match this archetype — must match SCHOOLS array */
  idealSchools: string[];
}

export const ARCHETYPES: Archetype[] = [
  {
    id: "community_healer",
    name: "The Community Healer",
    tagline: "Medicine as service. Service as identity.",
    description: "Volunteer-driven, mission-aligned, and deeply rooted in serving the underserved. Primary care is your calling.",
    color: "#10B981",
    iconPath: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
    idealSchools: [
      "University of New Mexico School of Medicine",
      "University of Mississippi Medical Center",
      "Morehouse School of Medicine",
      "Meharry Medical College",
      "Eastern Virginia Medical School",
    ],
  },
  {
    id: "scientist",
    name: "The Scientist",
    tagline: "Research is your second language.",
    description: "Lab-driven, hypothesis-hungry, and built for academic medicine. You think in p-values.",
    color: "#A78BFA",
    iconPath: "M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z",
    idealSchools: [
      "Johns Hopkins School of Medicine",
      "Washington University School of Medicine",
      "Stanford School of Medicine",
      "Duke University School of Medicine",
      "UCSF School of Medicine",
    ],
  },
  {
    id: "first_gen_grinder",
    name: "The First-Gen Grinder",
    tagline: "No blueprint. Built it anyway.",
    description: "Resilient, resourceful, and unbreakable. Your path is non-traditional — and that's exactly the point.",
    color: "#E8A020",
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
    idealSchools: [
      "UCLA David Geffen School of Medicine",
      "UC San Diego School of Medicine",
      "UCSF School of Medicine",
      "Howard University College of Medicine",
      "Charles R. Drew University COM",
    ],
  },
  {
    id: "clinical_immersive",
    name: "The Clinical Immersive",
    tagline: "Hours on the floor. Eyes on the patient.",
    description: "Hands-on, patient-obsessed, and addicted to the clinical environment. You learn by doing.",
    color: "#FF4757",
    iconPath: "M19 14l-7 7m0 0l-7-7m7 7V3",
    idealSchools: [
      "Sidney Kimmel Medical College (Thomas Jefferson)",
      "Drexel University College of Medicine",
      "Wayne State University School of Medicine",
      "University of Illinois COM (Chicago)",
      "Tulane University School of Medicine",
    ],
  },
  {
    id: "advocate",
    name: "The Advocate",
    tagline: "Policy is medicine at scale.",
    description: "Systems-thinker, equity-driven, and unafraid of hard conversations. You see the patient and the system.",
    color: "#F59E0B",
    iconPath: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9",
    idealSchools: [
      "Harvard Medical School",
      "Johns Hopkins School of Medicine",
      "UCSF School of Medicine",
      "Yale School of Medicine",
      "Columbia Vagelos P&S",
    ],
  },
  {
    id: "late_bloomer",
    name: "The Late Bloomer",
    tagline: "The long way is the right way.",
    description: "Career changer, non-traditional, life-tested. You bring perspective that 22-year-olds can't.",
    color: "#FB923C",
    iconPath: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
    idealSchools: [
      "Icahn School of Medicine at Mount Sinai",
      "Boston University School of Medicine",
      "Tufts University School of Medicine",
      "Drexel University College of Medicine",
      "NYU Grossman School of Medicine",
    ],
  },
  {
    id: "renaissance",
    name: "The Renaissance Pre-Med",
    tagline: "Strong in everything. Weak in nothing.",
    description: "Balanced across research, clinical, volunteering, and leadership. Your narrative writes itself.",
    color: "#8B5CF6",
    iconPath: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z",
    idealSchools: [
      "Perelman School of Medicine (Penn)",
      "Yale School of Medicine",
      "Duke University School of Medicine",
      "Washington University School of Medicine",
      "Mayo Clinic Alix School of Medicine",
    ],
  },
  {
    id: "global_health_pioneer",
    name: "The Global Health Pioneer",
    tagline: "Medicine without borders.",
    description: "Cross-cultural, internationally experienced, and built for global health work. Your patient is the world.",
    color: "#06B6D4",
    iconPath: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    idealSchools: [
      "Johns Hopkins School of Medicine",
      "Duke University School of Medicine",
      "UCSF School of Medicine",
      "Columbia Vagelos P&S",
      "Yale School of Medicine",
    ],
  },
  {
    id: "military_medic",
    name: "The Military Medic",
    tagline: "Discipline. Service. Mission.",
    description: "ROTC, veteran, or trained in combat medicine. You bring leadership and grace under pressure.",
    color: "#65A30D",
    iconPath: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    idealSchools: [
      "Uniformed Services University (USUHS)",
      "UT Health San Antonio Long School of Medicine",
      "University of Texas Medical Branch (Galveston)",
      "Brown Warren Alpert Medical School",
      "Penn State College of Medicine",
    ],
  },
  {
    id: "rural_healer",
    name: "The Rural Healer",
    tagline: "The town doctor. Reimagined.",
    description: "Family medicine, rural roots, and a heart for small communities. The shortage areas need you.",
    color: "#84CC16",
    iconPath: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    idealSchools: [
      "University of New Mexico School of Medicine",
      "West Virginia University SOM",
      "University of Mississippi Medical Center",
      "University of North Dakota SOM",
      "University of South Dakota Sanford SOM",
    ],
  },
  {
    id: "mental_health_champion",
    name: "The Mental Health Champion",
    tagline: "The mind matters as much as the body.",
    description: "Behavioral health, crisis intervention, and unstigmatizing mental healthcare. Psychiatry calls you.",
    color: "#F472B6",
    iconPath: "M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25zm0 2.25h.008v.008H12V10.5zm0 2.25h.008v.008H12v-.008z",
    idealSchools: [
      "Yale School of Medicine",
      "University of Pittsburgh School of Medicine",
      "Icahn School of Medicine at Mount Sinai",
      "Columbia Vagelos P&S",
      "UC San Diego School of Medicine",
    ],
  },
  {
    id: "entrepreneur",
    name: "The Entrepreneur",
    tagline: "Built it. Scaled it. Now heal it.",
    description: "Founder, innovator, project builder. You see problems and ship solutions — medicine is just the next frontier.",
    color: "#FACC15",
    iconPath: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
    idealSchools: [
      "Stanford School of Medicine",
      "UCSF School of Medicine",
      "Harvard Medical School",
      "Icahn School of Medicine at Mount Sinai",
      "Perelman School of Medicine (Penn)",
    ],
  },
  {
    id: "educator",
    name: "The Educator",
    tagline: "Teach to heal. Heal to teach.",
    description: "Tutor, teaching assistant, health-literacy advocate. You translate medicine for the people who need it most.",
    color: "#38BDF8",
    iconPath: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    idealSchools: [
      "Columbia Vagelos P&S",
      "University of Michigan Medical School",
      "Vanderbilt University School of Medicine",
      "NYU Grossman School of Medicine",
      "Mayo Clinic Alix School of Medicine",
    ],
  },
  {
    id: "rehabilitation_specialist",
    name: "The Rehabilitation Specialist",
    tagline: "Movement is medicine.",
    description: "PT, OT, sports medicine, disability advocacy. You believe healing isn't complete until function is restored.",
    color: "#22D3EE",
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
    idealSchools: [
      "Northwestern Feinberg School of Medicine",
      "University of Pittsburgh School of Medicine",
      "University of Washington School of Medicine",
      "Mayo Clinic Alix School of Medicine",
      "Sidney Kimmel Medical College (Thomas Jefferson)",
    ],
  },
  {
    id: "public_health_warrior",
    name: "The Public Health Warrior",
    tagline: "One patient at a time isn't enough.",
    description: "Epidemiology, population health, prevention-first thinking. You'd rather stop the disease than treat it.",
    color: "#14B8A6",
    iconPath: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    idealSchools: [
      "Johns Hopkins School of Medicine",
      "Harvard Medical School",
      "UCLA David Geffen School of Medicine",
      "University of Michigan Medical School",
      "University of North Carolina at Chapel Hill SOM",
    ],
  },
];

export function getArchetype(id: string | null | undefined): Archetype | null {
  if (!id) return null;
  return ARCHETYPES.find((a) => a.id === id) ?? null;
}

/** Data returned by Gemini that's personalized to the user */
export interface ArchetypeAnalysis {
  archetype_id: string;
  why_paragraph: string;
  strengths: string[];
  statement_angle: string;
  experiences_to_add: string[];
}
