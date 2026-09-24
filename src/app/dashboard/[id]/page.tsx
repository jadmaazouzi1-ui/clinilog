import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteExperience } from "../actions";
import { Experience, ExperienceType, formatHours } from "@/lib/types";
import { formatMedicalDate, formatMedicalTimestamp, formatExperienceId } from "@/lib/formatMedical";
import ExportButton from "./ExportButton";
import AppShell from "@/components/AppShell";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteering",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

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

  // Record number: how many of this user's entries were created no later than
  // this one. RLS scopes the count to their own rows, so the number matches
  // the dashboard's EXP-nnnn for the same entry.
  const { count } = await supabase
    .from("experiences")
    .select("id", { count: "exact", head: true })
    .lte("created_at", exp.created_at);
  const recordNo = formatExperienceId(count ?? 1);

  return (
    <AppShell
      userEmail={user.email ?? ""}
      activePath="/dashboard"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: exp.title }]}
    >
      <main
        className="w-full chart-margin"
        style={{ paddingTop: "var(--sp-3)", paddingRight: "var(--sp-3)", paddingBottom: "var(--sp-3)", maxWidth: 900 }}
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold"
          style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-3)" }}
        >
          <span aria-hidden="true">&larr;</span> Back to dashboard
        </Link>

        <div
          className="tick-corners"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius)",
            padding: "var(--sp-4) var(--sp-3)",
          }}
        >
          {/* Chart header */}
          <div className="flex items-start justify-between gap-4 flex-wrap" style={{ marginBottom: "var(--sp-2)" }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 6 }}>
                <span className="exp-id">{recordNo}</span>
                <span className="cat-tag">{TYPE_LABELS[exp.type as ExperienceType]}</span>
              </div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{exp.title}</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{exp.organization}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <ExportButton experience={exp} />
              <Link
                href={`/dashboard/${exp.id}/edit`}
                className="btn-ghost text-xs font-semibold"
                style={{ padding: "6px var(--sp-2)", textDecoration: "none" }}
              >
                Edit
              </Link>
              <form action={deleteExperience.bind(null, exp.id)}>
                <button
                  type="submit"
                  className="text-xs font-semibold"
                  style={{
                    padding: "6px var(--sp-2)",
                    color: "var(--margin-rule)",
                    background: "var(--bg-card)",
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

          <hr className="tear-line" />

          {/* Chart fields: labelled values on hairlines, not boxed cards */}
          <div
            className="grid grid-cols-2 md:grid-cols-4"
            style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}
          >
            <div className="data-field">
              <span className="data-field-label">Start date</span>
              <span className="data-field-value mono">{formatMedicalDate(exp.start_date)}</span>
            </div>
            <div className="data-field">
              <span className="data-field-label">End date</span>
              <span className="data-field-value mono">
                {exp.end_date ? formatMedicalDate(exp.end_date) : "PRESENT"}
              </span>
            </div>
            <div className="data-field">
              <span className="data-field-label">Total hours</span>
              <span className="data-field-value mono">{formatHours(exp.hours)}</span>
            </div>
            <div className="data-field">
              <span className="data-field-label">Category</span>
              <span className="data-field-value">{TYPE_LABELS[exp.type as ExperienceType]}</span>
            </div>
          </div>

          <hr className="tear-line" />

          <p className="dept-header">Description</p>
          <p
            className="text-sm whitespace-pre-wrap"
            style={{ color: "var(--text-primary)", lineHeight: 1.7, marginBottom: "var(--sp-4)" }}
          >
            {exp.description}
          </p>

          {exp.reflection && (
            <>
              <p className="dept-header">Reflection</p>
              <p
                className="text-sm whitespace-pre-wrap"
                style={{ color: "var(--text-primary)", lineHeight: 1.7, marginBottom: "var(--sp-4)" }}
              >
                {exp.reflection}
              </p>
            </>
          )}

          <hr className="tear-line" />

          <p className="exp-id">
            ENTERED {formatMedicalTimestamp(exp.created_at)}
            {exp.updated_at && exp.updated_at !== exp.created_at
              ? ` / AMENDED ${formatMedicalTimestamp(exp.updated_at)}`
              : ""}
          </p>
        </div>
      </main>
    </AppShell>
  );
}
