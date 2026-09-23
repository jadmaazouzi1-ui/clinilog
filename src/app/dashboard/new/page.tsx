import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createExperience } from "../actions";
import AppShell from "@/components/AppShell";
import ReframeableTextarea from "@/components/ReframeableTextarea";
import { IconClipboard, TabIndex } from "@/components/MedicalIcons";
import { formatMedicalDate } from "@/lib/formatMedical";

const TYPES = [
  ["shadowing", "Shadowing"],
  ["volunteer", "Volunteering"],
  ["clinical_work", "Clinical Work"],
  ["research", "Research"],
  ["other", "Other"],
];

export default async function NewExperiencePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { count } = await supabase
    .from("experiences")
    .select("id", { count: "exact", head: true });

  // The record number this entry will receive once saved.
  const nextRecord = `EXP-${String((count ?? 0) + 1).padStart(4, "0")}`;

  return (
    <AppShell
      userEmail={user.email ?? ""}
      activePath="/dashboard"
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Log Experience" }]}
    >
      <main className="w-full" style={{ padding: "var(--sp-3)", maxWidth: 820 }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold"
          style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-3)" }}
        >
          <span aria-hidden="true">&larr;</span> Back to dashboard
        </Link>

        {/* Form head: title left, record number right, as on a chart sheet */}
        <div
          className="flex flex-wrap items-start justify-between gap-3"
          style={{ marginBottom: "var(--sp-1)" }}
        >
          <div className="flex items-start gap-3">
            <span className="rx-mark" aria-hidden="true">&#8478;</span>
            <div>
              <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                Experience intake
              </h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Complete every required field. Hours count toward your AMCAS totals.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="exp-id">WILL FILE AS {nextRecord}</span>
          </div>
        </div>

        <div
          className="tick-corners"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius)",
            padding: "var(--sp-4) var(--sp-3)",
          }}
        >
          <form action={createExperience}>
            <p className="dept-header flex items-center gap-2">
              <IconClipboard size={13} />
              Section A / Placement
              <TabIndex n={1} />
            </p>

            <div style={{ marginBottom: "var(--sp-3)" }}>
              <label htmlFor="title" className="field-label">
                TTL <span style={{ color: "var(--margin-rule)" }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="Title, e.g. Cardiology shadowing at UCSF"
                className="field-input"
              />
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2"
              style={{ gap: "var(--sp-3)", marginBottom: "var(--sp-3)" }}
            >
              <div>
                <label htmlFor="organization" className="field-label">
                  ORG <span style={{ color: "var(--margin-rule)" }}>*</span>
                </label>
                <input
                  id="organization"
                  name="organization"
                  type="text"
                  required
                  placeholder="Organization, e.g. UCSF Medical Center"
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="experience_type" className="field-label">
                  CAT <span style={{ color: "var(--margin-rule)" }}>*</span>
                </label>
                <select id="experience_type" name="experience_type" required className="field-input">
                  <option value="">Category</option>
                  {TYPES.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="tear-line" />

            <p className="dept-header flex items-center gap-2">
              Section B / Dates and hours
              <TabIndex n={2} />
            </p>

            <div
              className="grid grid-cols-1 sm:grid-cols-3"
              style={{ gap: "var(--sp-3)", marginBottom: "var(--sp-3)" }}
            >
              <div>
                <label htmlFor="start_date" className="field-label">
                  DOS START <span style={{ color: "var(--margin-rule)" }}>*</span>
                </label>
                <input id="start_date" name="start_date" type="date" required className="field-input" />
              </div>
              <div>
                <label htmlFor="end_date" className="field-label">
                  DOS END <span style={{ color: "var(--text-tertiary)" }}>(optional)</span>
                </label>
                <input id="end_date" name="end_date" type="date" className="field-input" />
              </div>
              <div>
                <label htmlFor="hours" className="field-label">
                  HRS <span style={{ color: "var(--margin-rule)" }}>*</span>
                </label>
                <input
                  id="hours"
                  name="hours"
                  type="number"
                  required
                  min="0.1"
                  max="1000"
                  step="any"
                  placeholder="Hours, e.g. 40"
                  className="field-input mono"
                />
              </div>
            </div>

            <hr className="tear-line" />

            <p className="dept-header flex items-center gap-2">
              Section C / Narrative
              <TabIndex n={3} />
            </p>

            <div style={{ marginBottom: "var(--sp-3)" }}>
              <label htmlFor="description" className="field-label">
                DESC <span style={{ color: "var(--text-tertiary)" }}>(optional)</span>
              </label>
              <ReframeableTextarea placeholder="Description: what did you do?" />
            </div>

            <div style={{ marginBottom: "var(--sp-4)" }}>
              <label htmlFor="reflection" className="field-label">
                REFL <span style={{ color: "var(--text-tertiary)" }}>(optional)</span>
              </label>
              <textarea
                id="reflection"
                name="reflection"
                rows={4}
                placeholder="Reflection: what did you learn? How did this shape your interest in medicine?"
                className="field-input resize-none"
              />
            </div>

            <div className="signature-line" style={{ maxWidth: 320 }}>
              <span className="signature-caption">
                Logged by {user.email} on {formatMedicalDate(new Date())}
              </span>
            </div>

            <hr className="tear-line" />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="teal-glow text-sm"
                style={{ padding: "10px var(--sp-3)" }}
              >
                Save to record
              </button>
              <Link
                href="/dashboard"
                className="btn-ghost text-sm"
                style={{ padding: "10px var(--sp-3)", textDecoration: "none" }}
              >
                Cancel
              </Link>
              <span className="exp-id" style={{ marginLeft: "auto" }}>
                <span style={{ color: "var(--margin-rule)" }}>*</span> REQUIRED
              </span>
            </div>
          </form>
        </div>
      </main>
    </AppShell>
  );
}
