import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteExperience } from "./actions";
import { Experience, ExperienceType } from "@/lib/types";
import ExportAllButton from "./ExportAllButton";
import HoursBreakdown from "./HoursBreakdown";
import AMCASTracker from "./AMCASTracker";
import AppShell from "@/components/AppShell";
import OnboardingModal from "./OnboardingModal";
import ExperienceInsights from "@/components/ExperienceInsights";
import CountUp from "@/components/CountUp";
import { formatMedicalDate, formatMedicalHours } from "@/lib/formatMedical";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteer",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

const TYPE_BADGE_STYLES: Record<ExperienceType, React.CSSProperties> = {
  shadowing:    { background: "transparent", color: "rgba(0,0,0,0.5)", border: "2px solid #000000" },
  volunteer:    { background: "transparent", color: "rgba(0,0,0,0.5)", border: "2px solid #000000" },
  clinical_work:{ background: "transparent", color: "rgba(0,0,0,0.5)", border: "2px solid #000000" },
  research:     { background: "transparent", color: "rgba(0,0,0,0.5)", border: "2px solid #000000" },
  other:        { background: "transparent", color: "rgba(0,0,0,0.55)", border: "2px solid #000000" },
};

// Medical-record style dates throughout the dashboard
const formatDate = formatMedicalDate;

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

  const stats: { label: string; value: number; decimals: number; padWidth?: number; prefix?: string }[] = [
    { label: "TOTAL HOURS",   value: totalHours,             decimals: 1, padWidth: 3, prefix: "HRS: " },
    { label: "ENTRIES LOGGED", value: experienceList.length, decimals: 0, padWidth: 3 },
    { label: "ORGANIZATIONS", value: totalOrgs,              decimals: 0, padWidth: 2 },
  ];

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/dashboard">
      {showOnboarding && <OnboardingModal />}

      <main className="w-full px-6 py-8">
        {pageError && (
          <div
            className="mb-6 text-sm rounded-xl px-4 py-3"
            style={{ background: "rgba(0,0,0,0.1)", border: "2px solid #000000", color: "#000000" }}
          >
            Error: {decodeURIComponent(pageError)}
          </div>
        )}
        {/* Welcome + Add button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#000000" }}>
              Welcome back
              {user.user_metadata?.full_name
                ? `, ${user.user_metadata.full_name.split(" ")[0]}`
                : ""}
              !
            </h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(0,0,0,0.6)" }}>
              Here&apos;s an overview of your clinical journey so far.
            </p>
          </div>

          {experienceList.length > 0 && (
            <div className="flex items-center gap-3 sm:flex-shrink-0">
              <ExportAllButton experiences={experienceList} />
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 teal-glow px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors focus:outline-none whitespace-nowrap flex-1 sm:flex-none justify-center"
                style={{ backgroundColor: "#000000", color: "#FFFFFF" }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Experience
              </Link>
            </div>
          )}
        </div>

        {/* Vitals monitor stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="vital-card">
              <p className="vital-card-label">{stat.label}</p>
              <CountUp
                to={stat.value}
                decimals={stat.decimals}
                padWidth={stat.padWidth}
                prefix={stat.prefix}
                className="vital-card-value"
              />
            </div>
          ))}
        </div>

        {/* Archetype banner — shown once user has 3+ experiences */}
        {showArchetypeBanner && (
          <Link
            href="/archetype"
            className="block mb-8 px-5 py-4 transition-colors hover:opacity-90"
            style={{
              background: "#FFFFFF",
              border: "2px solid #000000",
              borderRadius: 1,
            }}
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: "#FFFFFF", border: "2px solid #000000" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="#000000" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold mb-0.5" style={{ color: "#000000" }}>
                  {archetypeReady ? "Your Pre-Med Archetype is ready" : "Your Pre-Med Archetype is ready to be revealed"}
                </p>
                <p className="text-xs" style={{ color: "rgba(0,0,0,0.6)" }}>
                  {archetypeReady ? "View your personalized profile and ideal med schools." : "See your personalized profile based on your logged experiences."}
                </p>
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0"
                style={{ backgroundColor: "#000000", color: "#FFFFFF" }}
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

        <HoursBreakdown experiences={experienceList} />
        <AMCASTracker experiences={experienceList} />

        {/* Content area */}
        {experienceList.length === 0 ? (
          <div
            className="glass-card rounded-2xl p-8 text-center"
          >
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ background: "#FFFFFF" }}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="#000000"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: "#000000" }}>
              No experiences yet
            </h2>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "rgba(0,0,0,0.6)" }}>
              Start documenting your clinical rotations, volunteer hours, and
              shadowing experiences to build your application story.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 teal-glow px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors focus:outline-none"
              style={{ backgroundColor: "#000000", color: "#FFFFFF" }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Experience
            </Link>
          </div>
        ) : (
          <>
          <p className="dept-header">Recent Experiences</p>
          <div className="space-y-4">
            {experienceList.map((experience) => (
              <div
                key={experience.id}
                className="glass-card chart-margin rounded-2xl p-6 pl-7"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title + tags */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-semibold" style={{ color: "#000000" }}>
                        <Link
                          href={`/dashboard/${experience.id}`}
                          className="hover:opacity-80 transition-opacity"
                        >
                          {experience.title}
                        </Link>
                      </h3>
                      <span className="cat-tag">
                        {TYPE_LABELS[experience.type as ExperienceType].toUpperCase()}
                      </span>
                    </div>

                    {/* Org + medical-record-style meta */}
                    <p className="text-sm mb-3" style={{ color: "rgba(0,0,0,0.5)" }}>
                      {experience.organization}
                    </p>
                    <div className="flex items-center gap-4 text-xs mb-4 mono" style={{ color: "rgba(0,0,0,0.4)" }}>
                      <span>
                        {formatDate(experience.start_date)}
                        {experience.end_date
                          ? ` → ${formatDate(experience.end_date)}`
                          : " → PRESENT"}
                      </span>
                      <span className="font-medium" style={{ color: "rgba(0,0,0,0.7)" }}>
                        {formatMedicalHours(experience.hours)}
                      </span>
                    </div>

                    {/* Description (truncated) */}
                    <p className="text-sm line-clamp-2" style={{ color: "rgba(0,0,0,0.7)" }}>
                      {experience.description}
                    </p>
                  </div>

                  {/* Edit + Delete buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      href={`/dashboard/${experience.id}/edit`}
                      className="px-2.5 py-1.5 mono text-[10px] font-bold tracking-widest nav-item-brutal"
                      style={{ color: "#000000", border: "2px solid #000000" }}
                      aria-label="Edit experience"
                    >
                      EDIT
                    </Link>
                    <form action={deleteExperience.bind(null, experience.id)}>
                      <button
                        type="submit"
                        className="px-2.5 py-1.5 mono text-[10px] font-bold tracking-widest nav-item-brutal"
                        style={{ color: "#000000", border: "2px solid #000000", background: "#FFFFFF" }}
                        aria-label="Delete experience"
                      >
                        DELETE
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
