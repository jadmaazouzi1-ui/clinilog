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
import DashboardSignals from "@/components/DashboardSignals";
import TourOffer from "@/components/tour/TourOffer";
import ApplicationCheck from "@/components/checks/ApplicationCheck";
import { loadChecks } from "@/lib/checks/server";
import { isDismissed } from "@/lib/checks";
import { claimPendingReferral } from "@/lib/referral";
import { formatMedicalDate, formatMedicalHours, buildRecordNumbers } from "@/lib/formatMedical";
import {
  EkgDivider,
  IconClipboard,
  IconPulse,
  TabIndex,
  VitalFlat,
} from "@/components/MedicalIcons";

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

export const metadata = {
  title: "Overview | ClinicLog MD",
  description: "Your logged hours, entries and progress toward common AMCAS benchmarks.",
};

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

  // A referral can only be recorded once the referred account has a session.
  await claimPendingReferral(user.id);

  const { data: experiences } = await supabase
    .from("experiences")
    .select("*")
    .order("start_date", { ascending: false });

  const experienceList: Experience[] = experiences ?? [];

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_complete, archetype_id, graduation_year, amcas_target_date")
    .eq("id", user.id)
    .single();

  const checks = await loadChecks(supabase, user.id, experienceList, profile ?? null);
  const nowForChecks = new Date();
  const panelTopics = checks.visible.map((f) => f.topic).filter((t): t is string => !!t);

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
              background: "var(--danger-tint)",
              border: "1px solid var(--danger)",
              borderLeft: "2px solid var(--danger)",
              borderRadius: "var(--radius)",
              color: "var(--danger)",
            }}
          >
            <span className="flex items-center gap-2 flex-wrap">
              <VitalFlat />
              {decodeURIComponent(pageError)}
            </span>
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
            <h1 className="text-xl font-bold" style={{ color: "var(--text)" }}>
              {greeting()}{firstName ? `, ${firstName}` : ""}.
            </h1>
            <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: 2 }}>
              Your hours, entries and progress toward common benchmarks.
            </p>
          </div>

          {experienceList.length > 0 && (
            <div className="flex items-center gap-3 sm:flex-shrink-0">
              <span data-tour="export-all" className="inline-flex">
                <ExportAllButton experiences={experienceList} />
              </span>
              <Link
                href="/dashboard/new"
                className="teal-glow inline-flex items-center justify-center text-sm whitespace-nowrap"
                style={{ padding: "10px var(--sp-2)", textDecoration: "none" }}
                data-tour="log-new"
              >
                Log new hours
              </Link>
            </div>
          )}
        </div>

        {!showOnboarding && <TourOffer onboardingComplete={!!profile?.onboarding_complete} />}

        <DashboardSignals
          experiences={experienceList}
          amcasTarget={profile?.amcas_target_date ?? null}
          archetype={profile?.archetype_id ?? null}
          gapThreshold={checks.prefs?.gap_days ?? 14}
          bannerHidden={isDismissed("banner:gap", checks.dismissals, nowForChecks)}
          offerReminders={!checks.prefs?.reminders_enabled && !isDismissed("offer:reminders", checks.dismissals, nowForChecks)}
        />

        {/* Your Path: organic branch grown from the logged categories */}
        <div data-tour="path">
          <PathVisualization experiences={experienceList} />
        </div>

        {/* Your progress: donut + key numbers */}
        <p className="dept-header flex items-center gap-2">
          <IconPulse size={13} />
          Your Progress
          <TabIndex n={1} />
        </p>
        <div
          className="grid grid-cols-1 lg:grid-cols-2"
          style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}
        >
          <div data-tour="hours-breakdown">
            <HoursBreakdown experiences={experienceList} />
          </div>
          <div className="grid grid-cols-2 content-start" style={{ gap: "var(--sp-2)" }} data-tour="key-stats">
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

        <EkgDivider rich={totalHours >= 100} />

        {/* Archetype banner: shown once user has 3+ experiences */}
        {showArchetypeBanner && (
          <Link
            href="/archetype"
            className="glass-card block"
            style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-4)", textDecoration: "none" }}
          >
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="exp-id" style={{ marginBottom: 4 }}>{archetypeReady ? "ASSESSMENT ON FILE" : "ASSESSMENT PENDING"}</p>
                <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                  {archetypeReady ? "Your Pre-Med Archetype is ready" : "Your Pre-Med Archetype is ready to be revealed"}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: 2 }}>
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

        {/* Experience Insights: personalized tips */}
        <div data-tour="insights">
          <ExperienceInsights
            experiences={experienceList}
            gradYear={profile?.graduation_year ?? null}
            hideTopics={panelTopics}
          />
        </div>

        <div data-tour="amcas-tracker">
          <AMCASTracker experiences={experienceList} />
        </div>

        <ApplicationCheck findings={checks.visible} />

        <EkgDivider rich={totalHours >= 100} />

        {/* Content area */}
        {experienceList.length === 0 ? (
          <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
            <p className="exp-id" style={{ marginBottom: "var(--sp-1)" }}>RECORD EMPTY</p>
            <h2 className="text-lg font-semibold" style={{ color: "var(--text)", marginBottom: "var(--sp-1)" }}>
              No experiences yet
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)", maxWidth: 420, marginBottom: "var(--sp-3)" }}>
              Start documenting your clinical rotations, volunteer hours, and
              shadowing experiences to build your application story.
            </p>
            <Link
              href="/dashboard/new"
              className="teal-glow inline-flex items-center text-sm"
              style={{ padding: "10px var(--sp-3)", textDecoration: "none" }}
              data-tour="log-new"
            >
              Log new hours
            </Link>
          </div>
        ) : (
          <>
          <p className="dept-header flex items-center gap-2" id="recent-experiences">
            <IconClipboard size={13} />
            Recent Experiences
            <TabIndex n={3} />
          </p>
          <div style={{ display: "grid", gap: "var(--sp-2)" }} data-tour="recent">
            {experienceList.map((experience, index) => (
              <div key={experience.id} className="glass-card tear-tab" style={{ padding: "var(--sp-2)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Record number sits above the title, as a chart header */}
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                      <span className="exp-id">{recordNumbers.get(experience.id)}</span>
                      <span className="cat-tag">
                        {TYPE_LABELS[experience.type as ExperienceType]}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold" style={{ color: "var(--text)" }}>
                      <Link href={`/dashboard/${experience.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        {experience.title}
                      </Link>
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-1)" }}>
                      {experience.organization}
                    </p>

                    <div
                      className="flex items-center gap-4 text-xs mono"
                      style={{ color: "var(--text-subtle)", marginBottom: "var(--sp-1)" }}
                    >
                      <span>
                        {formatDate(experience.start_date)}
                        {experience.end_date ? ` to ${formatDate(experience.end_date)}` : " to PRESENT"}
                      </span>
                      <span className="font-medium" style={{ color: "var(--text-muted)" }}>
                        {formatMedicalHours(experience.hours)}
                      </span>
                    </div>

                    <p className="text-sm line-clamp-2" style={{ color: "var(--text-muted)" }}>
                      {experience.description}
                    </p>
                  </div>

                  {/* Edit + Delete */}
                  <div className="flex items-center gap-2 flex-shrink-0" data-tour={index === 0 ? "entry-actions" : undefined}>
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
                          color: "var(--danger)",
                          background: "var(--surface)",
                          border: "1px solid var(--danger)",
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
