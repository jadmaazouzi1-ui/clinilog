import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ShareStoryModal from "./ShareStoryModal";

export const metadata = {
  title: "First-gen stories | ClinicLog MD",
  description: "Accounts from first-generation students accepted to medical school, shared with permission.",
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string; error?: string }>;
}) {
  const { submitted, error: pageError } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/stories">

      <main className="w-full px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8"
          style={{ color: "var(--text-primary)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Overview
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              First-gen stories
            </h1>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: "var(--text-secondary)" }}>
              Accounts from first-generation students who were accepted to medical school, shared with their permission. Each one is reviewed before it appears here.
            </p>
          </div>
          <div className="flex-shrink-0">
            <ShareStoryModal />
          </div>
        </div>

        {submitted === "1" && (
          <div
            className="mb-8 text-sm rounded-xl px-4 py-3 flex items-center gap-2"
            style={{ background: "var(--bg-soft)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Thanks for sharing. Your story will appear here after review.
          </div>
        )}

        {pageError && (
          <div
            className="mb-8 text-sm rounded-xl px-4 py-3"
            style={{ background: "var(--bg-soft)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}
          >
            {decodeURIComponent(pageError)}
          </div>
        )}

        {/* Only reviewed, consented submissions are ever shown. None yet. */}
        <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
          <p className="exp-id" style={{ marginBottom: "var(--sp-1)" }}>NO STORIES YET</p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)", marginBottom: "var(--sp-1)" }}>
            Be the first to share one
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)", maxWidth: 480, marginBottom: "var(--sp-3)" }}>
            If you are first-gen and got into medical school, a few sentences about what you did and what you wish you had known can help the next student. Stories are reviewed before they are posted.
          </p>
          <ShareStoryModal />
        </div>
      </main>
    </AppShell>
  );
}
