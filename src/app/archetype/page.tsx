// Pre-Med Archetype page — runs the analysis or displays stored result.
//
// SQL to run in Supabase before this works:
//
// ALTER TABLE profiles
//   ADD COLUMN IF NOT EXISTS archetype_id TEXT,
//   ADD COLUMN IF NOT EXISTS archetype_data JSONB,
//   ADD COLUMN IF NOT EXISTS archetype_generated_at TIMESTAMPTZ;

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ArchetypeView from "./ArchetypeView";
import { ArchetypeAnalysis } from "@/lib/archetypes";

export default async function ArchetypePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: profile }, { count: experienceCount }] = await Promise.all([
    supabase.from("profiles").select("archetype_id, archetype_data, archetype_generated_at").eq("id", user.id).single(),
    supabase.from("experiences").select("*", { count: "exact", head: true }),
  ]);

  const storedAnalysis = (profile?.archetype_data ?? null) as ArchetypeAnalysis | null;
  const count = experienceCount ?? 0;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/archetype">
      <main className="max-w-3xl mx-auto px-6 py-10">
        <ArchetypeView
          initialAnalysis={storedAnalysis}
          experienceCount={count}
          generatedAt={profile?.archetype_generated_at ?? null}
        />
      </main>
    </AppShell>
  );
}
