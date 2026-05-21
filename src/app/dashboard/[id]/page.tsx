import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteExperience } from "../actions";
import { Experience, ExperienceType } from "@/lib/types";
import ExportButton from "./ExportButton";
import AppShell from "@/components/AppShell";

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

export default async function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: experience } = await supabase
    .from("experiences")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!experience) {
    redirect("/dashboard");
  }

  const exp = experience as Experience;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/dashboard" breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: exp.title }]}>
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8"
          style={{ color: "#00D4FF" }}
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Dashboard
        </Link>

        <div className="glass-card rounded-2xl p-8">
          {/* Header row: title + action buttons */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-xl font-bold" style={{ color: "#F8FAFC" }}>{exp.title}</h1>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={TYPE_BADGE_STYLES[exp.type as ExperienceType]}
                >
                  {TYPE_LABELS[exp.type as ExperienceType]}
                </span>
              </div>
              <p className="text-sm" style={{ color: "rgba(248,250,252,0.6)" }}>{exp.organization}</p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ExportButton experience={exp} />
              <Link
                href={`/dashboard/${exp.id}/edit`}
                className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "#00D4FF", border: "1px solid rgba(0,212,255,0.35)", background: "rgba(0,212,255,0.08)" }}
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
                Edit
              </Link>
              <form action={deleteExperience.bind(null, exp.id)}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
                  style={{ color: "#FF4757", border: "1px solid rgba(255,71,87,0.35)", background: "rgba(255,71,87,0.08)" }}
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
                  Delete
                </button>
              </form>
            </div>
          </div>

          {/* Meta info */}
          <div
            className="flex items-center gap-6 text-sm mb-8 pb-6"
            style={{ color: "rgba(248,250,252,0.6)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}
          >
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "rgba(248,250,252,0.4)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {formatDate(exp.start_date)}
                {exp.end_date
                  ? ` — ${formatDate(exp.end_date)}`
                  : " — Present"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: "rgba(248,250,252,0.4)" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-semibold" style={{ color: "rgba(248,250,252,0.85)" }}>
                {exp.hours % 1 === 0 ? exp.hours : exp.hours.toFixed(1)} hrs
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2
              className="text-sm font-semibold uppercase tracking-wide mb-3"
              style={{ color: "rgba(248,250,252,0.5)" }}
            >
              Description
            </h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(248,250,252,0.85)" }}>
              {exp.description}
            </p>
          </div>

          {/* Reflection (if present) */}
          {exp.reflection && (
            <div>
              <h2
                className="text-sm font-semibold uppercase tracking-wide mb-3"
                style={{ color: "rgba(248,250,252,0.5)" }}
              >
                Reflection
              </h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "rgba(248,250,252,0.85)" }}>
                {exp.reflection}
              </p>
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
