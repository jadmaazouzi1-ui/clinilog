import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SchoolList from "./SchoolList";
import AppShell from "@/components/AppShell";

export const metadata = {
  description: "Compare medical schools by approximate average GPA and MCAT, mission and state.",
};

export default async function SchoolsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [{ data: apps }, { data: exps }] = await Promise.all([
    supabase.from("school_applications").select("school_name,status"),
    supabase.from("experiences").select("hours"),
  ]);

  const statuses: Record<string, "Target" | "Applying"> = {};
  for (const a of apps ?? []) statuses[a.school_name] = a.status;
  const clinicalHours = (exps ?? []).reduce((sum, e) => sum + Number(e.hours ?? 0), 0);
  const userName = String(user.user_metadata?.full_name ?? user.email ?? "");

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/schools">
      <main className="page">
        <Link
          href="/dashboard"
          className="link text-sm inline-block" style={{ marginBottom: "var(--sp-15)" }}>
          Back to Overview
        </Link>
        <SchoolList
          userEmail={user.email ?? ""}
          statuses={statuses}
          clinicalHours={clinicalHours}
          userName={userName}
        />
      </main>
    </AppShell>
  );
}
