import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SchoolList from "./SchoolList";

export default async function SchoolsPage() {
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

      <main className="max-w-5xl mx-auto px-6 py-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8"
          style={{ color: "#00D4FF" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
        <SchoolList userEmail={user.email ?? ""} />
      </main>
    </div>
  );
}
