import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ShareStoryModal from "./ShareStoryModal";

export const metadata = {
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

      <main className="page">
        <Link
          href="/dashboard"
          className="link text-sm inline-block" style={{ marginBottom: "var(--sp-15)" }}>
          Back to Overview
        </Link>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
          <div>
            <h1 className="text-2xl mb-2">
              First-generation stories
            </h1>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: "var(--text-muted)" }}>
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
            style={{ background: "var(--surface-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
          >
            Thanks for sharing. Your story will appear here after review.
          </div>
        )}

        {pageError && (
          <div
            className="mb-8 text-sm rounded-xl px-4 py-3"
            style={{ background: "var(--surface-alt)", border: "1px solid var(--border-strong)", color: "var(--text)" }}
          >
            {decodeURIComponent(pageError)}
          </div>
        )}

        {/* Only reviewed, consented submissions are ever shown. None yet. */}
        <div className="card" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
          <p className="meta" style={{ marginBottom: "var(--sp-1)" }}>No stories yet</p>
          <h2 className="text-lg font-semibold" style={{ color: "var(--text)", marginBottom: "var(--sp-1)" }}>
            Be the first to share one
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)", maxWidth: 480, marginBottom: "var(--sp-3)" }}>
            If you are first-gen and got into medical school, a few sentences about what you did and what you wish you had known can help the next student. Stories are reviewed before they are posted.
          </p>
          <ShareStoryModal />
        </div>
      </main>
    </AppShell>
  );
}
