# Data sources audit

Where every school and specialty figure in ClinicLog MD comes from. Updated 19 Nov 2026. The app reads its source text from `src/lib/data-sources.ts`; this file records how each source was checked.

## Before 18 Nov 2026

Nothing in the repository recorded a source for any school or specialty figure. The 248-school list was expanded on 2026-09-23 in a commit co-authored by an AI model; all specialty data (salary, lifestyle, competitiveness, residency length, summaries, "strong programs") was added on 2026-06-05 in a commit co-authored by an AI model; the archetype school lists were added the same way on 2026-06-04. All of it was replaced or removed on 18 and 19 Nov 2026, as below.

## Now

| Dataset | Field | Source | Data year | Last checked | Status |
|---|---|---|---|---|---|
| Schools (`src/lib/schools.ts`, 248) | GPA, MCAT | Each school's own website, the page in `sourceUrl` | The entering class in `enteringYear` (2022 or later) | 2026-11-18 | 77 schools show both figures, 7 show one, 164 show Not reported. Full record in `docs/data/school-sources.csv`. |
| Schools | Mean or median | The same page | | 2026-11-18 | Shown when the page says; left blank when it does not or mixes the two (Creighton). |
| Schools | Name, state, MD/DO/Caribbean | Each school's own website, where reachable | | 2026-11-18 | Names kept as before so saved schools still match. Official names, renamings and unreachable sites are noted in the CSV. |
| Schools | Mission tags, in-state preference | None | | | Removed. |
| Specialties (`src/lib/specialties.ts`, 30) | U.S. MD and DO seniors who ranked only this specialty, and how many matched | NRMP, Results and Data: 2025 Main Residency Match, Table 12A | 2025 Main Residency Match | 2026-11-18 | 17 specialties have figures. Each row was checked: matched plus unmatched equals the table's total. |
| Specialties | Ophthalmology, urology and 11 others | | | 2026-11-18 | Not in the NRMP report (searched), so no figures. |
| Specialties | Salary, lifestyle, competitiveness, residency length, summaries, strong programs | None | | | Removed. |
| Archetypes | Suggested schools | None | | | Removed. |
| Hour benchmarks (`src/lib/benchmarks.ts`) | 100, 40, 20, 40 hours; 150 in the schools gap check | UNKNOWN | | | Not school or specialty data; still labelled in the app as common benchmarks, not requirements. Needs a source or a decision. |
| Logger hint | AMCAS 700 characters per experience | UNKNOWN | | | Added in the redesign from general knowledge. Needs checking against current AMCAS instructions. |

## How the school figures were collected

1. Ten research passes, then a second pass for schools that could not be reached, each told to read figures only on the school's own website or a PDF on its own domain, never from MSAR copies, consultants or forums.
2. Each result records the official page, the figure, the entering class and whether it is a mean or median.
3. `scripts/build-schools.mjs` turns the results into `src/lib/schools.ts` and `docs/data/school-sources.csv`, and applies these rules:
   - Figures for a class that entered before 2022, or with no stated year, are recorded in the CSV but not shown.
   - Figures the page labels as accepted applicants rather than the entering class are not shown (Maryland, USUHS, East Carolina, ETSU).
   - Implausible values are dropped (GPA outside 2.5 to 4.0, MCAT outside 490 to 528). None occurred.
   - Manual holds: Baylor's GPA (the post does not say overall or science; its MCAT is shown).
4. Where an entering year was inferred from "Class of 20XX" in a four-year program, the CSV notes say so.

## Known gaps

- AAMC MSAR has per-school figures for every MD school but is subscription only, so it was not used. AAMC FACTS and AACOM publish only national or count data per school.
- These official sites blocked automated reading and need a check in a normal browser: Temple, SUNY Upstate, UAMS, Paul L. Foster (El Paso), UMass Chan (newer classes), Des Moines DO, Michigan State COM, Oklahoma State COM, Rutgers RWJ (brochure), UNMC (brochure), UCSF, University of Washington, Icahn Mount Sinai (PDF).
- Regional campuses (WWAMI sites, Mayo Arizona and Florida, Penn State University Park, MSU Grand Rapids) admit through their parent school and publish no separate figures.
- Possibly closed or renamed: Spartan Health Sciences University (site under construction), American International Medical University (old domain now unrelated), St. James School of Medicine Anguilla (site describes only the St. Vincent campus). Kept in the list with no figures; worth a decision.
