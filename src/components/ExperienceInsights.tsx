import Link from "next/link";
import { Experience, ExperienceType, formatHours } from "@/lib/types";

type Stage = "freshman" | "sophomore" | "junior" | "senior" | "postgrad";

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
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};

// AMCAS-style recommendations (full target, used as "100%" benchmark)
const RECOMMENDATIONS = {
  clinicalWork: 100,
  shadowing: 50,
  volunteer: 40,
  research: 50,
};

const STAGE_META: Record<Stage, { label: string; tone: string; color: string; bg: string }> = {
  freshman:  { label: "Freshman",        tone: "Building your foundation",       color: "#10B981", bg: "rgba(16,185,129,0.08)"  },
  sophomore: { label: "Sophomore",       tone: "Hitting midpoint goals",         color: "#E8A020", bg: "rgba(232,160,32,0.08)"   },
  junior:    { label: "Junior",          tone: "Cycle is approaching",           color: "#F59E0B", bg: "rgba(245,158,11,0.08)"  },
  senior:    { label: "Senior",          tone: "Apply-cycle territory",          color: "#FB923C", bg: "rgba(251,146,60,0.1)"   },
  postgrad:  { label: "Post-grad / Gap", tone: "Strengthen your final profile",  color: "#A78BFA", bg: "rgba(167,139,250,0.08)" },
};

function computeStage(gradYear: number | null | undefined): Stage | null {
  if (!gradYear || gradYear < 2000 || gradYear > 2100) return null;
  const now = new Date();
  const currentYear = now.getFullYear();
  // Most US schools graduate in May/June. After June (month >= 6) treat the
  // user as "starting next academic year".
  const monthOffset = now.getMonth() >= 6 ? 0 : -1;
  // yearsToGrad: how many academic-year boundaries remain.
  const yearsToGrad = gradYear - currentYear - monthOffset;

  if (yearsToGrad >= 4) return "freshman";
  if (yearsToGrad === 3) return "sophomore";
  if (yearsToGrad === 2) return "junior";
  if (yearsToGrad === 1) return "senior";
  return "postgrad";
}

export default function ExperienceInsights({
  experiences,
  gradYear,
}: {
  experiences: Experience[];
  gradYear: number | null;
}) {
  const stage = computeStage(gradYear);

  // ── No grad year → prompt to complete profile ───────────────────────────
  if (stage === null) {
    return (
      <div className="mb-8">
        <div
          className="glass-card rounded-2xl p-6 flex items-start gap-4 flex-wrap"
          style={{ borderColor: "rgba(232,160,32,0.3)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(232,160,32,0.12)", color: "#E8A020", border: "1px solid rgba(232,160,32,0.3)" }}
          >
            {ICONS.user}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold mb-1" style={{ color: "#FFFFFF" }}>
              Tell us where you&apos;re at
            </h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>
              Add your graduation year on your profile so we can tailor insights to where
              you are in your pre-med journey — freshmen get different advice than seniors.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: "#E8A020", color: "#FFFFFF" }}
            >
              Complete your profile
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tips = generateTips(experiences, stage);
  const meta = STAGE_META[stage];

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "#FFFFFF" }}>Experience Insights</h2>
          <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
            Personalized tips based on what you&apos;ve logged so far.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
          style={{
            background: meta.bg,
            color: meta.color,
            border: `1px solid ${meta.color}40`,
          }}
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {meta.label} · {meta.tone}
        </span>
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
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: "#FFFFFF" }}>
                {tip.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
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
    return { color: "#E8A020", bg: "rgba(232,160,32,0.12)", border: "rgba(232,160,32,0.3)" };
  }
  if (kind === "warn") {
    return { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" };
  }
  return { color: "#FF8A8A", bg: "rgba(255,138,138,0.12)", border: "rgba(255,138,138,0.3)" };
}

// ── Tip generation, stage-aware ───────────────────────────────────────────

function generateTips(experiences: Experience[], stage: Stage): Tip[] {
  const hoursByType: Record<ExperienceType, number> = {
    clinical_work: 0, shadowing: 0, research: 0, volunteer: 0, other: 0,
  };
  for (const e of experiences) {
    hoursByType[e.type as ExperienceType] = (hoursByType[e.type as ExperienceType] ?? 0) + e.hours;
  }
  const totalHours = experiences.reduce((a, e) => a + e.hours, 0);
  const missingDescCount = experiences.filter((e) => !(e.description ?? "").trim()).length;

  // Stage-relative expectations — what fraction of the full AMCAS target a
  // student at this stage should reasonably have hit by now.
  const expectedFraction: Record<Stage, number> = {
    freshman: 0.15, sophomore: 0.45, junior: 0.75, senior: 1.0, postgrad: 1.0,
  }[stage] as never;
  // ↑ TS coercion to keep object access typed; we use indexer below instead.
  const frac = (
    stage === "freshman"  ? 0.15 :
    stage === "sophomore" ? 0.45 :
    stage === "junior"    ? 0.75 :
                            1.0
  );
  void expectedFraction;

  const minClinical  = RECOMMENDATIONS.clinicalWork * frac;
  const minShadowing = RECOMMENDATIONS.shadowing    * frac;
  const minVolunteer = RECOMMENDATIONS.volunteer    * frac;
  const minResearch  = RECOMMENDATIONS.research     * frac;

  const candidates: Tip[] = [];

  // ── Empty state ──────────────────────────────────────────────────────────
  if (experiences.length === 0) {
    if (stage === "freshman" || stage === "sophomore") {
      return [
        { kind: "positive", title: "You're early — and that's a gift", body: "You have time on your side. Start with one clinical or shadowing experience this semester to build momentum.", icon: ICONS.growth },
        { kind: "warn",     title: "Aim for 4 categories",             body: "Strong applications usually span clinical, shadowing, research, and volunteering. Begin sampling each.", icon: ICONS.spark },
        { kind: "warn",     title: "Detail matters",                   body: "Always write 2-3 sentences per experience — it powers your AMCAS narrative and the AI Advisor.", icon: ICONS.pencil },
      ];
    }
    return [
      { kind: "alert", title: "No experiences logged yet",     body: "With your application window approaching, log every clinical, shadowing, research, and volunteer hour you've already completed — even informally.", icon: ICONS.growth },
      { kind: "alert", title: "Time is the constraint now",    body: "Identify which categories you can ramp up fastest in the next 3-6 months. Focus there.", icon: ICONS.calendar },
      { kind: "warn",  title: "Descriptions are required",     body: "AMCAS needs a description for every activity. Use Reframe with AI to turn rough notes into polished entries fast.", icon: ICONS.pencil },
    ];
  }

  // ── Clinical ─────────────────────────────────────────────────────────────
  pushHoursTip(candidates, {
    actual: hoursByType.clinical_work,
    minForStage: minClinical,
    fullTarget: RECOMMENDATIONS.clinicalWork,
    stage,
    icon: ICONS.stethoscope,
    label: "clinical",
    zeroBodyByStage: {
      freshman:  "No clinical hours yet — totally normal as a freshman. Try to log at least one experience (scribing, ED volunteer, CNA) this semester.",
      sophomore: "Still no clinical hours. Sophomore year is when most successful applicants start regular shifts — scribing or volunteering at a hospital is the easiest entry.",
      junior:    "No clinical hours logged — this is the biggest gap to close before your cycle. Schools want direct patient interaction, not just shadowing.",
      senior:    "Critical gap: no clinical hours and applications are weeks/months away. Prioritize scribing or CNA work immediately.",
      postgrad:  "No clinical hours logged — this is the single highest-impact thing to address before submitting (or re-applying).",
    },
    onTrackTitle: "Strong clinical foundation",
    onTrackBodyByStage: {
      freshman:  "is well ahead of schedule for a freshman — keep this steady pace and you'll be in great shape.",
      sophomore: "puts you on track for the midpoint goal. Keep weekly hours consistent through the year.",
      junior:    "is on pace going into application season. Aim to push past 150 for a competitive number.",
      senior:    "meets the typical applicant benchmark. Make sure you've also got clinical reflections written for AMCAS.",
      postgrad:  "is competitive. Lean into the depth of those experiences in your personal statement.",
    },
  });

  // ── Shadowing ────────────────────────────────────────────────────────────
  pushHoursTip(candidates, {
    actual: hoursByType.shadowing,
    minForStage: minShadowing,
    fullTarget: RECOMMENDATIONS.shadowing,
    stage,
    icon: ICONS.eye,
    label: "shadowing",
    zeroBodyByStage: {
      freshman:  "No shadowing yet — but you have time. Reach out to one physician this year, even for a single half-day.",
      sophomore: "No shadowing logged. Sophomore year is the sweet spot to start — most schools want at least 2 different specialties.",
      junior:    "No shadowing hours yet — get on this now. Even 20-30 hours across two specialties will be enough by application time.",
      senior:    "No shadowing logged and the cycle is here. Book at least 2 specialties this month if possible.",
      postgrad:  "No shadowing logged — schools will notice. Consider squeezing in a few sessions during your gap year.",
    },
    onTrackTitle: "Shadowing on track",
    onTrackBodyByStage: {
      freshman:  "you're well ahead — most freshmen have zero. Keep diversifying across specialties.",
      sophomore: "puts you on pace for the midpoint goal. Aim for 50+ across at least two specialties.",
      junior:    "looks solid going into application season. Make sure you've covered at least two distinct specialties.",
      senior:    "hits the AMCAS sweet spot. Confirm you've logged the physician names for each entry.",
      postgrad:  "is competitive. Keep evidence of specialty diversity in your activities section.",
    },
  });

  // ── Research ─────────────────────────────────────────────────────────────
  pushHoursTip(candidates, {
    actual: hoursByType.research,
    minForStage: minResearch,
    fullTarget: RECOMMENDATIONS.research,
    stage,
    icon: ICONS.flask,
    label: "research",
    zeroBodyByStage: {
      freshman:  "No research yet — that's fine for a freshman. If you're curious, find a lab now for long-term involvement.",
      sophomore: "No research logged. If you're targeting research-heavy programs, finding a lab this year is the highest-leverage move.",
      junior:    "No research logged. Research-heavy schools want 100+ hours plus output — start now if you can.",
      senior:    "No research logged. Not required everywhere, but it limits your school list. Consider gap-year research if applicable.",
      postgrad:  "Research is the easiest thing to build during a gap year. Look for paid RA positions if academic medicine appeals.",
    },
    onTrackTitle: "Research depth is real",
    onTrackBodyByStage: {
      freshman:  "is exceptional for a freshman. Stay with this lab — long-term involvement beats hour-counting.",
      sophomore: "puts you ahead of schedule. Push toward a poster or abstract before junior year.",
      junior:    "is competitive — focus the next few months on locking in a poster, abstract, or publication.",
      senior:    "is strong. Make sure you've got a publication, poster, or named output to anchor the entry.",
      postgrad:  "is a real asset for research-heavy schools. Keep building if you're still in the lab.",
    },
  });

  // ── Volunteer ────────────────────────────────────────────────────────────
  pushHoursTip(candidates, {
    actual: hoursByType.volunteer,
    minForStage: minVolunteer,
    fullTarget: RECOMMENDATIONS.volunteer,
    stage,
    icon: ICONS.heart,
    label: "volunteer",
    zeroBodyByStage: {
      freshman:  "No service hours yet — pick one cause you care about and start small. Consistency over time matters more than total hours.",
      sophomore: "No volunteering logged. Now's the time to commit to one organization for the long haul — schools love continuity.",
      junior:    "No volunteer hours — this is one of the easier categories to fill before applying. Pick a non-clinical cause and go weekly.",
      senior:    "No volunteer hours and the cycle is here. Even 40 focused hours over a few months still counts.",
      postgrad:  "No volunteer hours logged — this is fixable in a gap year. Pick a non-clinical cause and stick with it.",
    },
    onTrackTitle: "Volunteering looks healthy",
    onTrackBodyByStage: {
      freshman:  "is ahead of schedule. Stick with the same organization — depth beats breadth.",
      sophomore: "puts you on pace. Aim to stay with the same org for 2+ years to show commitment.",
      junior:    "is competitive. Continuity at one or two orgs reads better than scattered hours.",
      senior:    "shows real commitment — exactly what mission-driven schools love to see.",
      postgrad:  "shows the kind of long-term commitment that strengthens an application narrative.",
    },
  });

  // ── Description gaps ─────────────────────────────────────────────────────
  if (missingDescCount > 0) {
    const urgency = stage === "junior" || stage === "senior" || stage === "postgrad" ? "alert" : "warn";
    const stageSuffix =
      stage === "freshman"  ? "You've got time — knock these out now so future-you isn't scrambling." :
      stage === "sophomore" ? "Build the habit now of writing a description each time you log." :
      stage === "junior"    ? "AMCAS opens soon — get these filled before then." :
                              "AMCAS requires descriptions — fill these in immediately.";
    candidates.push({
      kind: urgency,
      title: `${missingDescCount} ${missingDescCount === 1 ? "experience is" : "experiences are"} missing a description`,
      body: `${stageSuffix} Use the Reframe with AI button to turn rough notes into polished AMCAS-ready entries.`,
      icon: ICONS.pencil,
    });
  }

  // ── Renaissance / balance positive ───────────────────────────────────────
  const categoriesWithHours = (["clinical_work", "shadowing", "research", "volunteer"] as ExperienceType[])
    .filter((c) => hoursByType[c] > 0).length;
  if (experiences.length >= 3 && categoriesWithHours === 4 && missingDescCount === 0) {
    const stageNote =
      stage === "freshman"  ? "Few freshmen have this breadth — keep this pace and you'll be untouchable by junior year." :
      stage === "sophomore" ? "Strong sophomore breadth — focus the next year on going deeper in two of these categories." :
      stage === "junior"    ? "All four core categories covered going into application season — that's a Renaissance profile." :
                              "All four categories represented — a well-rounded foundation for your final application narrative.";
    candidates.push({
      kind: "positive",
      title: "Well-rounded profile",
      body: `${formatHours(totalHours)} total hours across all four core categories. ${stageNote}`,
      icon: ICONS.trophy,
    });
  }

  // ── Senior urgency tip if nothing else fired alerts ──────────────────────
  if ((stage === "senior" || stage === "postgrad") && candidates.filter((t) => t.kind === "alert").length === 0) {
    candidates.push({
      kind: "warn",
      title: "Polish, don't pile on",
      body: "Your hours look reasonable for where you are. Focus the next few weeks on writing strong AMCAS descriptions and identifying your most-impactful stories.",
      icon: ICONS.calendar,
    });
  }

  if (candidates.length === 0) {
    candidates.push({
      kind: "positive",
      title: "Looking strong",
      body: "Your experiences are well-distributed with solid descriptions. Focus next on depth — leadership and patient-impact stories.",
      icon: ICONS.trophy,
    });
  }

  // Priority: alerts > warns > positives. Always include ≥1 positive if any.
  const alerts = candidates.filter((t) => t.kind === "alert");
  const warns = candidates.filter((t) => t.kind === "warn");
  const positives = candidates.filter((t) => t.kind === "positive");

  const picked: Tip[] = [];
  for (const t of [...alerts, ...warns]) {
    if (picked.length < 2) picked.push(t);
  }
  if (positives.length > 0 && picked.length < 3) picked.push(positives[0]);
  for (const t of [...alerts, ...warns, ...positives]) {
    if (picked.length < 3 && !picked.includes(t)) picked.push(t);
  }

  return picked.slice(0, 3);
}

interface HoursTipConfig {
  actual: number;
  minForStage: number;
  fullTarget: number;
  stage: Stage;
  icon: React.ReactNode;
  label: "clinical" | "shadowing" | "research" | "volunteer";
  zeroBodyByStage: Record<Stage, string>;
  onTrackTitle: string;
  onTrackBodyByStage: Record<Stage, string>;
}

function pushHoursTip(out: Tip[], cfg: HoursTipConfig) {
  const { actual, minForStage, fullTarget, stage, icon, zeroBodyByStage, onTrackTitle, onTrackBodyByStage } = cfg;

  // No hours: urgency depends on stage
  if (actual === 0) {
    const kind: Tip["kind"] = stage === "freshman" ? "warn" : "alert";
    const title =
      stage === "freshman"  ? "Plenty of time to start"
      : stage === "sophomore" ? `No ${cfg.label} hours yet`
      : stage === "junior"    ? `Critical gap: no ${cfg.label} hours`
      : stage === "senior"    ? `Urgent: no ${cfg.label} hours`
      : `No ${cfg.label} hours logged`;
    out.push({ kind, title, body: zeroBodyByStage[stage], icon });
    return;
  }

  // Below stage-appropriate minimum: warn with stage-flavored body
  if (actual < minForStage) {
    const body =
      stage === "freshman"
        ? `You're at ${formatHours(actual)} hours — a great start for a freshman. Keep building steady weekly exposure.`
        : stage === "sophomore"
        ? `You're at ${formatHours(actual)} hours. Push toward ${formatHours(minForStage)} this year to stay on midpoint pace toward the ${fullTarget}-hour target.`
        : stage === "junior"
        ? `You're at ${formatHours(actual)} hours — application cycle is around the corner. Aim to hit ${fullTarget}+ in the next few months.`
        : `You're at ${formatHours(actual)} hours. Applications are imminent — prioritize logging more ${cfg.label} hours immediately.`;

    const kind: Tip["kind"] = stage === "freshman" ? "positive" : stage === "sophomore" ? "warn" : "alert";
    const title =
      stage === "freshman"  ? `${cfg.label[0].toUpperCase()}${cfg.label.slice(1)} — ahead of schedule`
      : stage === "sophomore" ? `Build ${cfg.label} toward midpoint`
      : stage === "junior"    ? `${cfg.label[0].toUpperCase()}${cfg.label.slice(1)} below target — close the gap`
      :                         `${cfg.label[0].toUpperCase()}${cfg.label.slice(1)} hours below target`;
    out.push({ kind, title, body, icon });
    return;
  }

  // Below full benchmark but above stage minimum: still warn gently
  if (actual < fullTarget) {
    const body =
      stage === "freshman"
        ? `${formatHours(actual)} hours is excellent for a freshman — you're ahead of the typical pace.`
        : stage === "sophomore"
        ? `${formatHours(actual)} hours — on track for the ${fullTarget}-hour target by senior year.`
        : stage === "junior"
        ? `${formatHours(actual)} hours — keep pushing to hit ${fullTarget}+ before applications.`
        : `${formatHours(actual)} hours — close to the ${fullTarget} target. Pad it slightly before submitting if you can.`;
    out.push({
      kind: stage === "freshman" || stage === "sophomore" ? "positive" : "warn",
      title: stage === "freshman" || stage === "sophomore" ? `${cfg.label[0].toUpperCase()}${cfg.label.slice(1)} on pace` : `${cfg.label[0].toUpperCase()}${cfg.label.slice(1)} — almost there`,
      body,
      icon,
    });
    return;
  }

  // At or above full target: positive
  out.push({
    kind: "positive",
    title: onTrackTitle,
    body: `${formatHours(actual)} ${cfg.label} hours ${onTrackBodyByStage[stage]}`,
    icon,
  });
}
