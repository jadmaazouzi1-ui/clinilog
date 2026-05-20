import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteExperience } from "./actions";
import { Experience, ExperienceType } from "@/lib/types";
import ExportAllButton from "./ExportAllButton";
import HoursBreakdown from "./HoursBreakdown";
import AMCASTracker from "./AMCASTracker";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteer",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

const TYPE_BADGE_COLORS: Record<ExperienceType, string> = {
  shadowing: "bg-blue-50 text-blue-700 border-blue-100",
  volunteer: "bg-green-50 text-green-700 border-green-100",
  clinical_work: "bg-indigo-50 text-indigo-700 border-indigo-100",
  research: "bg-violet-50 text-violet-700 border-violet-100",
  other: "bg-gray-100 text-gray-600 border-gray-200",
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

  const totalHours = experienceList.reduce((sum, e) => sum + e.hours, 0);
  const totalHoursDisplay =
    totalHours % 1 === 0 ? totalHours.toString() : totalHours.toFixed(1);

  const stats = [
    {
      label: "Total Hours",
      value: totalHoursDisplay,
      unit: "hrs",
      color: "bg-blue-50 text-blue-700 border-blue-100",
    },
    {
      label: "Experiences Logged",
      value: experienceList.length.toString(),
      unit: "entries",
      color: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "Total Organizations",
      value: new Set(experienceList.map((e) => e.organization)).size.toString(),
      unit: "orgs",
      color: "bg-violet-50 text-violet-700 border-violet-100",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CL</span>
            </div>
            <span className="text-gray-900 font-semibold text-lg">CliniLog</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden sm:block">
              {user.email}
            </span>
            <Link
              href="/schools"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Schools
            </Link>
            <Link
              href="/profile"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Profile
            </Link>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {pageError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            Error: {decodeURIComponent(pageError)}
          </div>
        )}
        {/* Welcome + Add button */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back
              {user.user_metadata?.full_name
                ? `, ${user.user_metadata.full_name.split(" ")[0]}`
                : ""}
              !
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Here&apos;s an overview of your clinical journey so far.
            </p>
          </div>

          {experienceList.length > 0 && (
            <div className="flex items-center gap-3">
              <ExportAllButton experiences={experienceList} />
              <Link
                href="/dashboard/new"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 whitespace-nowrap"
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
              className={`rounded-xl border p-6 ${stat.color}`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-1">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-sm font-medium opacity-70">
                  {stat.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <HoursBreakdown experiences={experienceList} />
        <AMCASTracker experiences={experienceList} />

        {/* Content area */}
        {experienceList.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 rounded-full mb-4">
              <svg
                className="w-7 h-7 text-indigo-600"
                fill="none"
                stroke="currentColor"
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
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No experiences yet
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Start documenting your clinical rotations, volunteer hours, and
              shadowing experiences to build your application story.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
                className="bg-white rounded-2xl border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title + badge */}
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="text-base font-semibold text-gray-900">
                        <Link
                          href={`/dashboard/${experience.id}`}
                          className="hover:text-indigo-600 transition-colors"
                        >
                          {experience.title}
                        </Link>
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${TYPE_BADGE_COLORS[experience.type as ExperienceType]}`}
                      >
                        {TYPE_LABELS[experience.type as ExperienceType]}
                      </span>
                    </div>

                    {/* Org + meta */}
                    <p className="text-sm text-gray-500 mb-3">
                      {experience.organization}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                      <span>
                        {formatDate(experience.start_date)}
                        {experience.end_date
                          ? ` — ${formatDate(experience.end_date)}`
                          : " — Present"}
                      </span>
                      <span className="font-semibold text-gray-600">
                        {experience.hours % 1 === 0
                          ? experience.hours
                          : experience.hours.toFixed(1)}{" "}
                        hrs
                      </span>
                    </div>

                    {/* Description (truncated) */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {experience.description}
                    </p>
                  </div>

                  {/* Edit + Delete buttons */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Link
                      href={`/dashboard/${experience.id}/edit`}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
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
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
