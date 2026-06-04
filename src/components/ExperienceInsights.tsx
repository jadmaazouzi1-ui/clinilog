import { Experience, ExperienceType, formatHours } from "@/lib/types";

interface Tip {
  kind: "positive" | "warn" | "alert";
  title: string;
  body: string;
  icon: React.ReactNode;
}

const ICONS = {
  flask: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3v6.586l-5.707 5.707A1 1 0 004 17h16a1 1 0 00.707-1.707L15 9.586V3M9 3h6" />
    </svg>
  ),
  stethoscope: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  ),
  heart: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  pencil: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  trophy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 4h14l-1 7a6 6 0 01-12 0L5 4zm0 0v0a3 3 0 00-3 3v0a3 3 0 003 3m14-6v0a3 3 0 013 3v0a3 3 0 01-3 3M12 17v3m-4 0h8" />
    </svg>
  ),
  growth: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  spark: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
};

// AMCAS-style soft recommendations
const RECOMMENDATIONS = {
  clinicalWork: 100,
  shadowing: 50,
  volunteer: 40,
  research: 50,
};

export default function ExperienceInsights({ experiences }: { experiences: Experience[] }) {
  const tips = generateTips(experiences);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "#F8FAFC" }}>Experience Insights</h2>
          <p className="text-xs mt-0.5" style={{ color: "rgba(248,250,252,0.5)" }}>
            Personalized tips based on what you&apos;ve logged so far.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tips.map((tip, i) => {
          const palette = paletteFor(tip.kind);
          return (
            <div
              key={i}
              className="glass-card rounded-2xl p-5 flex flex-col"
              style={{ borderColor: palette.border }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 flex-shrink-0"
                style={{ backgroundColor: palette.bg, color: palette.color, border: `1px solid ${palette.border}` }}
              >
                {tip.icon}
              </div>
              <h3
                className="text-sm font-semibold mb-1.5"
                style={{ color: "#F8FAFC" }}
              >
                {tip.title}
              </h3>
              <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(248,250,252,0.65)" }}
              >
                {tip.body}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function paletteFor(kind: Tip["kind"]) {
  if (kind === "positive") {
    return {
      color: "#00D4FF",
      bg: "rgba(0,212,255,0.12)",
      border: "rgba(0,212,255,0.3)",
    };
  }
  if (kind === "warn") {
    return {
      color: "#F59E0B",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.3)",
    };
  }
  return {
    color: "#FF8A8A",
    bg: "rgba(255,138,138,0.12)",
    border: "rgba(255,138,138,0.3)",
  };
}

function generateTips(experiences: Experience[]): Tip[] {
  // Build category map
  const hoursByType: Record<ExperienceType, number> = {
    clinical_work: 0, shadowing: 0, research: 0, volunteer: 0, other: 0,
  };
  for (const e of experiences) {
    hoursByType[e.type as ExperienceType] = (hoursByType[e.type as ExperienceType] ?? 0) + e.hours;
  }

  const missingDescCount = experiences.filter((e) => !(e.description ?? "").trim()).length;
  const totalHours = experiences.reduce((a, e) => a + e.hours, 0);

  // Build candidate tips, in priority order. Use a labeled object so we can mix and match.
  const candidates: Tip[] = [];

  // ── Empty state: no experiences ──────────────────────────────────────────
  if (experiences.length === 0) {
    return [
      { kind: "alert", title: "Start logging your hours", body: "Add your first clinical, shadowing, research, or volunteer experience to start building your application story.", icon: ICONS.growth },
      { kind: "warn",  title: "Aim for 4 categories",     body: "Strong AMCAS applications usually span clinical work, shadowing, research, and volunteering. Variety matters.", icon: ICONS.spark },
      { kind: "warn",  title: "Detail matters",           body: "Each experience is most valuable with a 2-3 sentence description — it powers both your apps and the AI Advisor.", icon: ICONS.pencil },
    ];
  }

  const clinical = formatHours(hoursByType.clinical_work);
  const shadowingH = formatHours(hoursByType.shadowing);
  const research = formatHours(hoursByType.research);
  const volunteer = formatHours(hoursByType.volunteer);

  // ── Critical gaps (alerts) ───────────────────────────────────────────────
  if (hoursByType.clinical_work === 0) {
    candidates.push({
      kind: "alert",
      title: "No clinical hours logged",
      body: "Med schools want to see direct patient interaction. Log scribing, EMT, CNA, or hospital volunteering hours to fill this gap.",
      icon: ICONS.stethoscope,
    });
  } else if (hoursByType.clinical_work < RECOMMENDATIONS.clinicalWork) {
    candidates.push({
      kind: "warn",
      title: "Keep building clinical hours",
      body: `You're at ${clinical} hours — most successful applicants have at least 100. Aim for steady weekly clinical exposure.`,
      icon: ICONS.stethoscope,
    });
  }

  if (hoursByType.shadowing === 0) {
    candidates.push({
      kind: "alert",
      title: "No shadowing logged",
      body: "Shadowing shows you understand what physicians actually do day-to-day. Reach out to attendings or use AAMC's shadowing programs.",
      icon: ICONS.eye,
    });
  } else if (hoursByType.shadowing < RECOMMENDATIONS.shadowing) {
    candidates.push({
      kind: "warn",
      title: "More shadowing recommended",
      body: `You have ${shadowingH} shadowing hours. Aim for 50+ across at least two specialties to give your application breadth.`,
      icon: ICONS.eye,
    });
  }

  if (hoursByType.research === 0) {
    candidates.push({
      kind: "warn",
      title: "No research experience yet",
      body: "Research isn't required everywhere, but it's a big plus — especially for top-tier programs. Even 50 hours in a lab shows curiosity.",
      icon: ICONS.flask,
    });
  } else if (hoursByType.research < RECOMMENDATIONS.research) {
    candidates.push({
      kind: "warn",
      title: "Push research deeper",
      body: `You're at ${research} research hours. Research-heavy schools look for 100+ hours plus a poster or publication — keep going.`,
      icon: ICONS.flask,
    });
  }

  if (hoursByType.volunteer === 0) {
    candidates.push({
      kind: "alert",
      title: "No volunteering logged",
      body: "Service is core to AMCAS — log community work, food bank, tutoring, or non-clinical volunteering hours.",
      icon: ICONS.heart,
    });
  } else if (hoursByType.volunteer < RECOMMENDATIONS.volunteer) {
    candidates.push({
      kind: "warn",
      title: "Add more volunteer hours",
      body: `You're at ${volunteer} volunteer hours. Most schools want 40+, ideally non-clinical service work.`,
      icon: ICONS.heart,
    });
  }

  if (missingDescCount > 0) {
    candidates.push({
      kind: "warn",
      title: `${missingDescCount} experience${missingDescCount === 1 ? "" : "s"} missing a description`,
      body: "Descriptions are required for AMCAS. Use the Reframe with AI button to turn a few rough sentences into polished application language.",
      icon: ICONS.pencil,
    });
  }

  // ── Positive feedback when things look good ──────────────────────────────
  if (hoursByType.clinical_work >= RECOMMENDATIONS.clinicalWork) {
    candidates.push({
      kind: "positive",
      title: "Strong clinical foundation",
      body: `${clinical} clinical hours puts you above the typical applicant benchmark. Keep consistent weekly hours to maintain momentum.`,
      icon: ICONS.check,
    });
  }
  if (hoursByType.shadowing >= RECOMMENDATIONS.shadowing) {
    candidates.push({
      kind: "positive",
      title: "Shadowing target met",
      body: `${shadowingH} shadowing hours hits the AMCAS sweet spot. Make sure you've covered at least two different specialties.`,
      icon: ICONS.eye,
    });
  }
  if (hoursByType.volunteer >= RECOMMENDATIONS.volunteer) {
    candidates.push({
      kind: "positive",
      title: "Volunteering looks healthy",
      body: `${volunteer} volunteer hours shows real commitment to service — exactly what mission-driven schools love to see.`,
      icon: ICONS.heart,
    });
  }
  if (hoursByType.research >= RECOMMENDATIONS.research) {
    candidates.push({
      kind: "positive",
      title: "Research depth is real",
      body: `${research} research hours is competitive for research-heavy programs. Aim for a poster, abstract, or publication next if you haven't yet.`,
      icon: ICONS.flask,
    });
  }

  // ── General balance tip ──────────────────────────────────────────────────
  const categoriesWithHours = (["clinical_work", "shadowing", "research", "volunteer"] as ExperienceType[])
    .filter((c) => hoursByType[c] > 0).length;
  if (experiences.length >= 3 && categoriesWithHours === 4 && missingDescCount === 0) {
    candidates.push({
      kind: "positive",
      title: "Well-rounded profile",
      body: `Activity across all four core categories with ${formatHours(totalHours)} total hours — that's a strong foundation for a Renaissance-style narrative.`,
      icon: ICONS.trophy,
    });
  }

  // Always have at least one tip; if everything is perfect:
  if (candidates.length === 0) {
    candidates.push({
      kind: "positive",
      title: "Looking strong",
      body: "Your experiences are well-distributed with solid hour counts and descriptions. Focus next on depth — leadership and patient-impact stories.",
      icon: ICONS.trophy,
    });
  }

  // Pick up to 3, prioritizing alerts > warns > positives. But intersperse so
  // it's not all bad news — keep at least one positive if any exist.
  const alerts = candidates.filter((t) => t.kind === "alert");
  const warns = candidates.filter((t) => t.kind === "warn");
  const positives = candidates.filter((t) => t.kind === "positive");

  const picked: Tip[] = [];
  // Take up to 2 from alerts + warns combined first
  for (const t of [...alerts, ...warns]) {
    if (picked.length < 2) picked.push(t);
  }
  // Add a positive if available
  if (positives.length > 0 && picked.length < 3) picked.push(positives[0]);
  // Fill remaining slots if needed
  for (const t of [...alerts, ...warns, ...positives]) {
    if (picked.length < 3 && !picked.includes(t)) picked.push(t);
  }

  return picked.slice(0, 3);
}
