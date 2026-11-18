import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import RecommendationsView from "./RecommendationsView";
import { Recommendation } from "@/lib/appTypes";


export default async function RecommendationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("recommendations")
    .select("*")
    .order("created_at", { ascending: true });

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/recommendations">
      <main className="page">
        <h1 className="text-2xl">
          Letters of recommendation
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-3)" }}>
          Who is writing, where each letter stands, and which schools it has been assigned to.
        </p>

        <RecommendationsView letters={(data ?? []) as Recommendation[]} />
      </main>
    </AppShell>
  );
}
