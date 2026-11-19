import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import SpecialtyExplorer from "./SpecialtyExplorer";
import DataNote from "@/components/DataNote";
import { SPECIALTIES } from "@/lib/specialties";
import { NOTES, SPECIALTY_MATCH, reviewedLabel } from "@/lib/data-sources";

export const metadata = {
  description: "How U.S. MD and DO seniors fared in the 2025 residency match, by specialty, from NRMP data.",
};

export default async function SpecialtiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const withData = SPECIALTIES.filter((s) => s.md).length;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/specialties">
      <main className="page">
        <h1 className="text-2xl mb-2">Specialties</h1>
        <p className="text-sm measure" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-3)" }}>
          For {withData} of {SPECIALTIES.length} specialties: of the U.S. seniors who ranked only that specialty in the
          2025 match, how many matched. A low rate means many people who wanted it did not get it.
        </p>
        <DataNote text={NOTES.specialties} />
        <p className="meta" style={{ marginBottom: "var(--sp-3)" }}>
          Source: <a href={SPECIALTY_MATCH.sourceUrl} className="link" target="_blank" rel="noopener noreferrer">{SPECIALTY_MATCH.source}</a>.
          Last reviewed {reviewedLabel(SPECIALTY_MATCH.lastReviewed)}. <Link href="/data-sources" className="link">All data sources</Link>
        </p>
        <SpecialtyExplorer />
      </main>
    </AppShell>
  );
}
