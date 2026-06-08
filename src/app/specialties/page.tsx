import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import SpecialtyExplorer from "./SpecialtyExplorer";

export default async function SpecialtiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/specialties">
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#0D0D0D" }}>Specialty Explorer</h1>
          <p className="text-sm" style={{ color: "rgba(13,13,13,0.6)" }}>
            Compare 30 medical specialties across competitiveness, lifestyle, salary, and patient contact.
          </p>
        </div>
        <SpecialtyExplorer />
      </main>
    </AppShell>
  );
}
