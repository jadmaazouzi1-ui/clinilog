import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import InterviewsView from "./InterviewsView";
import { Interview, WaitlistUpdate } from "@/lib/appTypes";

export const metadata = {
  description: "Interview invites, formats, outcomes and waitlist updates in one list.",
};


export default async function InterviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const [{ data: interviews }, { data: waitlist }] = await Promise.all([
    supabase.from("interviews").select("*").order("interview_date", { ascending: true, nullsFirst: false }),
    supabase.from("waitlist_updates").select("*").order("update_date", { ascending: false }),
  ]);

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/interviews">
      <main className="page">
        <h1 className="text-2xl">
          Interviews
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-3)" }}>
          Every invite, its format and outcome. Waitlist movement is tracked against any interview marked Waitlisted.
        </p>

        <InterviewsView
          interviews={(interviews ?? []) as Interview[]}
          waitlist={(waitlist ?? []) as WaitlistUpdate[]}
        />
      </main>
    </AppShell>
  );
}
