import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import { formatMedicalDate } from "@/lib/formatMedical";
import { EkgDivider, RecordNo, TabIndex } from "@/components/MedicalIcons";
import SignupsChart from "./SignupsChart";

export const metadata = { title: "Insights | ClinicLog MD" };

/** The single account permitted to view platform analytics. */
const ADMIN_EMAIL = "jadmaazouzi1@gmail.com";

interface Insights {
  total_users: number;
  total_hours: number;
  total_entries: number;
  weekly_active: number;
  top_pages: { path: string; visits: number }[];
  signups_over_time: { day: string; signups: number }[];
}

export default async function AdminInsightsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Checked here for a clean redirect, and again inside admin_insights(),
  // which raises for any other caller. The RPC is the real boundary: this
  // check alone would be bypassable by calling the function directly.
  if ((user.email ?? "").toLowerCase() !== ADMIN_EMAIL) redirect("/dashboard");

  const { data, error } = await supabase.rpc("admin_insights");
  const insights = (data ?? null) as Insights | null;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/admin/insights">
      <main
        className="w-full chart-margin"
        style={{ paddingTop: "var(--sp-3)", paddingRight: "var(--sp-3)", paddingBottom: "var(--sp-4)" }}
      >
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            Platform insights
          </h1>
          <RecordNo page="/admin/insights" />
        </div>
        <p className="text-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-3)" }}>
          Owner only. Aggregates across all accounts; no individual record is shown.
        </p>

        {error || !insights ? (
          <div
            className="glass-card"
            style={{ padding: "var(--sp-3)", borderLeft: "2px solid var(--margin-rule)" }}
          >
            <p className="exp-id" style={{ color: "var(--margin-rule)", marginBottom: 4 }}>QUERY FAILED</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {error?.message ?? "No data returned."}
            </p>
          </div>
        ) : (
          <>
            <p className="dept-header flex items-center gap-2">
              Totals <TabIndex n={1} />
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
              {[
                ["TOTAL USERS", String(insights.total_users)],
                ["WEEKLY ACTIVE", String(insights.weekly_active)],
                ["HOURS LOGGED", String(Math.round(Number(insights.total_hours)))],
                ["ENTRIES", String(insights.total_entries)],
              ].map(([label, value]) => (
                <div key={label} className="vital-card tick-corners">
                  <p className="vital-card-label">{label}</p>
                  <span className="vital-card-value">{value}</span>
                </div>
              ))}
            </div>

            <EkgDivider />

            <p className="dept-header flex items-center gap-2">
              Signups, last 90 days <TabIndex n={2} />
            </p>
            <div className="glass-card" style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
              <SignupsChart data={insights.signups_over_time ?? []} />
            </div>

            <p className="dept-header flex items-center gap-2">
              Most-visited pages, last 30 days <TabIndex n={3} />
            </p>
            {(insights.top_pages ?? []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                No page views recorded yet.
              </p>
            ) : (
              <div className="glass-card" style={{ padding: "var(--sp-2)" }}>
                {insights.top_pages.map((p) => {
                  const max = Math.max(...insights.top_pages.map((x) => Number(x.visits)));
                  const pct = max > 0 ? (Number(p.visits) / max) * 100 : 0;
                  return (
                    <div
                      key={p.path}
                      className="flex items-baseline gap-3"
                      style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}
                    >
                      <span className="mono text-xs flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                        {p.path}
                      </span>
                      <span
                        aria-hidden="true"
                        style={{ display: "block", width: 120, height: 5, background: "var(--bg-soft)" }}
                      >
                        <span style={{ display: "block", height: "100%", width: `${pct}%`, background: "var(--accent)" }} />
                      </span>
                      <span className="mono text-xs" style={{ color: "var(--text-secondary)", minWidth: 36, textAlign: "right" }}>
                        {p.visits}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="exp-id" style={{ marginTop: "var(--sp-3)" }}>
              GENERATED {formatMedicalDate(new Date())}
            </p>
          </>
        )}
      </main>
    </AppShell>
  );
}
