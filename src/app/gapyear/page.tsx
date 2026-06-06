import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import GapYearView from "./GapYearView";
import { GapYearData } from "./actions";

export default async function GapYearPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data } = await supabase.from("gap_year_data").select("*").eq("user_id", user.id).maybeSingle();

  const initial: GapYearData = {
    user_id: user.id,
    target_cycle_year: data?.target_cycle_year ?? null,
    goals: data?.goals ?? [],
    monthly_log: data?.monthly_log ?? {},
    milestones: data?.milestones ?? {},
  };

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/gapyear">
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ color: "#F8FAFC" }}>Gap Year Planner</h1>
          <p className="text-sm" style={{ color: "rgba(248,250,252,0.6)" }}>
            Plan, track, and stay accountable through your gap year — all in one place.
          </p>
        </div>
        <GapYearView initial={initial} />
      </main>
    </AppShell>
  );
}
