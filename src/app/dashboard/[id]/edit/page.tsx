import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateExperience } from "../../actions";
import { Experience } from "@/lib/types";
import AppShell from "@/components/AppShell";
import ReframeableTextarea from "@/components/ReframeableTextarea";

export default async function EditExperiencePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: pageError } = await searchParams;
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
    <AppShell userEmail={user.email ?? ""} activePath="/dashboard" breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: exp.title, href: `/dashboard/${exp.id}` }, { label: "Edit" }]}>
      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href={`/dashboard/${exp.id}`}
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
          <h1 className="text-xl font-bold mb-6" style={{ color: "#F8FAFC" }}>
            Edit Experience
          </h1>

          {pageError && (
            <div
              className="mb-6 text-sm rounded-xl px-4 py-3"
              style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", color: "#FF4757" }}
            >
              Error: {decodeURIComponent(pageError)}
            </div>
          )}

          <form action={updateExperience.bind(null, exp.id)} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Title <span style={{ color: "#FF4757" }}>*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={exp.title}
                placeholder="e.g. Cardiology Shadowing at UCSF"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            {/* Organization */}
            <div>
              <label
                htmlFor="organization"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Organization <span style={{ color: "#FF4757" }}>*</span>
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                defaultValue={exp.organization}
                placeholder="e.g. UCSF Medical Center"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            {/* Type */}
            <div>
              <label
                htmlFor="experience_type"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Type <span style={{ color: "#FF4757" }}>*</span>
              </label>
              <select
                id="experience_type"
                name="experience_type"
                required
                defaultValue={exp.type}
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
              >
                <option value="">Select a type...</option>
                <option value="shadowing">Shadowing</option>
                <option value="volunteer">Volunteer</option>
                <option value="clinical_work">Clinical Work</option>
                <option value="research">Research</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start_date"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "rgba(248,250,252,0.85)" }}
                >
                  Start Date <span style={{ color: "#FF4757" }}>*</span>
                </label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  required
                  defaultValue={exp.start_date}
                  className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="end_date"
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "rgba(248,250,252,0.85)" }}
                >
                  End Date{" "}
                  <span className="font-normal" style={{ color: "rgba(248,250,252,0.4)" }}>(optional)</span>
                </label>
                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  defaultValue={exp.end_date ?? ""}
                  className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
                />
              </div>
            </div>

            {/* Hours */}
            <div>
              <label
                htmlFor="hours"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Hours <span style={{ color: "#FF4757" }}>*</span>
              </label>
              <input
                id="hours"
                name="hours"
                type="number"
                required
                min="0.1"
                max="1000"
                step="any"
                defaultValue={exp.hours}
                placeholder="e.g. 40"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Description <span style={{ color: "#FF4757" }}>*</span>
              </label>
              <ReframeableTextarea
                required
                defaultValue={exp.description}
                placeholder="What did you do?"
              />
            </div>

            {/* Reflection */}
            <div>
              <label
                htmlFor="reflection"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Reflection{" "}
                <span className="font-normal" style={{ color: "rgba(248,250,252,0.4)" }}>(optional)</span>
              </label>
              <textarea
                id="reflection"
                name="reflection"
                rows={4}
                defaultValue={exp.reflection ?? ""}
                placeholder="What did you learn? How did this shape your interest in medicine?"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center gap-2 teal-glow px-6 py-3 rounded-xl font-semibold text-sm transition-colors focus:outline-none"
                style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
              >
                Save Changes
              </button>
              <Link
                href={`/dashboard/${exp.id}`}
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
                style={{ color: "rgba(248,250,252,0.7)", border: "1px solid rgba(248,250,252,0.15)", background: "transparent" }}
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </AppShell>
  );
}
