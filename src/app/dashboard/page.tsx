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
import AppStrengthScore from "@/components/AppStrengthScore";
import { scoreExperience, scoreColor, averageScore } from "@/lib/scoreExperience";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteer",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

const TYPE_BADGE_STYLES: Record<ExperienceType, React.CSSProperties> = {
  shadowing:    { background: "rgba(0,212,255,0.1)",    color: "#00D4FF",              border: "1px solid rgba(0,212,255,0.3)" },
  volunteer:    { background: "rgba(16,185,129,0.1)",   color: "#10B981",              border: "1px solid rgba(16,185,129,0.3)" },
  clinical_work:{ background: "rgba(99,102,241,0.1)",   color: "#818CF8",              border: "1px solid rgba(99,102,241,0.3)" },
  research:     { background: "rgba(139,92,246,0.1)",   color: "#A78BFA",              border: "1px solid rgba(139,92,246,0.3)" },
  other:        { background: "rgba(248,250,252,0.08)", color: "rgba(248,250,252,0.6)",border: "1px solid rgba(248,250,252,0.15)" },
};

function formatDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${months[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`;
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
    .select("onboarding_complete")
    .eq("id", user.id)
    .single();

  const showOnboarding = !profile?.onboarding_complete;

  const totalHours = experienceList.reduce((sum, e) => sum + e.hours, 0);
  const totalHoursDisplay =
    totalHours % 1 === 0 ? totalHours.toString() : totalHours.toFixed(1);

  const stats = [
    { label: "Total Hours",         value: totalHoursDisplay,                                                          unit: "hrs"     },
    { label: "Experiences Logged",  value: experienceList.length.toString(),                                           unit: "entries" },
    { label: "Total Organizations", value: new Set(experienceList.map((e) => e.organization)).size.toString(),         unit: "orgs"    },
  ];

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/dashboard">
      {showOnboarding && <OnboardingModal />}

      <main className="max-w-5xl mx-auto px-6 py-10">
        {pageError && (
          <div
            className="mb-6 text-sm rounded-xl px-4 py-3"
            style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", color: "#FF4757" }}
          >
            Error: {decodeURIComponent(pageError)}
          </div>
        )}
        {/* Welcome + Add button */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#F8FAFC" }}>
              Welcome back
              {user.user_metadata?.full_name
                ? `, ${user.user_metadata.full_name.split(" ")[0]}`
                : ""}
              !
            </h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(248,250,252,0.6)" }}>
              Here&apos;s an overview of your clinical journey so far.
            </p>
          </div>

          {experienceList.length > 0 && (
            <div className="flex items-center gap-3 sm:flex-shrink-0">
              <ExportAllButton experiences={experienceList} />
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 teal-glow px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors focus:outline-none whitespace-nowrap flex-1 sm:flex-none justify-center"
                style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
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

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl p-6"
              style={{ backgroundColor: "#1E2A3A", border: "1px solid rgba(0,212,255,0.14)" }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-wide mb-1"
                style={{ color: "rgba(248,250,252,0.6)" }}
              >
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold" style={{ color: "#00D4FF" }}>{stat.value}</span>
                <span className="text-sm font-medium" style={{ color: "rgba(248,250,252,0.6)" }}>
                  {stat.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Application Strength Score */}
        <div className="mb-8">
          <AppStrengthScore
            score={averageScore(experienceList)}
            experienceCount={experienceList.length}
          />
        </div>

        <HoursBreakdown experiences={experienceList} />
        <AMCASTracker experiences={experienceList} />

        {/* Content area */}
        {experienceList.length === 0 ? (
          <div
            className="glass-card rounded-2xl p-8 text-center"
          >
            <div
              className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
              style={{ background: "rgba(0,212,255,0.1)" }}
            >
              <svg
                className="w-7 h-7"
                fill="none"
                stroke="#00D4FF"
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
            <h2 className="text-lg font-semibold mb-2" style={{ color: "#F8FAFC" }}>
              No experiences yet
            </h2>
            <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "rgba(248,250,252,0.6)" }}>
              Start documenting your clinical rotations, volunteer hours, and
              shadowing experiences to build your application story.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 teal-glow px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors focus:outline-none"
              style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
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
          <div className="space-y-4">
            {experienceList.map((experience) => (
              <div
                key={experience.id}
                className="glass-card rounded-2xl p-6"
              >
                {(() => {
                  const { total: expScore } = scoreExperience(experience);
                  const { color, bg, border } = scoreColor(expScore);
                  return (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title + badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-base font-semibold" style={{ color: "#F8FAFC" }}>
                        <Link
                          href={`/dashboard/${experience.id}`}
                          className="hover:opacity-80 transition-opacity"
                        >
                          {experience.title}
                        </Link>
                      </h3>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={TYPE_BADGE_STYLES[experience.type as ExperienceType]}
                      >
                        {TYPE_LABELS[experience.type as ExperienceType]}
                      </span>
                      {/* Value Score badge */}
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold"
                        style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}
                        title="Experience Value Score — based on hours, category, description depth, leadership, and patient contact"
                      >
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {expScore}
                      </span>
                    </div>

                    {/* Org + meta */}
                    <p className="text-sm mb-3" style={{ color: "rgba(248,250,252,0.5)" }}>
                      {experience.organization}
                    </p>
                    <div className="flex items-center gap-4 text-xs mb-4" style={{ color: "rgba(248,250,252,0.4)" }}>
                      <span>
                        {formatDate(experience.start_date)}
                        {experience.end_date
                          ? ` — ${formatDate(experience.end_date)}`
                          : " — Present"}
                      </span>
                      <span className="font-semibold" style={{ color: "rgba(248,250,252,0.7)" }}>
                        {experience.hours % 1 === 0
                          ? experience.hours
                          : experience.hours.toFixed(1)}{" "}
                        hrs
                      </span>
                    </div>

                    {/* Description (truncated) */}
                    <p className="text-sm line-clamp-2" style={{ color: "rgba(248,250,252,0.7)" }}>
                      {experience.description}
                    </p>
                  </div>

                  {/* Edit + Delete buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      href={`/dashboard/${experience.id}/edit`}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: "rgba(248,250,252,0.4)" }}
                      aria-label="Edit experience"
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </Link>
                    <form action={deleteExperience.bind(null, experience.id)}>
                      <button
                        type="submit"
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "rgba(248,250,252,0.4)" }}
                        aria-label="Delete experience"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
                  );
                })()}
              </div>
            ))}
          </div>
        )}
      </main>
    </AppShell>
  );
}
