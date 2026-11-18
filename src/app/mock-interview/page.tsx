import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import MockInterviewView from "./MockInterviewView";


export default async function MockInterviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { count } = await supabase.from("experiences").select("id", { count: "exact", head: true });
  const entries = count ?? 0;
  const ready = entries >= 1;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/mock-interview">
      <main className="page">
        <h1 className="text-2xl">
          Mock interview questions
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-3)" }}>
          Five traditional questions drawn from your own record, and five MMI scenarios.
          At least one traditional question will probe a gap a real interviewer would notice.
        </p>

        {!ready && (
          <div className="card" style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
            <p className="meta" style={{ marginBottom: 4 }}>Before you start</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Log at least one experience so the questions can be about your own record.
            </p>
            <Link href="/dashboard/new" className="btn btn-secondary" style={{ padding: "6px var(--sp-2)", textDecoration: "none", display: "inline-block", marginTop: "var(--sp-2)" }}>
              Log an experience
            </Link>
          </div>
        )}

        <MockInterviewView ready={ready} />
      </main>
    </AppShell>
  );
}
