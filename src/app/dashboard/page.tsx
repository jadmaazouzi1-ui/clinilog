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
import DashboardSignals from "@/components/DashboardSignals";
import TourOffer from "@/components/tour/TourOffer";
import ApplicationCheck from "@/components/checks/ApplicationCheck";
import { loadChecks } from "@/lib/checks/server";
import { isDismissed } from "@/lib/checks";
import { claimPendingReferral } from "@/lib/referral";
import { formatDate, formatDateRange, formatHoursLabel } from "@/lib/format";
import { formatHours } from "@/lib/types";
import { Notice } from "@/components/ui";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteering",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

const CATEGORY_COUNT = 5;

export const metadata = {
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

  const lastEntry = experienceList.reduce<string | null>(
    (latest, e) => (!latest || e.created_at > latest ? e.created_at : latest),
    null,
  );

  const keyNumbers: { label: string; value: string; unit?: string }[] = [
    { label: "Total hours", value: formatHours(totalHours) },
    { label: "Entries", value: String(experienceList.length) },
    { label: "Organizations", value: String(totalOrgs) },
    { label: "Categories", value: String(categoriesCovered), unit: `of ${CATEGORY_COUNT}` },
  ];

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/dashboard">
      {showOnboarding && <OnboardingModal />}

      <main className="page">
        {pageError && (
          <div style={{ marginBottom: "var(--sp-3)" }}>
            <Notice tone="danger">{decodeURIComponent(pageError)}</Notice>
          </div>
        )}

        <header
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          style={{ marginBottom: "var(--sp-4)" }}
        >
          <div>
            <h1 className="text-2xl">Overview</h1>
            <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--sp-h)" }}>
              {experienceList.length === 0
                ? "Nothing logged yet. Your first entry starts the totals below."
                : `${formatHoursLabel(totalHours)} across ${experienceList.length} ${experienceList.length === 1 ? "entry" : "entries"}.${lastEntry ? ` Last added ${formatDate(lastEntry)}.` : ""}`}
            </p>
          </div>

          {experienceList.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span data-tour="export-all" className="inline-flex">
                <ExportAllButton experiences={experienceList} />
              </span>
              <Link href="/dashboard/new" className="btn btn-primary" data-tour="log-new">
                Log hours
              </Link>
            </div>
          )}
        </header>

        {!showOnboarding && <TourOffer onboardingComplete={!!profile?.onboarding_complete} />}

        <DashboardSignals
          experiences={experienceList}
          amcasTarget={profile?.amcas_target_date ?? null}
          archetype={profile?.archetype_id ?? null}
          gapThreshold={checks.prefs?.gap_days ?? 14}
          bannerHidden={isDismissed("banner:gap", checks.dismissals, nowForChecks)}
          offerReminders={!checks.prefs?.reminders_enabled && !isDismissed("offer:reminders", checks.dismissals, nowForChecks)}
        />

        {/* The four numbers people check first, as one ruled line rather
            than four boxes. */}
        <dl
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ borderTop: "1px solid var(--border-strong)", borderBottom: "1px solid var(--border)", marginBottom: "var(--sp-4)" }}
          data-tour="key-stats"
        >
          {keyNumbers.map((stat) => (
            <div key={stat.label} style={{ padding: "var(--sp-2) var(--sp-2) var(--sp-2) 0" }}>
              <dt className="stat-label">{stat.label}</dt>
              <dd className="stat-value">
                {stat.value}
                {stat.unit && <span className="stat-unit">{stat.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>

        <div data-tour="path" style={{ marginBottom: "var(--sp-4)" }}>
          <PathVisualization experiences={experienceList} />
        </div>

        {/* Benchmarks on the wide side, the category split beside them. */}
        <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: "var(--sp-3)", marginBottom: "var(--sp-4)" }}>
          <div className="lg:col-span-7" data-tour="amcas-tracker">
            <AMCASTracker experiences={experienceList} />
          </div>
          <div className="lg:col-span-5" data-tour="hours-breakdown">
            <HoursBreakdown experiences={experienceList} />
          </div>
        </div>

        <div data-tour="insights">
          <ExperienceInsights
            experiences={experienceList}
            gradYear={profile?.graduation_year ?? null}
            hideTopics={panelTopics}
          />
        </div>

        <ApplicationCheck findings={checks.visible} />

        {showArchetypeBanner && (
          <p className="text-sm" style={{ margin: "var(--sp-3) 0 0", color: "var(--text-muted)" }}>
            {archetypeReady ? "Your archetype read is saved. " : "You have enough entries for an archetype read. "}
            <Link href="/archetype" className="link">
              {archetypeReady ? "Open your archetype" : "Read your archetype"}
            </Link>
          </p>
        )}

        <hr className="rule" />

        {experienceList.length === 0 ? (
          <div className="empty">
            <p className="empty-title">No entries yet</p>
            <p className="empty-body">
              Add one experience you already have hours for: a shift, a shadowing day, a lab
              semester. Dates, hours and the organization are enough to start. You can write the
              description later.
            </p>
            <Link href="/dashboard/new" className="btn btn-primary" data-tour="log-new">
              Log hours
            </Link>
          </div>
        ) : (
          <section aria-labelledby="recent-experiences">
            <div className="flex items-baseline justify-between gap-3" style={{ marginBottom: "var(--sp-15)" }}>
              <h2 className="section-title" id="recent-experiences" style={{ margin: 0 }}>
                Entries
              </h2>
              <p className="meta">Newest first</p>
            </div>
            <ul data-tour="recent" style={{ borderTop: "1px solid var(--border-strong)" }}>
              {experienceList.map((experience, index) => (
                <li
                  key={experience.id}
                  className="grid gap-x-6 gap-y-1 md:grid-cols-[minmax(0,1fr)_auto_auto]"
                  style={{ padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)" }}
                >
                  <div className="min-w-0">
                    <h3 className="text-base">
                      <Link href={`/dashboard/${experience.id}`} className="hover:underline" style={{ color: "var(--text)" }}>
                        {experience.title}
                      </Link>
                    </h3>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {experience.organization}
                      <span aria-hidden="true"> · </span>
                      {TYPE_LABELS[experience.type as ExperienceType]}
                    </p>
                    <p className="meta" style={{ marginTop: 2 }}>
                      {formatDateRange(experience.start_date, experience.end_date)}
                    </p>
                  </div>

                  <p className="text-base font-semibold tnum md:text-right" style={{ minWidth: "6ch" }}>
                    {formatHoursLabel(experience.hours)}
                  </p>

                  <div className="flex items-start gap-1" data-tour={index === 0 ? "entry-actions" : undefined}>
                    <Link
                      href={`/dashboard/${experience.id}/edit`}
                      className="btn btn-sm btn-secondary"
                      aria-label={`Edit ${experience.title}`}
                    >
                      Edit
                    </Link>
                    <form action={deleteExperience.bind(null, experience.id)}>
                      <button type="submit" className="btn btn-sm btn-danger" aria-label={`Delete ${experience.title}`}>
                        Delete
                      </button>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </AppShell>
  );
}
