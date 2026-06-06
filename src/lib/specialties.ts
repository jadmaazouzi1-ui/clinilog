export type Rating = 1 | 2 | 3 | 4 | 5;
export type PatientContact = "Low" | "Medium" | "High";
export type IconKey = "stethoscope" | "scalpel" | "brain" | "heart" | "eye" | "bone" | "lung" | "kidney" | "shield" | "baby" | "psyche" | "atom";

export interface Specialty {
  id: string;
  name: string;
  icon: IconKey;
  /** 1 = least competitive, 5 = most competitive */
  competitiveness: Rating;
  salaryMin: number;
  salaryMax: number;
  /** 1 = most demanding hours, 5 = most balanced */
  lifestyle: Rating;
  /** Residency length in years */
  residencyYears: number;
  summary: string;
  topSchools: string[];
  patientContact: PatientContact;
}

export const SPECIALTIES: Specialty[] = [
  { id: "internal_medicine", name: "Internal Medicine", icon: "stethoscope", competitiveness: 2, salaryMin: 230000, salaryMax: 290000, lifestyle: 3, residencyYears: 3,
    summary: "The intellectual workhorse of adult medicine — diagnosing complex multi-system illness in hospitalized or outpatient adults. The most common gateway to subspecialty fellowships like cardiology, GI, and oncology.",
    topSchools: ["Johns Hopkins School of Medicine", "Harvard Medical School", "Duke University School of Medicine", "UCSF School of Medicine"], patientContact: "High" },

  { id: "family_medicine", name: "Family Medicine", icon: "heart", competitiveness: 1, salaryMin: 240000, salaryMax: 300000, lifestyle: 4, residencyYears: 3,
    summary: "Lifelong care across every age and most conditions — the bedrock of primary care. High variety, strong patient relationships, and the most flexible practice settings.",
    topSchools: ["University of New Mexico School of Medicine", "Oregon Health & Science University", "University of Washington School of Medicine", "University of Minnesota Medical School"], patientContact: "High" },

  { id: "pediatrics", name: "Pediatrics", icon: "baby", competitiveness: 2, salaryMin: 220000, salaryMax: 270000, lifestyle: 3, residencyYears: 3,
    summary: "Medical care for kids from newborn through adolescence. A specialty that combines developmental science, family dynamics, and advocacy for vulnerable patients.",
    topSchools: ["Cincinnati Children's (Univ. of Cincinnati COM)", "Boston Children's (Harvard)", "Texas Children's (Baylor)", "CHOP (Penn)"], patientContact: "High" },

  { id: "general_surgery", name: "General Surgery", icon: "scalpel", competitiveness: 3, salaryMin: 410000, salaryMax: 510000, lifestyle: 2, residencyYears: 5,
    summary: "Operative management of abdominal, breast, endocrine, and trauma pathology. Demanding hours but unmatched procedural variety; a common stepping stone to surgical fellowships.",
    topSchools: ["Mayo Clinic Alix School of Medicine", "Johns Hopkins School of Medicine", "Duke University School of Medicine", "University of Michigan Medical School"], patientContact: "High" },

  { id: "ob_gyn", name: "OB/GYN", icon: "heart", competitiveness: 3, salaryMin: 340000, salaryMax: 410000, lifestyle: 2, residencyYears: 4,
    summary: "Women's health from puberty through menopause, with both surgical and clinic-based care. Long hours and unpredictable delivery schedules balanced by deeply meaningful continuity.",
    topSchools: ["UCSF School of Medicine", "Brigham & Women's (Harvard)", "Northwestern Feinberg School of Medicine", "University of Pennsylvania (Penn)"], patientContact: "High" },

  { id: "psychiatry", name: "Psychiatry", icon: "psyche", competitiveness: 2, salaryMin: 280000, salaryMax: 350000, lifestyle: 4, residencyYears: 4,
    summary: "Diagnosis and treatment of mental illness through medication, psychotherapy, and crisis intervention. One of the most flexible specialties — strong telepsych and outpatient options.",
    topSchools: ["Yale School of Medicine", "Columbia Vagelos P&S", "University of Pittsburgh School of Medicine", "Icahn School of Medicine at Mount Sinai"], patientContact: "High" },

  { id: "emergency_medicine", name: "Emergency Medicine", icon: "shield", competitiveness: 2, salaryMin: 350000, salaryMax: 430000, lifestyle: 3, residencyYears: 3,
    summary: "Front-line acute care — anything that walks through the ED doors. Shift-based schedule means good work-life separation but rotating nights, weekends, and holidays.",
    topSchools: ["University of Cincinnati College of Medicine", "Denver Health (Univ. of Colorado)", "Brigham & Women's (Harvard)", "University of Pittsburgh School of Medicine"], patientContact: "High" },

  { id: "anesthesiology", name: "Anesthesiology", icon: "lung", competitiveness: 3, salaryMin: 400000, salaryMax: 500000, lifestyle: 3, residencyYears: 4,
    summary: "Perioperative care, pain management, and critical care expertise across the OR. Procedure-heavy with strong income; lifestyle varies wildly by practice setting.",
    topSchools: ["Johns Hopkins School of Medicine", "Mayo Clinic Alix School of Medicine", "Duke University School of Medicine", "Brigham & Women's (Harvard)"], patientContact: "Medium" },

  { id: "radiology", name: "Diagnostic Radiology", icon: "atom", competitiveness: 4, salaryMin: 480000, salaryMax: 590000, lifestyle: 4, residencyYears: 5,
    summary: "Image-based diagnosis using X-ray, CT, MRI, ultrasound, and interventional procedures. Strong lifestyle and salary with limited direct patient contact for many subspecialties.",
    topSchools: ["University of Pennsylvania (Penn)", "Massachusetts General Hospital (Harvard)", "Mayo Clinic Alix School of Medicine", "Stanford School of Medicine"], patientContact: "Low" },

  { id: "pathology", name: "Pathology", icon: "atom", competitiveness: 2, salaryMin: 320000, salaryMax: 390000, lifestyle: 4, residencyYears: 4,
    summary: "Diagnosis through tissue, blood, and molecular analysis — the 'doctor's doctor.' Excellent lifestyle and intellectual rigor with minimal patient contact.",
    topSchools: ["Johns Hopkins School of Medicine", "Massachusetts General Hospital (Harvard)", "University of Michigan Medical School", "Washington University School of Medicine"], patientContact: "Low" },

  { id: "dermatology", name: "Dermatology", icon: "shield", competitiveness: 5, salaryMin: 450000, salaryMax: 560000, lifestyle: 5, residencyYears: 4,
    summary: "Diagnosis and treatment of skin, hair, and nail conditions, with procedural and cosmetic options. Among the most competitive specialties due to elite lifestyle and compensation.",
    topSchools: ["UCSF School of Medicine", "University of Pennsylvania (Penn)", "NYU Grossman School of Medicine", "Northwestern Feinberg School of Medicine"], patientContact: "High" },

  { id: "orthopedic_surgery", name: "Orthopedic Surgery", icon: "bone", competitiveness: 5, salaryMin: 580000, salaryMax: 720000, lifestyle: 2, residencyYears: 5,
    summary: "Surgical management of bones, joints, and musculoskeletal injury. One of the highest-paying specialties; intense residency hours but strong post-training lifestyle.",
    topSchools: ["Hospital for Special Surgery (Weill Cornell)", "Mayo Clinic Alix School of Medicine", "Washington University School of Medicine", "Duke University School of Medicine"], patientContact: "High" },

  { id: "neurosurgery", name: "Neurosurgery", icon: "brain", competitiveness: 5, salaryMin: 700000, salaryMax: 900000, lifestyle: 1, residencyYears: 7,
    summary: "Surgical care of the brain, spine, and peripheral nerves. The longest residency in medicine with the most demanding hours — but also the highest compensation.",
    topSchools: ["Barrow Neurological Institute (Univ. of Arizona)", "Johns Hopkins School of Medicine", "UCSF School of Medicine", "Massachusetts General Hospital (Harvard)"], patientContact: "High" },

  { id: "cardiology", name: "Cardiology", icon: "heart", competitiveness: 4, salaryMin: 490000, salaryMax: 620000, lifestyle: 2, residencyYears: 6,
    summary: "Adult heart disease management — clinic, hospital, cath lab, or electrophysiology. Requires IM residency plus 3-year fellowship; procedural subspecialties pay highest.",
    topSchools: ["Cleveland Clinic Lerner College of Medicine", "Mayo Clinic Alix School of Medicine", "Johns Hopkins School of Medicine", "Brigham & Women's (Harvard)"], patientContact: "High" },

  { id: "oncology", name: "Hematology / Oncology", icon: "atom", competitiveness: 3, salaryMin: 410000, salaryMax: 520000, lifestyle: 3, residencyYears: 6,
    summary: "Care of cancer and blood disorders — emotionally intense but deeply meaningful. Requires IM residency plus 3-year fellowship; both academic and community paths viable.",
    topSchools: ["MD Anderson (Univ. of Texas)", "Memorial Sloan Kettering (Weill Cornell)", "Dana-Farber (Harvard)", "Johns Hopkins School of Medicine"], patientContact: "High" },

  { id: "neurology", name: "Neurology", icon: "brain", competitiveness: 2, salaryMin: 290000, salaryMax: 360000, lifestyle: 3, residencyYears: 4,
    summary: "Diagnosis and management of brain, spinal cord, and nerve disorders. Intellectually rich; growing subspecialties in stroke, epilepsy, and neuromuscular disease.",
    topSchools: ["Massachusetts General Hospital (Harvard)", "Johns Hopkins School of Medicine", "UCSF School of Medicine", "Columbia Vagelos P&S"], patientContact: "High" },

  { id: "ophthalmology", name: "Ophthalmology", icon: "eye", competitiveness: 5, salaryMin: 410000, salaryMax: 520000, lifestyle: 4, residencyYears: 4,
    summary: "Medical and surgical care of the eye. High procedural variety, strong income, and excellent lifestyle — making it one of the most competitive matches in medicine.",
    topSchools: ["Wilmer Eye Institute (Johns Hopkins)", "Bascom Palmer (Univ. of Miami)", "Wills Eye Hospital (Thomas Jefferson)", "Massachusetts Eye and Ear (Harvard)"], patientContact: "High" },

  { id: "plastic_surgery", name: "Plastic Surgery", icon: "scalpel", competitiveness: 5, salaryMin: 540000, salaryMax: 680000, lifestyle: 2, residencyYears: 6,
    summary: "Reconstructive and aesthetic surgery — burns, trauma, microsurgery, and cosmetic procedures. Six-year integrated residency and a fiercely competitive match.",
    topSchools: ["NYU Grossman School of Medicine", "University of Pennsylvania (Penn)", "Johns Hopkins School of Medicine", "Northwestern Feinberg School of Medicine"], patientContact: "High" },

  { id: "urology", name: "Urology", icon: "kidney", competitiveness: 5, salaryMin: 480000, salaryMax: 590000, lifestyle: 3, residencyYears: 5,
    summary: "Surgical and medical care of the urinary tract and male reproductive system. Procedure-heavy, strong income, and surprisingly varied subspecialties.",
    topSchools: ["UCSF School of Medicine", "Mayo Clinic Alix School of Medicine", "Vanderbilt University School of Medicine", "Cleveland Clinic Lerner College of Medicine"], patientContact: "High" },

  { id: "ent", name: "Otolaryngology (ENT)", icon: "shield", competitiveness: 5, salaryMin: 470000, salaryMax: 580000, lifestyle: 3, residencyYears: 5,
    summary: "Head and neck surgery — ear, sinus, throat, thyroid, and oncologic resection. Highly competitive with diverse subspecialty options and strong outpatient lifestyle.",
    topSchools: ["University of Iowa Carver COM", "Johns Hopkins School of Medicine", "Stanford School of Medicine", "Massachusetts Eye and Ear (Harvard)"], patientContact: "High" },

  { id: "pmr", name: "Physical Medicine & Rehab", icon: "bone", competitiveness: 2, salaryMin: 280000, salaryMax: 340000, lifestyle: 4, residencyYears: 4,
    summary: "Non-surgical rehabilitation of musculoskeletal, spinal cord, and brain injury. Strong lifestyle, growing subspecialties in pain and sports medicine.",
    topSchools: ["Spaulding Rehabilitation (Harvard)", "Rehabilitation Institute of Chicago (Northwestern)", "Johns Hopkins School of Medicine", "Mayo Clinic Alix School of Medicine"], patientContact: "High" },

  { id: "pulm_cc", name: "Pulmonary / Critical Care", icon: "lung", competitiveness: 3, salaryMin: 380000, salaryMax: 470000, lifestyle: 2, residencyYears: 6,
    summary: "ICU and lung-disease care after IM residency plus 3-year fellowship. Procedure-rich with intubation, bronchoscopy, and central lines; nights and weekends are part of the deal.",
    topSchools: ["University of California, San Francisco (UCSF)", "Brigham & Women's (Harvard)", "Cleveland Clinic Lerner College of Medicine", "Johns Hopkins School of Medicine"], patientContact: "High" },

  { id: "gi", name: "Gastroenterology", icon: "stethoscope", competitiveness: 4, salaryMin: 480000, salaryMax: 590000, lifestyle: 3, residencyYears: 6,
    summary: "Digestive disease management and endoscopic procedures. IM residency plus 3-year fellowship; procedure-heavy and one of the higher-paying IM subspecialties.",
    topSchools: ["Mayo Clinic Alix School of Medicine", "Cleveland Clinic Lerner College of Medicine", "Massachusetts General Hospital (Harvard)", "Johns Hopkins School of Medicine"], patientContact: "High" },

  { id: "endo", name: "Endocrinology", icon: "atom", competitiveness: 2, salaryMin: 250000, salaryMax: 310000, lifestyle: 4, residencyYears: 5,
    summary: "Diabetes, thyroid, adrenal, and metabolic disorders. Mostly outpatient with strong continuity; lower-paying among IM subspecialties but excellent lifestyle.",
    topSchools: ["Joslin Diabetes Center (Harvard)", "Johns Hopkins School of Medicine", "Mayo Clinic Alix School of Medicine", "UCSF School of Medicine"], patientContact: "High" },

  { id: "id", name: "Infectious Disease", icon: "shield", competitiveness: 2, salaryMin: 240000, salaryMax: 290000, lifestyle: 4, residencyYears: 5,
    summary: "Diagnosis and management of complex infections, antimicrobial stewardship, and global health. Intellectually rich; lower compensation drives interest toward academic medicine.",
    topSchools: ["Johns Hopkins School of Medicine", "Massachusetts General Hospital (Harvard)", "UCSF School of Medicine", "Duke University School of Medicine"], patientContact: "Medium" },

  { id: "nephrology", name: "Nephrology", icon: "kidney", competitiveness: 2, salaryMin: 270000, salaryMax: 330000, lifestyle: 3, residencyYears: 5,
    summary: "Kidney disease, dialysis, and electrolyte management. Procedure-light but cognitively demanding; growing demand from aging population.",
    topSchools: ["Brigham & Women's (Harvard)", "Johns Hopkins School of Medicine", "Vanderbilt University School of Medicine", "Mayo Clinic Alix School of Medicine"], patientContact: "High" },

  { id: "geriatrics", name: "Geriatrics", icon: "heart", competitiveness: 1, salaryMin: 230000, salaryMax: 280000, lifestyle: 4, residencyYears: 4,
    summary: "Comprehensive care for older adults, including multi-morbidity management and goals-of-care discussions. Critical and growing need but historically under-filled.",
    topSchools: ["Mount Sinai Geriatrics (Icahn SOM)", "Johns Hopkins School of Medicine", "Duke University School of Medicine", "UCSF School of Medicine"], patientContact: "High" },

  { id: "sleep_medicine", name: "Sleep Medicine", icon: "psyche", competitiveness: 2, salaryMin: 260000, salaryMax: 320000, lifestyle: 5, residencyYears: 4,
    summary: "Diagnosis and treatment of sleep disorders — most commonly entered after pulmonary, neurology, or psychiatry training. Excellent lifestyle with predictable hours.",
    topSchools: ["Stanford Center for Sleep Sciences", "Brigham & Women's (Harvard)", "Mayo Clinic Alix School of Medicine", "University of Pennsylvania (Penn)"], patientContact: "High" },

  { id: "palliative", name: "Palliative Care", icon: "heart", competitiveness: 1, salaryMin: 230000, salaryMax: 290000, lifestyle: 3, residencyYears: 4,
    summary: "Symptom management and goals-of-care for patients with serious illness. Deeply meaningful work centered on communication and quality of life.",
    topSchools: ["Mount Sinai Palliative Care (Icahn SOM)", "Massachusetts General Hospital (Harvard)", "Cleveland Clinic Lerner College of Medicine", "UCSF School of Medicine"], patientContact: "High" },

  { id: "pediatric_surgery", name: "Pediatric Surgery", icon: "baby", competitiveness: 5, salaryMin: 460000, salaryMax: 580000, lifestyle: 1, residencyYears: 7,
    summary: "Surgical care of newborns, infants, and children — congenital defects, oncologic, and trauma. Requires general surgery residency plus 2-year fellowship; one of the most competitive fellowships in medicine.",
    topSchools: ["Boston Children's (Harvard)", "CHOP (Penn)", "Texas Children's (Baylor)", "Cincinnati Children's (Univ. of Cincinnati COM)"], patientContact: "High" },
];

export const ICON_PATHS: Record<IconKey, string> = {
  stethoscope: "M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3 M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4",
  scalpel:     "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
  brain:       "M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2z",
  heart:       "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  eye:         "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  bone:        "M17 10c.7-.7 1.69-.7 2.4 0 .7.7.7 1.7 0 2.4-.7.7-.7 1.7 0 2.4.7.7.7 1.7 0 2.4-.7.7-1.7.7-2.4 0-.7-.7-1.7-.7-2.4 0L9 9.4c-.7.7-1.7.7-2.4 0-.7-.7-1.7-.7-2.4 0-.7.7-.7 1.7 0 2.4.7.7.7 1.7 0 2.4-.7.7-.7 1.7 0 2.4.7.7 1.7.7 2.4 0L17 10z",
  lung:        "M6.5 18A4.5 4.5 0 0 1 2 13.5V8a3 3 0 0 1 3-3h.5 M17.5 18a4.5 4.5 0 0 0 4.5-4.5V8a3 3 0 0 0-3-3h-.5 M12 2v16",
  kidney:      "M8 2C6 2 4 4 4 8c0 6 4 10 8 14 4-4 8-8 8-14 0-4-2-6-4-6-2 0-3 1-4 2-1-1-2-2-4-2z",
  shield:      "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  baby:        "M9 12h.01 M15 12h.01 M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5 M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1",
  psyche:      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v4m0 4h.01",
  atom:        "M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0 M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z M20.2 3.8c2.04 2.03.02 7.36-4.5 11.9-4.54 4.52-9.87 6.54-11.9 4.5-2.04-2.03-.02-7.36 4.5-11.9 4.54-4.52 9.87-6.54 11.9-4.5z",
};
