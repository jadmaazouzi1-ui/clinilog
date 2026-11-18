import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteExperience } from "../actions";
import { Experience, ExperienceType } from "@/lib/types";
import { formatDateRange, formatHoursLabel, formatTimestamp } from "@/lib/format";
import ExportButton from "./ExportButton";
import AppShell from "@/components/AppShell";

const TYPE_LABELS: Record<ExperienceType, string> = {
  shadowing: "Shadowing",
  volunteer: "Volunteering",
  clinical_work: "Clinical Work",
  research: "Research",
  other: "Other",
};

export const metadata = {
  description: "One logged experience and its details.",
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

  const facts: [string, string][] = [
    ["Category", TYPE_LABELS[exp.type as ExperienceType]],
    ["Dates", formatDateRange(exp.start_date, exp.end_date)],
    ["Hours", formatHoursLabel(exp.hours)],
    ["Added", formatTimestamp(exp.created_at)],
  ];
  if (exp.updated_at && exp.updated_at !== exp.created_at) facts.push(["Last edited", formatTimestamp(exp.updated_at)]);

  return (
    <AppShell
      userEmail={user.email ?? ""}
      activePath="/dashboard"
      breadcrumbs={[{ label: "Overview", href: "/dashboard" }, { label: exp.title }]}
    >
      <main className="page">
        <Link href="/dashboard" className="link text-sm">
          Back to Overview
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12" style={{ gap: "var(--sp-4) var(--sp-6)", marginTop: "var(--sp-15)" }}>
          <article className="lg:col-span-8">
            <h1 className="text-3xl">{exp.title}</h1>
            <p className="text-lg" style={{ color: "var(--text-muted)", marginTop: "var(--sp-h)" }}>{exp.organization}</p>

            <h2 className="section-title" style={{ marginTop: "var(--sp-5)" }}>Description</h2>
            {exp.description ? (
              <p className="whitespace-pre-wrap measure" style={{ lineHeight: 1.65 }}>{exp.description}</p>
            ) : (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No description yet.{" "}
                <Link href={`/dashboard/${exp.id}/edit`} className="link">Add one</Link> while the details are fresh.
              </p>
            )}

            {exp.reflection && (
              <>
                <h2 className="section-title" style={{ marginTop: "var(--sp-4)" }}>Reflection</h2>
                <p className="whitespace-pre-wrap measure" style={{ lineHeight: 1.65 }}>{exp.reflection}</p>
              </>
            )}
          </article>

          <aside aria-label="Entry details" className="lg:col-span-4">
            <dl style={{ borderTop: "1px solid var(--border-strong)" }}>
              {facts.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4" style={{ padding: "var(--sp-15) 0", borderBottom: "1px solid var(--border)" }}>
                  <dt className="text-sm" style={{ color: "var(--text-muted)" }}>{label}</dt>
                  <dd className="text-sm font-semibold tnum text-right">{value}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-wrap items-center gap-2" style={{ marginTop: "var(--sp-3)" }}>
              <Link href={`/dashboard/${exp.id}/edit`} className="btn btn-secondary">
                Edit
              </Link>
              <ExportButton experience={exp} />
              <form action={deleteExperience.bind(null, exp.id)} style={{ marginLeft: "auto" }}>
                <button type="submit" className="btn btn-danger" aria-label={`Delete ${exp.title}`}>
                  Delete
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>
    </AppShell>
  );
}
