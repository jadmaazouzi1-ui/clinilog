import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { upsertProfile } from "./actions";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { saved, error: pageError } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

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
            <Link href="/narrative" className="text-sm font-medium" style={{ color: "rgba(248,250,252,0.7)" }}>
              Narrative
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

        {saved === "1" && (
          <div
            className="mb-6 text-sm rounded-xl px-4 py-3"
            style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981" }}
          >
            Profile saved successfully.
          </div>
        )}

        {pageError && (
          <div
            className="mb-6 text-sm rounded-xl px-4 py-3"
            style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", color: "#FF4757" }}
          >
            Error: {decodeURIComponent(pageError)}
          </div>
        )}

        <div className="glass-card rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-6" style={{ color: "#F8FAFC" }}>Your Profile</h1>

          <form action={upsertProfile} className="space-y-6">
            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                defaultValue={profile?.full_name ?? ""}
                placeholder="e.g. Jane Smith"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            {/* Undergraduate School */}
            <div>
              <label
                htmlFor="undergraduate_school"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Undergraduate School
              </label>
              <input
                id="undergraduate_school"
                name="undergraduate_school"
                type="text"
                list="university-list"
                defaultValue={profile?.undergraduate_school ?? ""}
                placeholder="Start typing your school..."
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
              <datalist id="university-list">
                <option value="Arizona State University" />
                <option value="Boston College" />
                <option value="Boston University" />
                <option value="Brandeis University" />
                <option value="Brown University" />
                <option value="California Institute of Technology" />
                <option value="Carnegie Mellon University" />
                <option value="Case Western Reserve University" />
                <option value="City University of New York" />
                <option value="Clemson University" />
                <option value="Columbia University" />
                <option value="Cornell University" />
                <option value="Dartmouth College" />
                <option value="Duke University" />
                <option value="Emory University" />
                <option value="Florida International University" />
                <option value="Florida State University" />
                <option value="fordham University" />
                <option value="George Washington University" />
                <option value="Georgetown University" />
                <option value="Georgia Institute of Technology" />
                <option value="Harvard University" />
                <option value="Howard University" />
                <option value="Indiana University Bloomington" />
                <option value="Johns Hopkins University" />
                <option value="Lehigh University" />
                <option value="Louisiana State University" />
                <option value="Loyola University Chicago" />
                <option value="Massachusetts Institute of Technology" />
                <option value="Miami University" />
                <option value="Michigan State University" />
                <option value="New York University" />
                <option value="North Carolina State University" />
                <option value="Northeastern University" />
                <option value="Northwestern University" />
                <option value="Ohio State University" />
                <option value="Penn State University" />
                <option value="Princeton University" />
                <option value="Purdue University" />
                <option value="Rice University" />
                <option value="Rutgers University" />
                <option value="Stanford University" />
                <option value="Stony Brook University" />
                <option value="Syracuse University" />
                <option value="Temple University" />
                <option value="Tufts University" />
                <option value="Tulane University" />
                <option value="University of Alabama" />
                <option value="University of Arizona" />
                <option value="University of California, Berkeley" />
                <option value="University of California, Davis" />
                <option value="University of California, Irvine" />
                <option value="University of California, Los Angeles" />
                <option value="University of California, Riverside" />
                <option value="University of California, San Diego" />
                <option value="University of California, Santa Barbara" />
                <option value="University of Chicago" />
                <option value="University of Colorado Boulder" />
                <option value="University of Connecticut" />
                <option value="University of Florida" />
                <option value="University of Georgia" />
                <option value="University of Houston" />
                <option value="University of Illinois Chicago" />
                <option value="University of Illinois Urbana-Champaign" />
                <option value="University of Iowa" />
                <option value="University of Kansas" />
                <option value="University of Kentucky" />
                <option value="University of Maryland" />
                <option value="University of Massachusetts Amherst" />
                <option value="University of Miami" />
                <option value="University of Michigan" />
                <option value="University of Minnesota" />
                <option value="University of Missouri" />
                <option value="University of Nebraska" />
                <option value="University of North Carolina at Chapel Hill" />
                <option value="University of Notre Dame" />
                <option value="University of Oregon" />
                <option value="University of Pennsylvania" />
                <option value="University of Pittsburgh" />
                <option value="University of Rochester" />
                <option value="University of South Carolina" />
                <option value="University of Southern California" />
                <option value="University of Tennessee" />
                <option value="University of Texas at Austin" />
                <option value="University of Texas at Dallas" />
                <option value="University of Utah" />
                <option value="University of Virginia" />
                <option value="University of Washington" />
                <option value="University of Wisconsin-Madison" />
                <option value="Vanderbilt University" />
                <option value="Villanova University" />
                <option value="Virginia Tech" />
                <option value="Wake Forest University" />
                <option value="Washington University in St. Louis" />
                <option value="Yale University" />
              </datalist>
            </div>

            {/* Graduation Year */}
            <div>
              <label
                htmlFor="graduation_year"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Graduation Year
              </label>
              <input
                id="graduation_year"
                name="graduation_year"
                type="number"
                min={2000}
                max={2040}
                defaultValue={profile?.graduation_year ?? ""}
                placeholder="e.g. 2026"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            {/* Intended Specialty */}
            <div>
              <label
                htmlFor="intended_specialty"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Intended Specialty
              </label>
              <input
                id="intended_specialty"
                name="intended_specialty"
                type="text"
                defaultValue={profile?.intended_specialty ?? ""}
                placeholder="e.g. Internal Medicine"
                className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 teal-glow px-6 py-3 rounded-xl font-semibold text-sm transition-colors focus:outline-none"
                style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
              >
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
