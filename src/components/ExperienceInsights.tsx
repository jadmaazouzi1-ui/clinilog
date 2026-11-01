import Link from "next/link";
import { Experience, ExperienceType, formatHours } from "@/lib/types";
import { BENCHMARKS } from "@/lib/benchmarks";

type Stage = "freshman" | "sophomore" | "junior" | "senior" | "postgrad";

interface Tip {
  kind: "positive" | "warn" | "alert";
  title: string;
  body: string;
  icon: React.ReactNode;
  /** Same topic ids as lib/checks, so the Application check can claim one. */
  topic?: string;
}

const HOURS_TOPIC: Record<"clinical" | "shadowing" | "research" | "volunteer", string> = {
  clinical: "hours:clinical_work",
  shadowing: "hours:shadowing",
  research: "hours:research",
  volunteer: "hours:volunteer",
};

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
// Same numbers as the tracker and the application check (lib/benchmarks).
const RECOMMENDATIONS = {
  clinicalWork: BENCHMARKS.clinical_work,
  shadowing: BENCHMARKS.shadowing,
  volunteer: BENCHMARKS.volunteer,
  research: BENCHMARKS.research,
};

const STAGE_META: Record<Stage, { label: string; tone: string; color: string; bg: string }> = {
  freshman: { label: "Freshman",        tone: "Building your foundation",       color: "var(--accent)", bg: "var(--accent-soft)" },
  sophomore: { label: "Sophomore",       tone: "Hitting midpoint goals",         color: "var(--accent)", bg: "var(--accent-soft)" },
  junior: { label: "Junior",          tone: "Cycle is approaching",           color: "var(--accent)", bg: "var(--accent-soft)" },
  senior: { label: "Senior",          tone: "Apply-cycle territory",          color: "var(--accent)", bg: "var(--accent-soft)" },
  postgrad: { label: "Post-grad / Gap", tone: "Strengthen your final profile",  color: "var(--accent)", bg: "var(--accent-soft)" },
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
  hideTopics = [],
}: {
  experiences: Experience[];
  gradYear: number | null;
  /** Topics the Application check panel is already showing. */
  hideTopics?: string[];
}) {
  const stage = computeStage(gradYear);

  // ── No grad year → prompt to complete profile ───────────────────────────
  if (stage === null) {
    return (
      <div className="mb-8">
        <div
          className="glass-card rounded-2xl p-6 flex items-start gap-4 flex-wrap"
          style={{ borderColor: "var(--text-primary)" }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" }}
          >
            {ICONS.user}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
              Tell us where you&apos;re at
            </h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
              Add your graduation year on your profile so these insights match your year.
              A first-year and a senior need different next steps.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)", color: "var(--on-accent)" }}
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

  const tips = generateTips(experiences, stage, hideTopics);
  const meta = STAGE_META[stage];

  return (
    <div className="mb-8">
      <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
        <div>
          <p className="dept-header" style={{ marginBottom: 6 }}>Experience Insights</p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Personalized tips based on what you&apos;ve logged so far.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-semibold"
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
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>
                {tip.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
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
  // Separated by weight within the ramp rather than by hue, so the three
  // kinds are distinguishable without introducing a second colour.
  if (kind === "positive") {
    return { color: "var(--green-700)", bg: "var(--green-100)", border: "var(--border-strong)" };
  }
  if (kind === "warn") {
    return { color: "var(--green-900)", bg: "var(--bg-soft)", border: "var(--border-strong)" };
  }
  return { color: "var(--text-secondary)", bg: "var(--bg-soft)", border: "var(--border)" };
}

// ── Tip generation, stage-aware ───────────────────────────────────────────

function generateTips(experiences: Experience[], stage: Stage, hideTopics: string[] = []): Tip[] {
  const hoursByType: Record<ExperienceType, number> = {
    clinical_work: 0, shadowing: 0, research: 0, volunteer: 0, other: 0,
  };
  for (const e of experiences) {
    hoursByType[e.type as ExperienceType] = (hoursByType[e.type as ExperienceType] ?? 0) + e.hours;
  }
  const totalHours = experiences.reduce((a, e) => a + e.hours, 0);
  const missingDescCount = experiences.filter((e) => !(e.description ?? "").trim()).length;

  // Stage-relative expectations: what fraction of the full AMCAS target a
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

  let candidates: Tip[] = [];

  // ── Empty state ──────────────────────────────────────────────────────────
  if (experiences.length === 0) {
    if (stage === "freshman" || stage === "sophomore") {
      return [
        { kind: "positive", title: "You have time", body: "Start with one clinical or shadowing experience this semester. Hours that build slowly over years read better than a late rush.", icon: ICONS.growth },
        { kind: "warn",     title: "Aim for 4 categories",             body: "Most applicants have some clinical work, shadowing, research and volunteering. Try a little of each before choosing where to go deep.", icon: ICONS.spark },
        { kind: "warn",     title: "Detail matters",                   body: "Write 2 or 3 sentences for each entry while you remember it. AMCAS asks for a description of every activity.", icon: ICONS.pencil },
      ];
    }
    return [
      { kind: "alert", title: "No experiences logged yet",     body: "Your application is getting close. Log the clinical, shadowing, research and volunteer hours you have already done, including informal ones.", icon: ICONS.growth },
      { kind: "alert", title: "Time is the constraint now",    body: "Pick the one or two categories you can add to most in the next 3 to 6 months and focus there.", icon: ICONS.calendar },
      { kind: "warn",  title: "Descriptions are required",     body: "AMCAS asks for a description of every activity. Write rough notes first; Reframe with AI can tighten them, and you should check the result.", icon: ICONS.pencil },
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
      freshman:  "No clinical hours yet, which is common for a first-year. Scribing, ED volunteering or CNA work are common places to start.",
      sophomore: "No clinical hours yet. Many applicants start regular shifts around sophomore year; scribing or hospital volunteering are common first roles.",
      junior:    "No clinical hours logged. This is the biggest gap to close before you apply. Schools look for direct patient contact, not only shadowing.",
      senior:    "No clinical hours, and applications are close. Scribing or CNA work is the fastest way to start.",
      postgrad:  "No clinical hours logged. Adding some is the most useful thing you can do before you submit or reapply.",
    },
    onTrackTitle: "Strong clinical foundation",
    onTrackBodyByStage: {
      freshman:  "is well ahead for a first-year. Keep a steady pace.",
      sophomore: "puts you on track for the midpoint goal. Keep weekly hours consistent through the year.",
      junior:    "is on pace for application season. Many applicants report more than 150.",
      senior:    "meets the typical applicant benchmark. Make sure you've also got clinical reflections written for AMCAS.",
      postgrad:  "is in the range many applicants report. What you learned there is worth writing about.",
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
      freshman:  "No shadowing yet, and you have time. Ask one physician this year, even for a single half-day.",
      sophomore: "No shadowing logged. Sophomore year is a good time to start. Seeing at least two specialties is common advice.",
      junior:    "No shadowing hours yet. Start soon; 20 to 30 hours across two specialties is a common minimum.",
      senior:    "No shadowing logged and the cycle is here. Book at least 2 specialties this month if possible.",
      postgrad:  "No shadowing logged. Readers may ask about it, so a few sessions during a gap year would help.",
    },
    onTrackTitle: "Shadowing on track",
    onTrackBodyByStage: {
      freshman:  "puts you ahead for a first-year. Try another specialty next.",
      sophomore: "puts you on pace for the midpoint goal. Aim for 50+ across at least two specialties.",
      junior:    "looks solid going into application season. Make sure you've covered at least two distinct specialties.",
      senior:    "is in the range many applicants report. Make sure each entry names the physician and specialty.",
      postgrad:  "is in the range many applicants report. Show the different specialties in your activities section.",
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
      freshman:  "No research yet, which is fine for a first-year. If you are curious, joining a lab early lets you stay longer.",
      sophomore: "No research logged. If you're targeting research-heavy programs, finding a lab this year matters most.",
      junior:    "No research logged. Research-focused schools tend to expect sustained lab time, so start now if those schools are on your list.",
      senior:    "No research logged. Many schools do not require it, but research-focused ones expect it. A gap-year research job is an option.",
      postgrad:  "A gap year is a good time to add research. Paid research assistant jobs are common.",
    },
    onTrackTitle: "Research on track",
    onTrackBodyByStage: {
      freshman:  "is a lot for a first-year. Staying with one lab counts for more than the hour total.",
      sophomore: "puts you ahead of schedule. Push toward a poster or abstract before junior year.",
      junior:    "is solid. A poster or abstract in the next few months would give the entry something concrete.",
      senior:    "is solid. Name any poster, abstract or paper in the entry.",
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
      freshman:  "No service hours yet. Pick one cause and start small; staying with it matters more than the total.",
      sophomore: "No volunteering logged. Committing to one organization now gives you years of continuity by the time you apply.",
      junior:    "No volunteer hours yet. A weekly non-clinical commitment is one of the easier things to add before applying.",
      senior:    "No volunteer hours and the cycle is here. Even 40 focused hours over a few months still counts.",
      postgrad:  "No volunteer hours logged. A gap year is a good time to start a regular non-clinical commitment.",
    },
    onTrackTitle: "Volunteering looks healthy",
    onTrackBodyByStage: {
      freshman:  "is ahead of schedule. Staying with the same organization shows commitment.",
      sophomore: "puts you on pace. Aim to stay with the same org for 2+ years to show commitment.",
      junior:    "is competitive. Continuity at one or two orgs reads better than scattered hours.",
      senior:    "shows long-term commitment, which service-focused schools often look for.",
      postgrad:  "shows the kind of long-term commitment that strengthens an application narrative.",
    },
  });

  // ── Description gaps ─────────────────────────────────────────────────────
  if (missingDescCount > 0) {
    const urgency = stage === "junior" || stage === "senior" || stage === "postgrad" ? "alert" : "warn";
    const stageSuffix =
      stage === "freshman"  ? "Fill these in now while you remember the details." :
      stage === "sophomore" ? "Build the habit now of writing a description each time you log." :
      stage === "junior"    ? "AMCAS opens soon, so fill these in before then." :
                              "AMCAS asks for a description of every activity. Fill these in first.";
    candidates.push({
      topic: "descriptions",
      kind: urgency,
      title: `${missingDescCount} ${missingDescCount === 1 ? "experience is" : "experiences are"} missing a description`,
      body: `${stageSuffix} Write rough notes first; Reframe with AI can tighten them, and you should check the result.`,
      icon: ICONS.pencil,
    });
  }

  // ── Renaissance / balance positive ───────────────────────────────────────
  const categoriesWithHours = (["clinical_work", "shadowing", "research", "volunteer"] as ExperienceType[])
    .filter((c) => hoursByType[c] > 0).length;
  if (experiences.length >= 3 && categoriesWithHours === 4 && missingDescCount === 0) {
    const stageNote =
      stage === "freshman"  ? "That is broad for a first-year. Over the next years, go deeper in two of these." :
      stage === "sophomore" ? "Good breadth. Over the next year, go deeper in two of these categories." :
      stage === "junior"    ? "All four core categories are covered going into application season." :
                              "All four categories are represented, which gives you several directions for your application.";
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
      title: "Focus on your descriptions",
      body: "Your hours look reasonable for where you are. Spend the next few weeks on your AMCAS descriptions and on picking the experiences that mattered most to you.",
      icon: ICONS.calendar,
    });
  }

  if (candidates.length === 0) {
    candidates.push({
      kind: "positive",
      title: "No gaps found",
      body: "Your entries are spread across categories and have descriptions. Next, look for depth: leadership roles and longer commitments.",
      icon: ICONS.trophy,
    });
  }

  // The Application check panel owns these topics; never say the same thing twice.
  const hidden = new Set(hideTopics);
  candidates = candidates.filter((t) => !t.topic || !hidden.has(t.topic));

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
    out.push({ kind, title, body: zeroBodyByStage[stage], icon, topic: HOURS_TOPIC[cfg.label] });
    return;
  }

  // Below stage-appropriate minimum: warn with stage-flavored body
  if (actual < minForStage) {
    const body =
      stage === "freshman"
        ? `You're at ${formatHours(actual)} hours, a fine start for a first-year. A few hours most weeks adds up.`
        : stage === "sophomore"
        ? `You're at ${formatHours(actual)} hours. Push toward ${formatHours(minForStage)} this year to stay on midpoint pace toward the ${fullTarget}-hour target.`
        : stage === "junior"
        ? `You're at ${formatHours(actual)} hours and applications are close. The common benchmark is ${fullTarget}.`
        : `You're at ${formatHours(actual)} hours and applications are near. More ${cfg.label} hours would help most.`;

    const kind: Tip["kind"] = stage === "freshman" ? "positive" : stage === "sophomore" ? "warn" : "alert";
    const title =
      stage === "freshman"  ? `${cfg.label[0].toUpperCase()}${cfg.label.slice(1)}: a good start`
      : stage === "sophomore" ? `Build ${cfg.label} toward midpoint`
      : stage === "junior"    ? `${cfg.label[0].toUpperCase()}${cfg.label.slice(1)} below the benchmark`
      :                         `${cfg.label[0].toUpperCase()}${cfg.label.slice(1)} hours below target`;
    out.push({ kind, title, body, icon, topic: HOURS_TOPIC[cfg.label] });
    return;
  }

  // Below full benchmark but above stage minimum: still warn gently
  if (actual < fullTarget) {
    const body =
      stage === "freshman"
        ? `${formatHours(actual)} hours is ahead of the usual pace for a first-year.`
        : stage === "sophomore"
        ? `${formatHours(actual)} hours puts you on track for the ${fullTarget}-hour benchmark by senior year.`
        : stage === "junior"
        ? `${formatHours(actual)} hours so far. The common benchmark is ${fullTarget} by the time you apply.`
        : `${formatHours(actual)} hours, close to the ${fullTarget}-hour benchmark. Log any recent hours you have not entered yet.`;
    out.push({
      topic: HOURS_TOPIC[cfg.label],
      kind: stage === "freshman" || stage === "sophomore" ? "positive" : "warn",
      title: stage === "freshman" || stage === "sophomore" ? `${cfg.label[0].toUpperCase()}${cfg.label.slice(1)} on pace` : `${cfg.label[0].toUpperCase()}${cfg.label.slice(1)}: almost there`,
      body,
      icon,
    });
    return;
  }

  // At or above full target: positive
  out.push({
    topic: HOURS_TOPIC[cfg.label],
    kind: "positive",
    title: onTrackTitle,
    body: `${formatHours(actual)} ${cfg.label} hours ${onTrackBodyByStage[stage]}`,
    icon,
  });
}
