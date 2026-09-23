import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import ApplicationsView from "./ApplicationsView";
import { SchoolApplication } from "@/lib/appTypes";

export const metadata = { title: "My Applications | ClinicLog MD" };

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase
    .from("school_applications")
    .select("*")
    .order("school_name", { ascending: true });

  const apps: SchoolApplication[] = (data ?? []) as SchoolApplication[];

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/applications">
      <main
        className="w-full chart-margin"
        style={{ paddingTop: "var(--sp-3)", paddingRight: "var(--sp-3)", paddingBottom: "var(--sp-4)" }}
      >
        <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
          My Applications
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-3)" }}>
          Secondary essays and running cost for every school you have marked Applying.
        </p>

        <ApplicationsView apps={apps} />
      </main>
    </AppShell>
  );
}
