import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SchoolList from "./SchoolList";
import AppShell from "@/components/AppShell";

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
      <main className="w-full px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium mb-8"
          style={{ color: "var(--text-primary)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
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
