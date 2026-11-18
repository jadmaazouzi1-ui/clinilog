import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import OutlineView from "./OutlineView";


export default async function OutlinePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { count }] = await Promise.all([
    supabase.from("profiles").select("archetype_id").eq("id", user.id).single(),
    supabase.from("experiences").select("id", { count: "exact", head: true }),
  ]);

  const entries = count ?? 0;
  const hasArchetype = !!profile?.archetype_id;
  const ready = hasArchetype && entries >= 3;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/outline">
      <main className="page">
        <h1 className="text-2xl">
          Personal statement outline
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-3)" }}>
          A structure drawn from your own logged experiences: an opening, two or three themes with the
          evidence behind each, and a close. It will not invent anything you have not logged.
        </p>

        {!ready && (
          <div
            className="card"
            style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-3)" }}
          >
            <p className="meta" style={{ marginBottom: 4 }}>Before you start</p>
            <p className="text-sm" style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
              This tool opens once you have logged three experiences and generated your archetype.
              You have {entries} {entries === 1 ? "entry" : "entries"}
              {hasArchetype ? " and an archetype on file" : " and no archetype yet"}.
            </p>
            <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: "var(--sp-2)" }}>
              {entries < 3 && (
                <Link href="/dashboard/new" className="btn btn-secondary">
                  Log an experience
                </Link>
              )}
              {!hasArchetype && (
                <Link href="/archetype" className="btn btn-secondary">
                  Generate archetype
                </Link>
              )}
            </div>
          </div>
        )}

        <OutlineView ready={ready} />
      </main>
    </AppShell>
  );
}
