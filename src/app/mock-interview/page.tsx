import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import MockInterviewView from "./MockInterviewView";

export const metadata = { title: "Mock Interview | ClinicLog MD" };

export default async function MockInterviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { count } = await supabase.from("experiences").select("id", { count: "exact", head: true });
  const entries = count ?? 0;
  const ready = entries >= 1;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/mock-interview">
      <main
        className="w-full chart-margin"
        style={{ paddingTop: "var(--sp-3)", paddingRight: "var(--sp-3)", paddingBottom: "var(--sp-4)", maxWidth: 820 }}
      >
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          Mock interview questions
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-3)" }}>
          Five traditional questions drawn from your own record, and five MMI scenarios.
          At least one traditional question will probe a gap a real interviewer would notice.
        </p>

        {!ready && (
          <div className="glass-card" style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-3)", borderLeft: "2px solid var(--warning)" }}>
            <p className="exp-id" style={{ marginBottom: 4 }}>PREREQUISITES</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Log at least one experience so the questions can be about your own record.
            </p>
            <Link href="/dashboard/new" className="btn-ghost text-xs font-semibold" style={{ padding: "6px var(--sp-2)", textDecoration: "none", display: "inline-block", marginTop: "var(--sp-2)" }}>
              Log an experience
            </Link>
          </div>
        )}

        <MockInterviewView ready={ready} />
      </main>
    </AppShell>
  );
}
