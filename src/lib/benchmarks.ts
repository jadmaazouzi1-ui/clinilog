import type { ExperienceType } from "./types";

/**
 * Common hour benchmarks many applicants use. Not requirements: schools set
 * no fixed minimums and expectations differ. One source for the tracker,
 * Experience Insights and the application check so they never disagree.
 */
export const BENCHMARKS: Record<Exclude<ExperienceType, "other">, number> = {
  clinical_work: 100,
  shadowing: 40,
  research: 20,
  volunteer: 40,
};

export const BENCHMARK_LABEL: Record<Exclude<ExperienceType, "other">, string> = {
  clinical_work: "clinical",
  shadowing: "shadowing",
  research: "research",
  volunteer: "volunteer",
};
