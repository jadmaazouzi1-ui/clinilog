import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createExperience } from "../actions";

export default async function NewExperiencePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen dot-grid-bg" style={{ backgroundColor: "#0A1628" }}>
      {/* Top nav */}
      <header
        className="px-6 py-4"
        style={{ backgroundColor: "rgba(10,22,40,0.95)", borderBottom: "1px solid rgba(0,212,255,0.18)" }}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00D4FF" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 12 6 9 9 13 12 7 15 11 18 8 21 12" />
              </svg>
            </div>
            <span className="font-semibold text-lg" style={{ color: "#F8FAFC" }}>CliniLog</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm hidden sm:block" style={{ color: "rgba(248,250,252,0.6)" }}>
              {user.email}
            </span>
            <Link href="/schools" className="text-sm font-medium" style={{ color: "rgba(248,250,252,0.7)" }}>
              Schools
            </Link>
<Link href="/profile" className="text-sm font-medium" style={{ color: "rgba(248,250,252,0.7)" }}>
              Profile
            </Link>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "#00D4FF", border: "1px solid rgba(0,212,255,0.35)", background: "transparent" }}
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
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
          <h1 className="text-xl font-bold mb-6" style={{ color: "#F8FAFC" }}>
            Log a Clinical Experience
          </h1>

          <form action={createExperience} className="space-y-6">
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
            <div className="grid grid-cols-2 gap-4">
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
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="What did you do?"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
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
                placeholder="What did you learn? How did this shape your interest in medicine?"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 teal-glow px-6 py-3 rounded-xl font-semibold text-sm transition-colors focus:outline-none"
                style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
              >
                Save Experience
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
