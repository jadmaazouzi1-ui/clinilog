import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import SpecialtyExplorer from "./SpecialtyExplorer";

export const metadata = {
  title: "Specialties | ClinicLog MD",
  description: "Compare medical specialties by training length, typical pay and lifestyle.",
};

export default async function SpecialtiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/specialties">
      <main className="w-full px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text)" }}>Specialty Explorer</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Compare 30 medical specialties across competitiveness, lifestyle, salary, and patient contact.
          </p>
        </div>
        <SpecialtyExplorer />
      </main>
    </AppShell>
  );
}
