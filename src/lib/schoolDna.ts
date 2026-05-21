// School DNA — researched profiles for well-known schools, plus a
// deterministic derivation function for the long tail.

export type Rating = "Low" | "Medium" | "High";

export interface SchoolDna {
  researchIntensity: Rating;
  primaryCareFocus: Rating;
  diversityInclusion: Rating;
  ruralClinicalExposure: Rating;
  workLifeBalance: Rating;
  communityHealthFocus: Rating;
  firstGenFriendliness: Rating;
  /** % of graduates entering primary care (PCP fields) */
  primaryCarePercent: number;
  /** Average debt at graduation in USD */
  avgDebt: number;
  /** Two-sentence vibe description */
  vibe: string;
}

export interface SchoolLike {
  name: string;
  state: string;
  avgGpa: number;
  avgMcat: number;
  mission: string;
}

const RURAL_STATES = new Set([
  "WV", "MT", "ND", "SD", "MS", "AL", "KY", "AR", "NM", "ID", "WY", "VT", "ME", "NE", "OK", "IA",
]);

const HEAVY_URBAN_STATES = new Set(["NY", "MA", "IL", "CA", "PA", "MD", "DC"]);

// ── Curated DNA for well-known schools ────────────────────────────────────
// Hand-researched (or close-to-it) data for high-profile programs. Anything
// not in this map falls back to deriveDna().
const CURATED: Record<string, SchoolDna> = {
  "Harvard Medical School": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Low", workLifeBalance: "Medium", communityHealthFocus: "Medium",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 32, avgDebt: 105000,
    vibe: "An intense, research-saturated environment where ambition meets unlimited resources. Pathways curriculum is collaborative and pass/fail, but the academic firepower can feel overwhelming.",
  },
  "Johns Hopkins School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "Low", diversityInclusion: "Medium",
    ruralClinicalExposure: "Low", workLifeBalance: "Low", communityHealthFocus: "High",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 25, avgDebt: 175000,
    vibe: "The original research juggernaut, with intensity to match. Strong community ties to Baltimore mean unmatched clinical exposure to underserved populations.",
  },
  "Stanford School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Low", workLifeBalance: "High", communityHealthFocus: "Medium",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 30, avgDebt: 130000,
    vibe: "Silicon Valley innovation culture with an unusually relaxed academic pace. Heavy emphasis on physician-scientists, dual degrees, and translational research.",
  },
  "Columbia Vagelos P&S": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Low", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 35, avgDebt: 95000,
    vibe: "Need-based full-tuition aid for most students transforms accessibility. Manhattan setting offers diverse patient populations from Washington Heights to the Upper East Side.",
  },
  "Perelman School of Medicine (Penn)": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Low", workLifeBalance: "Medium", communityHealthFocus: "Medium",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 30, avgDebt: 150000,
    vibe: "Ivy-tier rigor with a surprisingly collegial culture. Modular curriculum lets students dive into research or specialized tracks early.",
  },
  "Yale School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Low", workLifeBalance: "High", communityHealthFocus: "Medium",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 32, avgDebt: 165000,
    vibe: "The 'Yale System' — pass/fail, no internal rankings, no required attendance — fosters genuine intellectual freedom. Independent thesis requirement makes this a research-first culture.",
  },
  "Washington University School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "Low", diversityInclusion: "Medium",
    ruralClinicalExposure: "Low", workLifeBalance: "Medium", communityHealthFocus: "Medium",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 22, avgDebt: 170000,
    vibe: "Quietly elite Midwestern powerhouse with massive NIH funding. Strong sciences focus, with most graduates heading into competitive specialties or research.",
  },
  "Duke University School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Medium", workLifeBalance: "Medium", communityHealthFocus: "Medium",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 28, avgDebt: 175000,
    vibe: "Unique compressed 3-year preclinical schedule frees up an entire year for research or scholarship. Southern collegiality with strong global health and research opportunities.",
  },
  "University of Michigan Medical School": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Medium", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 38, avgDebt: 160000,
    vibe: "Big public university culture means strong support networks and broad clinical exposure. Active commitment to diversity recruitment and first-gen mentorship.",
  },
  "Vanderbilt University School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Medium", workLifeBalance: "High", communityHealthFocus: "Medium",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 30, avgDebt: 145000,
    vibe: "Curriculum 2.0 is project-based and famously student-friendly with strong wellness emphasis. Southern hospitality meets cutting-edge research in Nashville.",
  },
  "NYU Grossman School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Low", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 30, avgDebt: 25000,
    vibe: "Tuition-free for all admitted students — a financial game-changer. Manhattan-based with elite clinical and research opportunities at Bellevue and Tisch.",
  },
  "Icahn School of Medicine at Mount Sinai": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Low", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 32, avgDebt: 175000,
    vibe: "Innovative humanities-friendly curriculum (FlexMed accepts non-traditional applicants). East Harlem location guarantees rich community-health and underserved exposure.",
  },
  "UC San Diego School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "High", diversityInclusion: "High",
    ruralClinicalExposure: "Medium", workLifeBalance: "High", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 45, avgDebt: 145000,
    vibe: "California vibes with serious science chops — student-run free clinics are a core part of the experience. Strong commitment to underserved Southern California populations.",
  },
  "UCLA David Geffen School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "High", diversityInclusion: "High",
    ruralClinicalExposure: "Medium", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 42, avgDebt: 130000,
    vibe: "World-class research with a mission-driven core — the PRIME-LA track specifically trains physicians for underserved LA communities. Highly diverse student body.",
  },
  "UCSF School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "High", diversityInclusion: "High",
    ruralClinicalExposure: "Medium", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 40, avgDebt: 120000,
    vibe: "The gold standard for socially conscious research medicine. Bridges Curriculum integrates inquiry and equity from day one; San Francisco patient population is unmatched.",
  },
  "University of Texas Southwestern": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "Medium",
    ruralClinicalExposure: "Medium", workLifeBalance: "Medium", communityHealthFocus: "Medium",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 35, avgDebt: 100000,
    vibe: "Massive research output with one of the lowest in-state tuitions in the country. Parkland Hospital provides extraordinary public-health and trauma exposure.",
  },
  "Baylor College of Medicine": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "High",
    ruralClinicalExposure: "Low", workLifeBalance: "Medium", communityHealthFocus: "Medium",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 35, avgDebt: 95000,
    vibe: "Texas Medical Center access means unbeatable clinical breadth. Notably affordable for a top-tier private school.",
  },
  "Mayo Clinic Alix School of Medicine": {
    researchIntensity: "High", primaryCareFocus: "Medium", diversityInclusion: "Medium",
    ruralClinicalExposure: "Medium", workLifeBalance: "High", communityHealthFocus: "Medium",
    firstGenFriendliness: "Medium",
    primaryCarePercent: 30, avgDebt: 100000,
    vibe: "Patient-first culture and small class sizes create tight-knit cohorts. The Mayo Model of integrated care is legendary, and tuition support is generous.",
  },

  // ── HBCUs / strongly mission-driven ─────────────────────────────────────
  "Howard University College of Medicine": {
    researchIntensity: "Medium", primaryCareFocus: "High", diversityInclusion: "High",
    ruralClinicalExposure: "Low", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 55, avgDebt: 280000,
    vibe: "Historic HBCU with an unmatched legacy of training Black physicians. Strong sense of community and explicit mission to serve underserved populations.",
  },
  "Meharry Medical College": {
    researchIntensity: "Medium", primaryCareFocus: "High", diversityInclusion: "High",
    ruralClinicalExposure: "Medium", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 60, avgDebt: 295000,
    vibe: "Among the top producers of Black physicians in the country. Mission-aligned culture focused on health equity and underserved Nashville communities.",
  },
  "Morehouse School of Medicine": {
    researchIntensity: "Medium", primaryCareFocus: "High", diversityInclusion: "High",
    ruralClinicalExposure: "Medium", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 65, avgDebt: 275000,
    vibe: "HBCU with a fiercely community-centered mission — graduates routinely return to underserved Atlanta and Southern communities. Strong primary care pipeline.",
  },
  "Charles R. Drew University COM": {
    researchIntensity: "Medium", primaryCareFocus: "High", diversityInclusion: "High",
    ruralClinicalExposure: "Low", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 70, avgDebt: 260000,
    vibe: "Explicitly focused on training physicians for medically underserved South LA. Small, mission-driven, deeply rooted in community health.",
  },
  "Ponce Health Sciences University SOM": {
    researchIntensity: "Low", primaryCareFocus: "High", diversityInclusion: "High",
    ruralClinicalExposure: "High", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 60, avgDebt: 250000,
    vibe: "Bilingual Puerto Rico-based program serving the island's diverse communities. Strong emphasis on cultural humility and community-based learning.",
  },

  // ── Public state schools with strong mission ────────────────────────────
  "University of New Mexico School of Medicine": {
    researchIntensity: "Medium", primaryCareFocus: "High", diversityInclusion: "High",
    ruralClinicalExposure: "High", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 65, avgDebt: 150000,
    vibe: "One of the strongest rural-medicine pipelines in the country, with deep ties to Native American and Hispanic communities. Affordable and mission-aligned.",
  },
  "University of Mississippi Medical Center": {
    researchIntensity: "Medium", primaryCareFocus: "High", diversityInclusion: "Medium",
    ruralClinicalExposure: "High", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 60, avgDebt: 165000,
    vibe: "The only MD program in Mississippi — graduates are critical to addressing the state's rural physician shortage. Heavy emphasis on serving Mississippi residents.",
  },
  "West Virginia University SOM": {
    researchIntensity: "Medium", primaryCareFocus: "High", diversityInclusion: "Medium",
    ruralClinicalExposure: "High", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 55, avgDebt: 180000,
    vibe: "Appalachian focus with required rural rotations across West Virginia. Tight-knit community feel and strong primary care and family medicine programs.",
  },
  "Eastern Virginia Medical School": {
    researchIntensity: "Medium", primaryCareFocus: "High", diversityInclusion: "High",
    ruralClinicalExposure: "Medium", workLifeBalance: "Medium", communityHealthFocus: "High",
    firstGenFriendliness: "High",
    primaryCarePercent: 55, avgDebt: 220000,
    vibe: "Community-focused private school with strong primary care and OB/GYN reputations. Hampton Roads location means diverse, often underserved patient mix.",
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────
function ratingValue(r: Rating): number {
  return r === "Low" ? 1 : r === "Medium" ? 2 : 3;
}

export function ratingToPercent(r: Rating): number {
  return r === "Low" ? 33 : r === "Medium" ? 66 : 100;
}

// ── Derivation function for the long tail ─────────────────────────────────
function deriveDna(school: SchoolLike): SchoolDna {
  const mission = school.mission.toLowerCase();
  const state = school.state;
  const isResearch = mission.includes("research");
  const isPrimaryCare = mission.includes("primary care") || mission.includes("underserved");
  const isOsteo = mission.includes("osteopathic");
  const isCommunity = mission.includes("community");
  const isCaribbean = mission.includes("caribbean");
  const isRural = RURAL_STATES.has(state);
  const isUrban = HEAVY_URBAN_STATES.has(state);
  const highMcat = school.avgMcat >= 518;

  // Research intensity
  let researchIntensity: Rating = "Medium";
  if (isResearch && highMcat) researchIntensity = "High";
  else if (isResearch) researchIntensity = "Medium";
  else if (isPrimaryCare || isCommunity || isCaribbean) researchIntensity = "Low";
  else if (isOsteo) researchIntensity = "Low";

  // Primary care focus
  let primaryCareFocus: Rating = "Medium";
  if (isPrimaryCare) primaryCareFocus = "High";
  else if (isCommunity) primaryCareFocus = "High";
  else if (isOsteo) primaryCareFocus = "High";
  else if (isResearch && highMcat) primaryCareFocus = "Low";

  // Diversity & inclusion
  let diversityInclusion: Rating = "Medium";
  if (isCommunity || isPrimaryCare) diversityInclusion = "High";
  else if (isUrban) diversityInclusion = "High";
  else if (isCaribbean) diversityInclusion = "High";

  // Rural clinical exposure
  let ruralClinicalExposure: Rating = "Medium";
  if (isRural) ruralClinicalExposure = "High";
  else if (isUrban) ruralClinicalExposure = "Low";
  else if (isOsteo) ruralClinicalExposure = "Medium";

  // Work-life balance reputation
  let workLifeBalance: Rating = "Medium";
  if (isResearch && highMcat) workLifeBalance = "Low";
  else if (isPrimaryCare || isCommunity) workLifeBalance = "Medium";

  // Community health focus
  let communityHealthFocus: Rating = "Medium";
  if (isCommunity) communityHealthFocus = "High";
  else if (isPrimaryCare) communityHealthFocus = "High";
  else if (isResearch && highMcat) communityHealthFocus = "Medium";
  else if (isCaribbean) communityHealthFocus = "Low";

  // First-gen friendliness
  let firstGenFriendliness: Rating = "Medium";
  if (isCommunity || isPrimaryCare) firstGenFriendliness = "High";
  else if (isOsteo) firstGenFriendliness = "High";
  else if (isResearch && highMcat) firstGenFriendliness = "Medium";
  else if (isCaribbean) firstGenFriendliness = "Medium";

  // % primary care
  let primaryCarePercent = 38;
  if (isPrimaryCare) primaryCarePercent = 62;
  else if (isCommunity) primaryCarePercent = 58;
  else if (isOsteo) primaryCarePercent = 55;
  else if (isResearch && highMcat) primaryCarePercent = 28;
  else if (isResearch) primaryCarePercent = 35;
  else if (isCaribbean) primaryCarePercent = 50;

  // Avg debt
  let avgDebt = 220000;
  if (isCaribbean) avgDebt = 325000;
  else if (isOsteo) avgDebt = 270000;
  else if (isResearch && highMcat) avgDebt = 175000;
  else if (isPrimaryCare && isRural) avgDebt = 170000;
  else if (state === "TX" || state === "FL") avgDebt = 180000;

  // Vibe
  const vibe = generateVibe(school, { isResearch, isPrimaryCare, isOsteo, isCommunity, isCaribbean, isRural, isUrban, highMcat });

  return {
    researchIntensity, primaryCareFocus, diversityInclusion, ruralClinicalExposure,
    workLifeBalance, communityHealthFocus, firstGenFriendliness,
    primaryCarePercent, avgDebt, vibe,
  };
}

interface VibeFlags {
  isResearch: boolean; isPrimaryCare: boolean; isOsteo: boolean;
  isCommunity: boolean; isCaribbean: boolean; isRural: boolean;
  isUrban: boolean; highMcat: boolean;
}

function generateVibe(school: SchoolLike, f: VibeFlags): string {
  const stateName = STATE_NAMES[school.state] ?? school.state;
  if (f.isCaribbean) {
    return `Offshore Caribbean program designed for students seeking an alternative pathway to US residency. Strong USMLE prep culture, though clinical rotations and residency matching require extra planning.`;
  }
  if (f.isOsteo) {
    const ruralLine = f.isRural ? " The program leans heavily into rural and underserved rotations." : "";
    return `Osteopathic program emphasizing primary care, holistic patient care, and the principles of OMM.${ruralLine} Collaborative class culture with strong support for first-time test-takers.`;
  }
  if (f.isPrimaryCare) {
    return `Mission-driven program focused on training physicians who serve ${stateName}'s underserved and rural communities. Curriculum prioritizes community-based learning, longitudinal patient relationships, and primary care.`;
  }
  if (f.isCommunity) {
    return `Community-health focus with deep ties to local underserved populations in ${stateName}. Students get meaningful patient continuity and exposure to public-health-oriented practice from year one.`;
  }
  if (f.isResearch && f.highMcat) {
    return `Top-tier research institution with significant NIH funding and a competitive academic culture. Students typically pursue research-heavy specialties; expect rigorous coursework and ample lab opportunities.`;
  }
  if (f.isResearch) {
    return `Well-resourced academic medical center balancing research and clinical training. Strong support for students interested in academic medicine alongside traditional clinical pathways.`;
  }
  if (f.isRural) {
    return `Public ${stateName} medical school with strong ties to the state's rural and small-town healthcare needs. Tight-knit cohort culture and an explicit focus on training in-state physicians.`;
  }
  return `Established medical program in ${stateName} balancing clinical training, research opportunities, and community engagement. Solid all-around preparation across competitive and primary care specialties.`;
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "Washington, D.C.", PR: "Puerto Rico",
};

// ── Public API ────────────────────────────────────────────────────────────
export function getDna(school: SchoolLike): SchoolDna {
  return CURATED[school.name] ?? deriveDna(school);
}

export const DNA_FIELDS: { key: keyof Pick<SchoolDna, "researchIntensity" | "primaryCareFocus" | "diversityInclusion" | "ruralClinicalExposure" | "workLifeBalance" | "communityHealthFocus" | "firstGenFriendliness">; label: string }[] = [
  { key: "researchIntensity",     label: "Research Intensity" },
  { key: "primaryCareFocus",      label: "Primary Care Focus" },
  { key: "diversityInclusion",    label: "Diversity & Inclusion" },
  { key: "ruralClinicalExposure", label: "Rural Clinical Exposure" },
  { key: "workLifeBalance",       label: "Work-Life Balance Reputation" },
  { key: "communityHealthFocus",  label: "Community Health Focus" },
  { key: "firstGenFriendliness",  label: "First-Gen Friendliness" },
];

// Suppress unused-import warning for ratingValue (kept for future use)
void ratingValue;
