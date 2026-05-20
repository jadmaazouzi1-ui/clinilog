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

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-700 font-medium mb-8"
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

        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-6">
            Log a Clinical Experience
          </h1>

          <form action={createExperience} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                placeholder="e.g. Cardiology Shadowing at UCSF"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Organization */}
            <div>
              <label
                htmlFor="organization"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Organization <span className="text-red-500">*</span>
              </label>
              <input
                id="organization"
                name="organization"
                type="text"
                required
                placeholder="e.g. UCSF Medical Center"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Type */}
            <div>
              <label
                htmlFor="experience_type"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Type <span className="text-red-500">*</span>
              </label>
              <select
                id="experience_type"
                name="experience_type"
                required
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
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
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="start_date"
                  name="start_date"
                  type="date"
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <div>
                <label
                  htmlFor="end_date"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  End Date{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="end_date"
                  name="end_date"
                  type="date"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Hours */}
            <div>
              <label
                htmlFor="hours"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Hours <span className="text-red-500">*</span>
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
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                placeholder="What did you do?"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Reflection */}
            <div>
              <label
                htmlFor="reflection"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Reflection{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                id="reflection"
                name="reflection"
                rows={4}
                placeholder="What did you learn? How did this shape your interest in medicine?"
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
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
