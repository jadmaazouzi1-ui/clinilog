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
import { formatMedicalDate, formatMedicalHours, buildRecordNumbers } from "@/lib/formatMedical";

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

  // Stable EXP-0001 style record numbers, oldest entry first.
  const recordNumbers = buildRecordNumbers(experienceList);

  const keyNumbers: { label: string; value: number; decimals: number; padWidth?: number; suffix?: string }[] = [
    { label: "TOTAL HOURS",   value: totalHours,             decimals: 1, padWidth: 3 },
    { label: "ENTRIES LOGGED", value: experienceList.length, decimals: 0, padWidth: 2 },
    { label: "ORGANIZATIONS", value: totalOrgs,              decimals: 0, padWidth: 2 },
    { label: "CATEGORIES COVERED", value: categoriesCovered, decimals: 0, suffix: `/${CATEGORY_COUNT}` },
  ];

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/dashboard">
      {showOnboarding && <OnboardingModal />}

      {/* chart-margin draws the 2px red prescription-pad rule 40px in, and
          indents the content clear of it at md and up. */}
      <main
        className="w-full chart-margin"
        style={{ paddingTop: "var(--sp-3)", paddingRight: "var(--sp-3)", paddingBottom: "var(--sp-3)" }}
      >
        {pageError && (
          <div
            className="text-sm"
            style={{
              marginBottom: "var(--sp-3)",
              padding: "10px var(--sp-2)",
              background: "rgba(193,18,31,0.06)",
              border: "1px solid rgba(193,18,31,0.28)",
              borderLeft: "2px solid var(--margin-rule)",
              borderRadius: "var(--radius)",
              color: "var(--margin-rule)",
            }}
          >
            Error: {decodeURIComponent(pageError)}
          </div>
        )}

        {/* Chart header: patient-style identity block on the left */}
        <div
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          style={{ marginBottom: "var(--sp-3)" }}
        >
          <div>
            <p className="exp-id" style={{ marginBottom: 6 }}>
              {formatMedicalDate(new Date())} / {user.email}
            </p>
            <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              {greeting()}{firstName ? `, ${firstName}` : ""}.
            </h1>
            <p className="text-xs" style={{ color: "var(--text-secondary)", marginTop: 2 }}>
              Here&apos;s an overview of your clinical journey so far.
            </p>
          </div>

          {experienceList.length > 0 && (
            <div className="flex items-center gap-2 sm:flex-shrink-0">
              <ExportAllButton experiences={experienceList} />
              <Link
                href="/dashboard/new"
                className="teal-glow inline-flex items-center justify-center text-sm whitespace-nowrap"
                style={{ padding: "10px var(--sp-2)", textDecoration: "none" }}
              >
                Log new hours
              </Link>
            </div>
          )}
        </div>

        {/* Your Path: organic branch grown from the logged categories */}
        <PathVisualization experiences={experienceList} />

        {/* Your progress: donut + key numbers */}
        <p className="dept-header">Your Progress</p>
        <div
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}
        >
          <HoursBreakdown experiences={experienceList} />
          <div className="grid grid-cols-2 content-start" style={{ gap: "var(--sp-2)" }}>
            {keyNumbers.map((stat) => (
              <div key={stat.label} className="vital-card tick-corners">
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
            className="glass-card block"
            style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-4)", textDecoration: "none" }}
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="exp-id" style={{ marginBottom: 4 }}>{archetypeReady ? "ASSESSMENT ON FILE" : "ASSESSMENT PENDING"}</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                  {archetypeReady ? "Your Pre-Med Archetype is ready" : "Your Pre-Med Archetype is ready to be revealed"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)", marginTop: 2 }}>
                  {archetypeReady ? "View your personalized profile and ideal med schools." : "See your personalized profile based on your logged experiences."}
                </p>
              </div>
              <span
                className="btn-ghost inline-flex items-center text-sm flex-shrink-0"
                style={{ padding: "8px var(--sp-2)" }}
              >
                {archetypeReady ? "View" : "Reveal"}
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
          <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
            <p className="exp-id" style={{ marginBottom: "var(--sp-1)" }}>RECORD EMPTY</p>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)", marginBottom: "var(--sp-1)" }}>
              No experiences yet
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)", maxWidth: 420, marginBottom: "var(--sp-3)" }}>
              Start documenting your clinical rotations, volunteer hours, and
              shadowing experiences to build your application story.
            </p>
            <Link
              href="/dashboard/new"
              className="teal-glow inline-flex items-center text-sm"
              style={{ padding: "10px var(--sp-3)", textDecoration: "none" }}
            >
              Log new hours
            </Link>
          </div>
        ) : (
          <>
          <p className="dept-header" id="recent-experiences">Recent Experiences</p>
          <div style={{ display: "grid", gap: "var(--sp-2)" }}>
            {experienceList.map((experience) => (
              <div key={experience.id} className="glass-card" style={{ padding: "var(--sp-2)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Record number sits above the title, as a chart header */}
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                      <span className="exp-id">{recordNumbers.get(experience.id)}</span>
                      <span className="cat-tag">
                        {TYPE_LABELS[experience.type as ExperienceType]}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>
                      <Link href={`/dashboard/${experience.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {experience.title}
                      </Link>
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-1)" }}>
                      {experience.organization}
                    </p>

                    <div
                      className="flex items-center gap-4 text-xs mono"
                      style={{ color: "var(--text-tertiary)", marginBottom: "var(--sp-1)" }}
                    >
                      <span>
                        {formatDate(experience.start_date)}
                        {experience.end_date ? ` to ${formatDate(experience.end_date)}` : " to PRESENT"}
                      </span>
                      <span className="font-medium" style={{ color: "var(--text-secondary)" }}>
                        {formatMedicalHours(experience.hours)}
                      </span>
                    </div>

                    <p className="text-sm line-clamp-2" style={{ color: "var(--text-secondary)" }}>
                      {experience.description}
                    </p>
                  </div>

                  {/* Edit + Delete */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/dashboard/${experience.id}/edit`}
                      className="btn-ghost text-xs font-semibold"
                      style={{ padding: "6px var(--sp-1)", textDecoration: "none" }}
                      aria-label="Edit experience"
                    >
                      Edit
                    </Link>
                    <form action={deleteExperience.bind(null, experience.id)}>
                      <button
                        type="submit"
                        className="text-xs font-semibold"
                        style={{
                          padding: "6px var(--sp-1)",
                          color: "var(--margin-rule)",
                          background: "#FFFFFF",
                          border: "1px solid rgba(193,18,31,0.3)",
                          borderRadius: "var(--radius)",
                          cursor: "pointer",
                        }}
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
