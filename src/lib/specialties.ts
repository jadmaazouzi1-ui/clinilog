// Specialties shown on the Specialties page. The only figures are from the
// National Resident Matching Program, Results and Data: 2025 Main Residency
// Match, Table 12A ("Match Results for U.S. MD Seniors and U.S. DO Seniors
// Who Ranked Each Specialty as Their Only Choice, 2025"). Each count was
// checked: matched plus unmatched equals the total in the table.
//
// Earlier versions carried salary ranges, lifestyle and competitiveness
// ratings, residency lengths, summaries and "strong program" lists with no
// recorded source. They were removed; see SOURCES_AUDIT.md.

export interface OnlyChoiceResult {
  matched: number;
  total: number;
}

export interface Specialty {
  id: string;
  name: string;
  /** The specialty's name in the NRMP table, when it is in the report. */
  nrmpName: string | null;
  /** Seniors who ranked only this specialty in the 2025 Main Residency Match. */
  md: OnlyChoiceResult | null;
  do: OnlyChoiceResult | null;
}

const nrmp = (id: string, name: string, nrmpName: string, mdMatched: number, mdTotal: number, doMatched: number, doTotal: number): Specialty => ({
  id,
  name,
  nrmpName,
  md: { matched: mdMatched, total: mdTotal },
  do: { matched: doMatched, total: doTotal },
});
/** Not in the 2025 Main Residency Match report (checked by searching it). */
const none = (id: string, name: string): Specialty => ({ id, name, nrmpName: null, md: null, do: null });

export const SPECIALTIES: Specialty[] = [
  nrmp("anesthesiology", "Anesthesiology", "Anesthesiology", 892, 955, 134, 155),
  nrmp("dermatology", "Dermatology", "Dermatology", 75, 97, 6, 14),
  nrmp("emergency_medicine", "Emergency Medicine", "Emergency Medicine", 1279, 1318, 963, 1009),
  nrmp("family_medicine", "Family Medicine", "Family Medicine", 1372, 1381, 1213, 1235),
  nrmp("general_surgery", "General Surgery", "Surgery-General", 792, 873, 171, 213),
  nrmp("internal_medicine", "Internal Medicine", "Internal Medicine", 3705, 3772, 1608, 1649),
  nrmp("neurosurgery", "Neurosurgery", "Neurological Surgery", 212, 291, 5, 15),
  nrmp("neurology", "Neurology", "Neurology", 531, 555, 131, 141),
  nrmp("ob_gyn", "OB/GYN", "Obstetrics and Gynecology", 859, 965, 214, 273),
  nrmp("orthopedic_surgery", "Orthopedic Surgery", "Orthopaedic Surgery", 665, 903, 99, 176),
  nrmp("ent", "Otolaryngology (ENT)", "Otolaryngology", 317, 374, 13, 19),
  nrmp("pathology", "Pathology", "Pathology-Anatomic and Clinical", 249, 267, 94, 104),
  nrmp("pediatrics", "Pediatrics", "Pediatrics", 1402, 1411, 580, 587),
  nrmp("pmr", "Physical Medicine & Rehab", "Physical Medicine and Rehabilitation", 157, 172, 95, 116),
  nrmp("plastic_surgery", "Plastic Surgery", "Plastic Surgery", 166, 215, 1, 2),
  nrmp("psychiatry", "Psychiatry", "Psychiatry", 1270, 1402, 405, 468),
  nrmp("radiology", "Diagnostic Radiology", "Radiology-Diagnostic", 427, 440, 50, 56),
  none("ophthalmology", "Ophthalmology"),
  none("urology", "Urology"),
  none("cardiology", "Cardiology"),
  none("endo", "Endocrinology"),
  none("gi", "Gastroenterology"),
  none("geriatrics", "Geriatrics"),
  none("oncology", "Hematology / Oncology"),
  none("id", "Infectious Disease"),
  none("nephrology", "Nephrology"),
  none("palliative", "Palliative Care"),
  none("pediatric_surgery", "Pediatric Surgery"),
  none("pulm_cc", "Pulmonary / Critical Care"),
  none("sleep_medicine", "Sleep Medicine"),
];

/** "77%" style rate, rounded to whole percent. */
export function matchRate(r: OnlyChoiceResult): number {
  return r.total === 0 ? 0 : Math.round((r.matched / r.total) * 100);
}
