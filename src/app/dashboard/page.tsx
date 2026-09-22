import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteExperience } from "./actions";
import { Experience, ExperienceType } from "@/lib/types";
import ExportAllButton from "./ExportAllButton";
import HoursBreakdown from "./HoursBreakdown";
import AMCASTracker from "./AMCASTracker";
import PathVisualization from "./PathVisualization";
import AppShell from "@/components/AppShell";
import OnboardingModal from "./OnboardingModal";
import ExperienceInsights from "@/components/ExperienceInsights";
import CountUp from "@/components/CountUp";
import { formatMedicalDate, formatMedicalHours } from "@/lib/formatMedical";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteering",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

const CATEGORY_COUNT = 5;

// Medical-record style dates throughout the dashboard
const formatDate = formatMedicalDate;

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: pageError } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: experiences } = await supabase
    .from("experiences")
    .select("*")
    .order("start_date", { ascending: false });

  const experienceList: Experience[] = experiences ?? [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, archetype_id, graduation_year")
    .eq("id", user.id)
    .single();

  const showOnboarding = !profile?.onboarding_complete;
  const showArchetypeBanner = experienceList.length >= 3;
  const archetypeReady = !!profile?.archetype_id;

  const totalHours = experienceList.reduce((sum, e) => sum + e.hours, 0);
  const totalOrgs = new Set(experienceList.map((e) => e.organization)).size;
  const categoriesCovered = new Set(experienceList.map((e) => e.type)).size;

  const firstName = user.user_metadata?.full_name
    ? String(user.user_metadata.full_name).split(" ")[0]
    : null;

  const keyNumbers: { label: string; value: number; decimals: number; padWidth?: number; suffix?: string }[] = [
    { label: "TOTAL HOURS",   value: totalHours,             decimals: 1, padWidth: 3 },
    { label: "ENTRIES LOGGED", value: experienceList.length, decimals: 0, padWidth: 2 },
    { label: "ORGANIZATIONS", value: totalOrgs,              decimals: 0, padWidth: 2 },
    { label: "CATEGORIES COVERED", value: categoriesCovered, decimals: 0, suffix: `/${CATEGORY_COUNT}` },
  ];

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/dashboard">
      {showOnboarding && <OnboardingModal />}

      <main className="w-full px-6 md:px-8 py-6">
        {pageError && (
          <div
            className="mb-6 text-sm rounded-xl px-4 py-3"
            style={{ background: "rgba(229,72,77,0.08)", border: "1px solid rgba(229,72,77,0.25)", color: "var(--error)" }}
          >
            Error: {decodeURIComponent(pageError)}
          </div>
        )}

        {/* Top bar: greeting + avatar + action */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 700, fontSize: 16 }}
            >
              {(firstName ?? user.email ?? "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                {greeting()}{firstName ? `, ${firstName}` : ""}.
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Here&apos;s an overview of your clinical journey so far.
              </p>
            </div>
          </div>

          {experienceList.length > 0 && (
            <div className="flex items-center gap-3 sm:flex-shrink-0">
              <ExportAllButton experiences={experienceList} />
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 teal-glow px-4 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap flex-1 sm:flex-none justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Log new hours
              </Link>
            </div>
          )}
        </div>

        {/* Your Path — category orb graph */}
        <PathVisualization experiences={experienceList} />

        {/* Your progress: donut + key numbers */}
        <p className="dept-header">Your Progress</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <HoursBreakdown experiences={experienceList} />
          <div className="grid grid-cols-2 gap-4 content-start">
            {keyNumbers.map((stat) => (
              <div key={stat.label} className="vital-card">
                <p className="vital-card-label">{stat.label}</p>
                <span className="vital-card-value">
                  <CountUp to={stat.value} decimals={stat.decimals} padWidth={stat.padWidth} />
                  {stat.suffix && <span className="vital-card-value-sub">{stat.suffix}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Archetype banner — shown once user has 3+ experiences */}
        {showArchetypeBanner && (
          <Link
            href="/archetype"
            className="glass-card block mb-8 px-5 py-4"
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--accent), var(--accent-bright))" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="#FFFFFF" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold mb-0.5" style={{ color: "var(--text-primary)" }}>
                  {archetypeReady ? "Your Pre-Med Archetype is ready" : "Your Pre-Med Archetype is ready to be revealed"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  {archetypeReady ? "View your personalized profile and ideal med schools." : "See your personalized profile based on your logged experiences."}
                </p>
              </div>
              <span
                className="teal-glow inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold flex-shrink-0"
              >
                {archetypeReady ? "View" : "Reveal"}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        )}

        {/* Experience Insights — personalized tips */}
        <ExperienceInsights
          experiences={experienceList}
          gradYear={profile?.graduation_year ?? null}
        />

        <AMCASTracker experiences={experienceList} />

        {/* Content area */}
        {experienceList.length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ background: "var(--bg-soft)" }}
            >
              <svg className="w-7 h-7" fill="none" stroke="var(--accent)" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              No experiences yet
            </h2>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>
              Start documenting your clinical rotations, volunteer hours, and
              shadowing experiences to build your application story.
            </p>
            <Link
              href="/dashboard/new"
              className="teal-glow inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Log new hours
            </Link>
          </div>
        ) : (
          <>
          <p className="dept-header" id="recent-experiences">Recent Experiences</p>
          <div className="space-y-4">
            {experienceList.map((experience) => (
              <div key={experience.id} className="glass-card rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title + tags */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                        <Link href={`/dashboard/${experience.id}`} className="hover:opacity-80 transition-opacity">
                          {experience.title}
                        </Link>
                      </h3>
                      <span className="cat-tag">
                        {TYPE_LABELS[experience.type as ExperienceType]}
                      </span>
                    </div>

                    <p className="text-sm mb-3" style={{ color: "var(--text-secondary)" }}>
                      {experience.organization}
                    </p>
                    <div className="flex items-center gap-4 text-xs mb-4 mono" style={{ color: "var(--text-tertiary)" }}>
                      <span>
                        {formatDate(experience.start_date)}
                        {experience.end_date ? ` → ${formatDate(experience.end_date)}` : " → Present"}
                      </span>
                      <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                        {formatMedicalHours(experience.hours)}
                      </span>
                    </div>

                    <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {experience.description}
                    </p>
                  </div>

                  {/* Edit + Delete buttons */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link
                      href={`/dashboard/${experience.id}/edit`}
                      className="btn-ghost px-3 py-1.5 text-xs font-semibold"
                      aria-label="Edit experience"
                    >
                      Edit
                    </Link>
                    <form action={deleteExperience.bind(null, experience.id)}>
                      <button
                        type="submit"
                        className="px-3 py-1.5 text-xs font-semibold rounded-full"
                        style={{ color: "var(--error)", background: "rgba(229,72,77,0.08)", border: "1px solid transparent" }}
                        aria-label="Delete experience"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </main>
    </AppShell>
  );
}
