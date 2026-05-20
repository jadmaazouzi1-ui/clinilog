"use client";

import { useState } from "react";

interface School {
  name: string;
  state: string;
  avgGpa: number;
  avgMcat: number;
  mission: string;
  inStatePref: "In-State Friendly" | "Out-of-State Friendly" | "Neutral";
}

const SCHOOLS: School[] = [
  // ── Top Research ──────────────────────────────────────────────────────────
  { name: "Harvard Medical School",                          state: "MA", avgGpa: 3.90, avgMcat: 522, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Johns Hopkins School of Medicine",               state: "MD", avgGpa: 3.90, avgMcat: 522, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Stanford School of Medicine",                    state: "CA", avgGpa: 3.80, avgMcat: 520, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Columbia Vagelos P&S",                           state: "NY", avgGpa: 3.85, avgMcat: 521, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Perelman School of Medicine (Penn)",             state: "PA", avgGpa: 3.90, avgMcat: 521, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Yale School of Medicine",                        state: "CT", avgGpa: 3.80, avgMcat: 520, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Washington University School of Medicine",       state: "MO", avgGpa: 3.90, avgMcat: 522, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Duke University School of Medicine",             state: "NC", avgGpa: 3.70, avgMcat: 519, mission: "Research",                    inStatePref: "Neutral" },
  { name: "University of Michigan Medical School",          state: "MI", avgGpa: 3.80, avgMcat: 517, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "Northwestern Feinberg School of Medicine",       state: "IL", avgGpa: 3.90, avgMcat: 520, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Vanderbilt University School of Medicine",       state: "TN", avgGpa: 3.80, avgMcat: 519, mission: "Research",                    inStatePref: "Neutral" },
  { name: "University of Chicago Pritzker",                 state: "IL", avgGpa: 3.90, avgMcat: 521, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Weill Cornell Medicine",                         state: "NY", avgGpa: 3.80, avgMcat: 521, mission: "Research",                    inStatePref: "Neutral" },
  { name: "NYU Grossman School of Medicine",                state: "NY", avgGpa: 3.90, avgMcat: 522, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Icahn School of Medicine at Mount Sinai",        state: "NY", avgGpa: 3.70, avgMcat: 519, mission: "Research",                    inStatePref: "Neutral" },
  { name: "University of Pittsburgh School of Medicine",    state: "PA", avgGpa: 3.70, avgMcat: 516, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "Case Western Reserve School of Medicine",        state: "OH", avgGpa: 3.70, avgMcat: 516, mission: "Research",                    inStatePref: "Neutral" },
  { name: "UC San Diego School of Medicine",                state: "CA", avgGpa: 3.70, avgMcat: 517, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "Emory University School of Medicine",            state: "GA", avgGpa: 3.70, avgMcat: 517, mission: "Research",                    inStatePref: "Neutral" },
  { name: "University of Texas Southwestern",               state: "TX", avgGpa: 3.80, avgMcat: 519, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "Baylor College of Medicine",                     state: "TX", avgGpa: 3.80, avgMcat: 519, mission: "Research",                    inStatePref: "Neutral" },
  { name: "USC Keck School of Medicine",                    state: "CA", avgGpa: 3.70, avgMcat: 515, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "Dartmouth Geisel School of Medicine",            state: "NH", avgGpa: 3.70, avgMcat: 515, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Brown Warren Alpert Medical School",             state: "RI", avgGpa: 3.70, avgMcat: 515, mission: "Research",                    inStatePref: "Neutral" },
  { name: "University of Virginia School of Medicine",      state: "VA", avgGpa: 3.80, avgMcat: 517, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "Ohio State University College of Medicine",      state: "OH", avgGpa: 3.70, avgMcat: 513, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "University of Cincinnati College of Medicine",   state: "OH", avgGpa: 3.60, avgMcat: 511, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "University of Maryland School of Medicine",      state: "MD", avgGpa: 3.70, avgMcat: 513, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "Wake Forest University School of Medicine",      state: "NC", avgGpa: 3.60, avgMcat: 512, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Medical University of South Carolina",           state: "SC", avgGpa: 3.60, avgMcat: 510, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "Stony Brook University School of Medicine",      state: "NY", avgGpa: 3.60, avgMcat: 511, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "Albany Medical College",                         state: "NY", avgGpa: 3.60, avgMcat: 511, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Thomas Jefferson Sidney Kimmel SOM",             state: "PA", avgGpa: 3.60, avgMcat: 511, mission: "Research",                    inStatePref: "Neutral" },
  { name: "Medical College of Wisconsin",                   state: "WI", avgGpa: 3.70, avgMcat: 511, mission: "Research",                    inStatePref: "Neutral" },
  { name: "University of Florida College of Medicine",      state: "FL", avgGpa: 3.70, avgMcat: 513, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "University of Miami Miller School of Medicine",  state: "FL", avgGpa: 3.70, avgMcat: 515, mission: "Research",                    inStatePref: "Neutral" },
  { name: "University of Central Florida COM",              state: "FL", avgGpa: 3.70, avgMcat: 511, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "University of Houston College of Medicine",      state: "TX", avgGpa: 3.60, avgMcat: 508, mission: "Research",                    inStatePref: "In-State Friendly" },
  { name: "University of Texas Houston McGovern SOM",       state: "TX", avgGpa: 3.70, avgMcat: 513, mission: "Research",                    inStatePref: "In-State Friendly" },

  // ── Primary Care ──────────────────────────────────────────────────────────
  { name: "UCSF School of Medicine",                        state: "CA", avgGpa: 3.80, avgMcat: 517, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "Mayo Clinic Alix School of Medicine",            state: "MN", avgGpa: 3.90, avgMcat: 520, mission: "Primary Care",               inStatePref: "Neutral" },
  { name: "University of Washington School of Medicine",    state: "WA", avgGpa: 3.70, avgMcat: 512, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "UNC School of Medicine",                         state: "NC", avgGpa: 3.70, avgMcat: 513, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "UCLA David Geffen School of Medicine",           state: "CA", avgGpa: 3.80, avgMcat: 517, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "University of Vermont Larner COM",               state: "VT", avgGpa: 3.60, avgMcat: 511, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Minnesota Medical School",         state: "MN", avgGpa: 3.70, avgMcat: 511, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "Oregon Health & Science University",             state: "OR", avgGpa: 3.60, avgMcat: 511, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "University of Colorado School of Medicine",      state: "CO", avgGpa: 3.70, avgMcat: 511, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Iowa Carver College of Medicine",  state: "IA", avgGpa: 3.70, avgMcat: 511, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Wisconsin School of Medicine",     state: "WI", avgGpa: 3.70, avgMcat: 511, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "Penn State College of Medicine",                 state: "PA", avgGpa: 3.60, avgMcat: 511, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Nebraska Medical Center",          state: "NE", avgGpa: 3.70, avgMcat: 509, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Kansas School of Medicine",        state: "KS", avgGpa: 3.60, avgMcat: 508, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Oklahoma College of Medicine",     state: "OK", avgGpa: 3.60, avgMcat: 507, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Kentucky College of Medicine",     state: "KY", avgGpa: 3.60, avgMcat: 507, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Louisville School of Medicine",    state: "KY", avgGpa: 3.60, avgMcat: 508, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "Louisiana State University School of Medicine",  state: "LA", avgGpa: 3.60, avgMcat: 509, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Utah School of Medicine",          state: "UT", avgGpa: 3.70, avgMcat: 510, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "Indiana University School of Medicine",          state: "IN", avgGpa: 3.70, avgMcat: 510, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Alabama School of Medicine",       state: "AL", avgGpa: 3.60, avgMcat: 508, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of South Alabama COM",                state: "AL", avgGpa: 3.50, avgMcat: 507, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of South Dakota Sanford SOM",         state: "SD", avgGpa: 3.60, avgMcat: 502, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Tennessee Health Science Center",  state: "TN", avgGpa: 3.60, avgMcat: 509, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Missouri School of Medicine",      state: "MO", avgGpa: 3.60, avgMcat: 507, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Missouri–Kansas City SOM",         state: "MO", avgGpa: 3.60, avgMcat: 505, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Connecticut School of Medicine",   state: "CT", avgGpa: 3.60, avgMcat: 511, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "UMass Chan Medical School",                      state: "MA", avgGpa: 3.70, avgMcat: 514, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "SUNY Upstate Medical University",                state: "NY", avgGpa: 3.60, avgMcat: 509, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Arizona COM – Tucson",             state: "AZ", avgGpa: 3.60, avgMcat: 508, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Arizona COM – Phoenix",            state: "AZ", avgGpa: 3.60, avgMcat: 509, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "Creighton University School of Medicine",        state: "NE", avgGpa: 3.60, avgMcat: 509, mission: "Primary Care",               inStatePref: "Neutral" },
  { name: "Augusta University Medical College of Georgia",  state: "GA", avgGpa: 3.70, avgMcat: 509, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "Northeast Ohio Medical University",              state: "OH", avgGpa: 3.60, avgMcat: 507, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "Michigan State University College of Human Medicine", state: "MI", avgGpa: 3.50, avgMcat: 507, mission: "Primary Care",          inStatePref: "In-State Friendly" },
  { name: "Texas A&M College of Medicine",                  state: "TX", avgGpa: 3.60, avgMcat: 507, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "University of Texas Medical Branch (UTMB)",      state: "TX", avgGpa: 3.60, avgMcat: 507, mission: "Primary Care",               inStatePref: "In-State Friendly" },
  { name: "Uniformed Services University (USUHS)",          state: "MD", avgGpa: 3.60, avgMcat: 510, mission: "Primary Care",               inStatePref: "Neutral" },
  { name: "Tufts University School of Medicine",            state: "MA", avgGpa: 3.70, avgMcat: 514, mission: "Community Health",           inStatePref: "Neutral" },

  // ── Community Health & Underserved ────────────────────────────────────────
  { name: "Morehouse School of Medicine",                   state: "GA", avgGpa: 3.40, avgMcat: 505, mission: "Primary Care & Underserved",  inStatePref: "Neutral" },
  { name: "Howard University College of Medicine",          state: "DC", avgGpa: 3.40, avgMcat: 506, mission: "Primary Care & Underserved",  inStatePref: "Neutral" },
  { name: "Meharry Medical College",                        state: "TN", avgGpa: 3.40, avgMcat: 503, mission: "Primary Care & Underserved",  inStatePref: "Neutral" },
  { name: "Charles R. Drew University of Medicine",         state: "CA", avgGpa: 3.30, avgMcat: 500, mission: "Primary Care & Underserved",  inStatePref: "Neutral" },
  { name: "FIU Herbert Wertheim COM",                       state: "FL", avgGpa: 3.60, avgMcat: 508, mission: "Community Health",           inStatePref: "In-State Friendly" },
  { name: "University of Hawaii John A. Burns SOM",         state: "HI", avgGpa: 3.60, avgMcat: 508, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "East Carolina Brody School of Medicine",         state: "NC", avgGpa: 3.50, avgMcat: 506, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "Wayne State University School of Medicine",      state: "MI", avgGpa: 3.50, avgMcat: 508, mission: "Community Health",           inStatePref: "In-State Friendly" },
  { name: "University of Illinois College of Medicine",     state: "IL", avgGpa: 3.50, avgMcat: 510, mission: "Community Health",           inStatePref: "In-State Friendly" },
  { name: "Texas Tech TTUHSC School of Medicine",           state: "TX", avgGpa: 3.50, avgMcat: 506, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "Paul L. Foster SOM (TTUHSC El Paso)",            state: "TX", avgGpa: 3.40, avgMcat: 505, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "UT Health San Antonio Long SOM",                 state: "TX", avgGpa: 3.60, avgMcat: 508, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "University of Nevada Reno School of Medicine",   state: "NV", avgGpa: 3.50, avgMcat: 506, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "University of Mississippi School of Medicine",   state: "MS", avgGpa: 3.60, avgMcat: 507, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "University of North Dakota SOM",                 state: "ND", avgGpa: 3.60, avgMcat: 504, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "University of Arkansas for Medical Sciences",    state: "AR", avgGpa: 3.60, avgMcat: 506, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "University of South Carolina SOM",               state: "SC", avgGpa: 3.50, avgMcat: 507, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "University of New Mexico School of Medicine",    state: "NM", avgGpa: 3.60, avgMcat: 508, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "Eastern Virginia Medical School",                state: "VA", avgGpa: 3.60, avgMcat: 509, mission: "Primary Care & Underserved",  inStatePref: "Neutral" },
  { name: "Florida State University College of Medicine",   state: "FL", avgGpa: 3.60, avgMcat: 507, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "Florida Atlantic University COM",                state: "FL", avgGpa: 3.60, avgMcat: 507, mission: "Community Health",           inStatePref: "In-State Friendly" },
  { name: "Rutgers New Jersey Medical School",              state: "NJ", avgGpa: 3.60, avgMcat: 512, mission: "Community Health",           inStatePref: "In-State Friendly" },
  { name: "VCU School of Medicine",                         state: "VA", avgGpa: 3.60, avgMcat: 510, mission: "Community Health",           inStatePref: "In-State Friendly" },
  { name: "GWU School of Medicine and Health Sciences",     state: "DC", avgGpa: 3.60, avgMcat: 513, mission: "Community Health",           inStatePref: "Neutral" },
  { name: "Georgetown University School of Medicine",       state: "DC", avgGpa: 3.60, avgMcat: 514, mission: "Community Health",           inStatePref: "Neutral" },
  { name: "Tulane University School of Medicine",           state: "LA", avgGpa: 3.60, avgMcat: 511, mission: "Community Health",           inStatePref: "Neutral" },
  { name: "New York Medical College",                       state: "NY", avgGpa: 3.60, avgMcat: 511, mission: "Community Health",           inStatePref: "Neutral" },
  { name: "Boston University School of Medicine",           state: "MA", avgGpa: 3.60, avgMcat: 514, mission: "Community Health",           inStatePref: "Neutral" },
  { name: "Loyola Stritch School of Medicine",              state: "IL", avgGpa: 3.60, avgMcat: 511, mission: "Community Health",           inStatePref: "Neutral" },
  { name: "Rush Medical College",                           state: "IL", avgGpa: 3.60, avgMcat: 512, mission: "Community Health",           inStatePref: "Neutral" },
  { name: "Saint Louis University School of Medicine",      state: "MO", avgGpa: 3.70, avgMcat: 512, mission: "Community Health",           inStatePref: "Neutral" },
  { name: "Temple University Lewis Katz SOM",               state: "PA", avgGpa: 3.60, avgMcat: 511, mission: "Community Health",           inStatePref: "Neutral" },
  { name: "Drexel University College of Medicine",          state: "PA", avgGpa: 3.60, avgMcat: 511, mission: "Community Health",           inStatePref: "Neutral" },
  { name: "Universidad Central del Caribe SOM",             state: "PR", avgGpa: 3.40, avgMcat: 497, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "University of Puerto Rico School of Medicine",   state: "PR", avgGpa: 3.50, avgMcat: 500, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },
  { name: "Ponce Health Sciences University SOM",           state: "PR", avgGpa: 3.30, avgMcat: 494, mission: "Primary Care & Underserved",  inStatePref: "In-State Friendly" },

  // ── Osteopathic (DO) ──────────────────────────────────────────────────────
  { name: "Kirksville College of Osteopathic Medicine",     state: "MO", avgGpa: 3.50, avgMcat: 504, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Philadelphia College of Osteopathic Medicine",   state: "PA", avgGpa: 3.50, avgMcat: 505, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Michigan State University COM (DO)",             state: "MI", avgGpa: 3.50, avgMcat: 504, mission: "Osteopathic",                inStatePref: "In-State Friendly" },
  { name: "Ohio University Heritage College of Osteopathic Medicine", state: "OH", avgGpa: 3.50, avgMcat: 503, mission: "Osteopathic",      inStatePref: "In-State Friendly" },
  { name: "West Virginia School of Osteopathic Medicine",   state: "WV", avgGpa: 3.40, avgMcat: 500, mission: "Osteopathic",                inStatePref: "In-State Friendly" },
  { name: "Nova Southeastern University COM (DO)",          state: "FL", avgGpa: 3.40, avgMcat: 500, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "A.T. Still University – Arizona",                state: "AZ", avgGpa: 3.40, avgMcat: 501, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Touro University California (DO)",               state: "CA", avgGpa: 3.40, avgMcat: 501, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Lake Erie College of Osteopathic Medicine",      state: "PA", avgGpa: 3.40, avgMcat: 500, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Des Moines University COM (DO)",                 state: "IA", avgGpa: 3.50, avgMcat: 502, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Edward Via College of Osteopathic Medicine",     state: "VA", avgGpa: 3.40, avgMcat: 500, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Pacific Northwest University of Health Sciences", state: "WA", avgGpa: 3.40, avgMcat: 499, mission: "Osteopathic",              inStatePref: "Neutral" },
  { name: "Midwestern University – Chicago COM (DO)",       state: "IL", avgGpa: 3.50, avgMcat: 504, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Midwestern University – Arizona COM (DO)",       state: "AZ", avgGpa: 3.50, avgMcat: 504, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Rocky Vista University COM (DO)",                state: "CO", avgGpa: 3.50, avgMcat: 504, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Kansas City University COM (DO)",                state: "MO", avgGpa: 3.50, avgMcat: 504, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "NYIT College of Osteopathic Medicine",           state: "NY", avgGpa: 3.50, avgMcat: 503, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Rowan University SOM (DO)",                      state: "NJ", avgGpa: 3.50, avgMcat: 504, mission: "Osteopathic",                inStatePref: "In-State Friendly" },
  { name: "University of New England COM (DO)",             state: "ME", avgGpa: 3.40, avgMcat: 501, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Western University of Health Sciences COM (DO)", state: "CA", avgGpa: 3.50, avgMcat: 505, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Touro University Nevada (DO)",                   state: "NV", avgGpa: 3.40, avgMcat: 500, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Alabama College of Osteopathic Medicine",        state: "AL", avgGpa: 3.40, avgMcat: 499, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Arkansas College of Osteopathic Medicine",       state: "AR", avgGpa: 3.40, avgMcat: 499, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Sam Houston State University COM (DO)",          state: "TX", avgGpa: 3.40, avgMcat: 499, mission: "Osteopathic",                inStatePref: "In-State Friendly" },
  { name: "Marian University COM (DO)",                     state: "IN", avgGpa: 3.40, avgMcat: 500, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Idaho College of Osteopathic Medicine",          state: "ID", avgGpa: 3.40, avgMcat: 499, mission: "Osteopathic",                inStatePref: "In-State Friendly" },
  { name: "Lincoln Memorial Univ. – DeBusk COM (DO)",       state: "TN", avgGpa: 3.40, avgMcat: 500, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Burrell College of Osteopathic Medicine",        state: "NM", avgGpa: 3.40, avgMcat: 499, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Liberty University COM (DO)",                    state: "VA", avgGpa: 3.40, avgMcat: 500, mission: "Osteopathic",                inStatePref: "Neutral" },
  { name: "Campbell University COM (DO)",                   state: "NC", avgGpa: 3.50, avgMcat: 503, mission: "Osteopathic",                inStatePref: "Neutral" },

  // ── Caribbean ─────────────────────────────────────────────────────────────
  { name: "St. George's University SOM (Caribbean)",        state: "Intl", avgGpa: 3.30, avgMcat: 497, mission: "Caribbean",               inStatePref: "Out-of-State Friendly" },
  { name: "Ross University School of Medicine (Caribbean)", state: "Intl", avgGpa: 3.20, avgMcat: 495, mission: "Caribbean",               inStatePref: "Out-of-State Friendly" },
  { name: "Saba University School of Medicine (Caribbean)", state: "Intl", avgGpa: 3.20, avgMcat: 492, mission: "Caribbean",               inStatePref: "Out-of-State Friendly" },
  { name: "American University of the Caribbean SOM",       state: "Intl", avgGpa: 3.10, avgMcat: 490, mission: "Caribbean",               inStatePref: "Out-of-State Friendly" },
  { name: "St. Matthew's University School of Medicine",    state: "Intl", avgGpa: 3.10, avgMcat: 490, mission: "Caribbean",               inStatePref: "Out-of-State Friendly" },
];

const ALL_STATES = [...new Set(SCHOOLS.map((s) => s.state))].sort();

type MissionFilter = "Primary Care & Underserved" | "Research" | "Osteopathic" | "Community Health" | "Caribbean";

const MISSION_FILTERS: { label: string; value: MissionFilter; dot: string; active: string; hover: string }[] = [
  { label: "Primary Care & Underserved", value: "Primary Care & Underserved", dot: "bg-teal-500",   active: "bg-teal-600 text-white border-teal-600",    hover: "hover:border-teal-400 hover:text-teal-700" },
  { label: "Research",                   value: "Research",                   dot: "bg-violet-500", active: "bg-violet-600 text-white border-violet-600", hover: "hover:border-violet-400 hover:text-violet-700" },
  { label: "Osteopathic (DO)",           value: "Osteopathic",                dot: "bg-orange-500", active: "bg-orange-600 text-white border-orange-600", hover: "hover:border-orange-400 hover:text-orange-700" },
  { label: "Community Health",           value: "Community Health",           dot: "bg-amber-500",  active: "bg-amber-600 text-white border-amber-600",   hover: "hover:border-amber-400 hover:text-amber-700" },
  { label: "Caribbean",                  value: "Caribbean",                  dot: "bg-sky-500",    active: "bg-sky-600 text-white border-sky-600",       hover: "hover:border-sky-400 hover:text-sky-700" },
];

function getMissionBadgeColor(mission: string): string {
  const m = mission.toLowerCase();
  if (m.includes("caribbean"))                              return "bg-sky-50 text-sky-700 border-sky-100";
  if (m.includes("osteopathic"))                           return "bg-orange-50 text-orange-700 border-orange-100";
  if (m.includes("community health"))                      return "bg-amber-50 text-amber-700 border-amber-100";
  if (m.includes("underserved") && m.includes("primary")) return "bg-teal-50 text-teal-700 border-teal-100";
  if (m.includes("underserved"))                           return "bg-green-50 text-green-700 border-green-100";
  if (m.includes("primary care"))                          return "bg-blue-50 text-blue-700 border-blue-100";
  return "bg-violet-50 text-violet-700 border-violet-100";
}

export default function SchoolList({ userEmail: _userEmail }: { userEmail: string }) {
  const [gpa, setGpa] = useState("");
  const [mcat, setMcat] = useState("");
  const [missionFilters, setMissionFilters] = useState<Set<MissionFilter>>(new Set());
  const [stateFilter, setStateFilter] = useState("");
  const [homeState, setHomeState] = useState("");
  const [inStatePrefFilter, setInStatePrefFilter] = useState<"" | "In-State Friendly" | "Out-of-State Friendly">("");
  const [matchOnly, setMatchOnly] = useState(false);

  const gpaNum = parseFloat(gpa);
  const mcatNum = parseInt(mcat, 10);
  const bothEntered = gpa !== "" && !isNaN(gpaNum) && mcat !== "" && !isNaN(mcatNum);

  function isGoodMatch(school: School): boolean {
    if (!bothEntered) return false;
    return Math.abs(school.avgGpa - gpaNum) <= 0.3 && Math.abs(school.avgMcat - mcatNum) <= 5;
  }

  function toggleMission(value: MissionFilter) {
    setMissionFilters((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  }

  function clearAll() {
    setMissionFilters(new Set());
    setStateFilter("");
    setHomeState("");
    setInStatePrefFilter("");
    setMatchOnly(false);
  }

  const hasActiveFilters = missionFilters.size > 0 || stateFilter !== "" || homeState !== "" || inStatePrefFilter !== "" || matchOnly;

  const filtered = SCHOOLS.filter((s) => {
    const m = s.mission.toLowerCase();
    if (missionFilters.size > 0) {
      const missionMatch = [...missionFilters].some((f) => {
        if (f === "Primary Care & Underserved") return m.includes("underserved") || m.includes("primary care");
        if (f === "Research")         return m.includes("research");
        if (f === "Osteopathic")      return m.includes("osteopathic");
        if (f === "Community Health") return m.includes("community health");
        if (f === "Caribbean")        return m.includes("caribbean");
        return false;
      });
      if (!missionMatch) return false;
    }
    if (stateFilter && s.state !== stateFilter) return false;
    if (inStatePrefFilter && s.inStatePref !== inStatePrefFilter) return false;
    // home state: show only schools in the user's state that are in-state friendly
    if (homeState && !(s.state === homeState && s.inStatePref === "In-State Friendly")) return false;
    if (matchOnly && !isGoodMatch(s)) return false;
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Medical School Explorer</h1>
        <p className="text-gray-500 mt-1 text-sm">
          See how your stats compare to average applicant profiles across {SCHOOLS.length} programs.
        </p>
      </div>

      {/* Stats inputs */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label htmlFor="gpa-input" className="block text-sm font-medium text-gray-700 mb-1.5">GPA</label>
            <input
              id="gpa-input" type="number" min={0} max={4.0} step={0.01} placeholder="e.g. 3.7"
              value={gpa} onChange={(e) => setGpa(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label htmlFor="mcat-input" className="block text-sm font-medium text-gray-700 mb-1.5">MCAT</label>
            <input
              id="mcat-input" type="number" min={472} max={528} step={1} placeholder="e.g. 512"
              value={mcat} onChange={(e) => setMcat(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
        <p className="text-xs text-gray-400">Highlights schools within ±0.3 GPA and ±5 MCAT points of your stats.</p>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label htmlFor="home-state" className="block text-sm font-medium text-gray-700 mb-1.5">
            My Home State <span className="text-gray-400 font-normal">(optional — highlights in-state schools for you)</span>
          </label>
          <select
            id="home-state"
            value={homeState}
            onChange={(e) => setHomeState(e.target.value)}
            className="w-full sm:w-64 px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
          >
            <option value="">Select your state...</option>
            {ALL_STATES.filter((s) => s !== "Intl").map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          {MISSION_FILTERS.map((f) => {
            const active = missionFilters.has(f.value);
            return (
              <button
                key={f.value} type="button" onClick={() => toggleMission(f.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                  active ? f.active : `bg-white text-gray-600 border-gray-200 ${f.hover}`
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? "bg-white" : f.dot}`} />
                {f.label}
              </button>
            );
          })}

          {/* Divider */}
          <span className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

          {/* In-state pref filter buttons */}
          {(["In-State Friendly", "Out-of-State Friendly"] as const).map((pref) => {
            const active = inStatePrefFilter === pref;
            const isIn = pref === "In-State Friendly";
            return (
              <button
                key={pref} type="button"
                onClick={() => setInStatePrefFilter(active ? "" : pref)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors ${
                  active
                    ? isIn ? "bg-green-600 text-white border-green-600" : "bg-blue-600 text-white border-blue-600"
                    : isIn ? "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
                           : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-700"
                }`}
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? "bg-white" : isIn ? "bg-green-500" : "bg-blue-500"}`} />
                {pref}
              </button>
            );
          })}

          {/* Divider */}
          <span className="w-px h-5 bg-gray-200 mx-1 hidden sm:block" />

          <select
            value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              stateFilter
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-700"
            }`}
          >
            <option value="">School State</option>
            {ALL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            type="button" onClick={() => setMatchOnly((v) => !v)}
            disabled={!bothEntered}
            title={!bothEntered ? "Enter GPA and MCAT above first" : undefined}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              matchOnly
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-700"
            }`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${matchOnly ? "bg-white" : "bg-indigo-500"}`} />
            My Stats Match
          </button>

          {hasActiveFilters && (
            <button
              type="button" onClick={clearAll}
              className="ml-auto text-xs text-gray-400 hover:text-gray-700 font-medium px-2 py-1"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4 font-medium">
        Showing <span className="text-gray-900 font-semibold">{filtered.length}</span> of {SCHOOLS.length} schools
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((school) => {
          const match = isGoodMatch(school);
          const isInStateForUser = homeState !== "" && school.state === homeState && school.inStatePref === "In-State Friendly";
          return (
            <div
              key={school.name}
              className={`bg-white rounded-2xl border p-5 transition-all ${
                isInStateForUser
                  ? "border-l-4 border-l-green-500 border-green-200 bg-green-50"
                  : match
                  ? "border-l-4 border-l-indigo-500 border-indigo-200 bg-indigo-50"
                  : "border-gray-200"
              }`}
            >
              <div className="mb-3">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{school.name}</h3>
                  {isInStateForUser && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
                      In-State for You ✓
                    </span>
                  )}
                  {match && !isInStateForUser && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 whitespace-nowrap">
                      Good Match
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                  {school.state}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMissionBadgeColor(school.mission)}`}>
                  {school.mission}
                </span>
                {school.inStatePref !== "Neutral" && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    school.inStatePref === "In-State Friendly"
                      ? "bg-green-50 text-green-700 border-green-100"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                  }`}>
                    {school.inStatePref}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-gray-500 font-medium">Avg GPA</span>
                  <span className="text-sm font-bold text-gray-900">{school.avgGpa.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
                  <span className="text-xs text-gray-500 font-medium">Avg MCAT</span>
                  <span className="text-sm font-bold text-gray-900">{school.avgMcat}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-2 bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <p className="text-gray-500 text-sm">No schools match your current filters.</p>
            <button type="button" onClick={clearAll} className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700">
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
