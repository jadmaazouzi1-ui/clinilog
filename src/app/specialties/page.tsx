import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import SpecialtyExplorer from "./SpecialtyExplorer";
import { SPECIALTIES } from "@/lib/specialties";

export const metadata = {
  description: "Compare medical specialties by training length, typical pay and lifestyle.",
};

export default async function SpecialtiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/specialties">
      <main className="page">
        <div className="mb-8">
          <h1 className="text-2xl mb-2">Specialties</h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {SPECIALTIES.length} specialties with training length, typical pay, patient contact and a short summary of the work. Figures are broad ranges, not offers.
          </p>
        </div>
        <SpecialtyExplorer />
      </main>
    </AppShell>
  );
}
