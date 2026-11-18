import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/AppShell";
import { formatDate } from "@/lib/format";
import SignupsChart from "./SignupsChart";

export const metadata = {
  description: "Anonymous usage totals for the site owner.",
};


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
  // The email comes from the server-verified session (getUser), never from a
  // header, cookie or query string, and a non-admin gets a plain 404 so the
  // page's existence is not even confirmed. admin_insights() re-checks.
  if ((user.email ?? "").toLowerCase() !== ADMIN_EMAIL || !user.email_confirmed_at) notFound();

  const { data, error } = await supabase.rpc("admin_insights");
  const insights = (data ?? null) as Insights | null;

  return (
    <AppShell userEmail={user.email ?? ""} activePath="/admin/insights">
      <main className="page">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h1 className="text-2xl">
            Platform insights
          </h1>
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-3)" }}>
          Owner only. Aggregates across all accounts; no individual record is shown.
        </p>

        {error || !insights ? (
          <div
            className="card"
            style={{ padding: "var(--sp-3)", borderLeft: "2px solid var(--danger)" }}
          >
            <p className="meta" style={{ color: "var(--danger)", marginBottom: 4 }}>The query failed</p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {error?.message ?? "No data returned."}
            </p>
          </div>
        ) : (
          <>
            <p className="section-title flex items-center gap-2">
              Totals
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
              {[
                ["Accounts", String(insights.total_users)],
                ["Active this week", String(insights.weekly_active)],
                ["Hours logged", String(Math.round(Number(insights.total_hours)))],
                ["Entries", String(insights.total_entries)],
              ].map(([label, value]) => (
                <div key={label} className="card">
                  <p className="stat-label">{label}</p>
                  <span className="stat-value">{value}</span>
                </div>
              ))}
            </div>

            <hr className="rule" />

            <p className="section-title flex items-center gap-2">
              Signups, last 90 days
            </p>
            <div className="card" style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
              <SignupsChart data={insights.signups_over_time ?? []} />
            </div>

            <p className="section-title flex items-center gap-2">
              Most-visited pages, last 30 days
            </p>
            {(insights.top_pages ?? []).length === 0 ? (
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                No page views recorded yet.
              </p>
            ) : (
              <div className="card" style={{ padding: "var(--sp-2)" }}>
                {insights.top_pages.map((p) => {
                  const max = Math.max(...insights.top_pages.map((x) => Number(x.visits)));
                  const pct = max > 0 ? (Number(p.visits) / max) * 100 : 0;
                  return (
                    <div
                      key={p.path}
                      className="flex items-baseline gap-3"
                      style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}
                    >
                      <span className="tnum text-xs flex-1 truncate" style={{ color: "var(--text)" }}>
                        {p.path}
                      </span>
                      <span
                        aria-hidden="true"
                        style={{ display: "block", width: 120, height: 5, background: "var(--surface-alt)" }}
                      >
                        <span style={{ display: "block", height: "100%", width: `${pct}%`, background: "var(--data-1)" }} />
                      </span>
                      <span className="tnum text-xs" style={{ color: "var(--text-muted)", minWidth: 36, textAlign: "right" }}>
                        {p.visits}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="meta" style={{ marginTop: "var(--sp-3)" }}>
              Generated {formatDate(new Date())}
            </p>
          </>
        )}
      </main>
    </AppShell>
  );
}
