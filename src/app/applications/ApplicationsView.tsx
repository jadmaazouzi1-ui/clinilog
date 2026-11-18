"use client";

import { useMemo, useState } from "react";
import {
  AMCAS_PER_SCHOOL_FEE,
  AMCAS_PRIMARY_FEE,
  FEE_WAIVER_STATUSES,
  SECONDARY_STATUSES,
  SchoolApplication,
} from "@/lib/appTypes";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/ui";
import { removeSchool, setSecondaryStatus, updateApplication } from "./actions";

const STATUS_COLOR: Record<string, string> = {
  "Not Started": "var(--text-muted)",
  Draft: "var(--warning)",
  Submitted: "var(--text)",
};

export default function ApplicationsView({ apps }: { apps: SchoolApplication[] }) {
  const [editing, setEditing] = useState<string | null>(null);

  const applying = apps.filter((a) => a.status === "Applying");
  const targets = apps.filter((a) => a.status === "Target");

  const budget = useMemo(() => {
    const designations = Math.max(0, applying.length - 1);
    const primary = applying.length > 0 ? AMCAS_PRIMARY_FEE : 0;
    const designationTotal = designations * AMCAS_PER_SCHOOL_FEE;
    const secondaries = applying.reduce(
      (sum, a) => sum + (a.fee_waiver_status === "Approved" ? 0 : Number(a.secondary_fee ?? 0)),
      0
    );
    const waived = applying.reduce(
      (sum, a) => sum + (a.fee_waiver_status === "Approved" ? Number(a.secondary_fee ?? 0) : 0),
      0
    );
    return { primary, designationTotal, secondaries, waived, total: primary + designationTotal + secondaries };
  }, [applying]);

  return (
    <>
      {/* ── Budget ───────────────────────────────────────────────────── */}
      <p className="section-title flex items-center gap-2">
        Application Budget
      </p>
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}
      >
        {[
          ["AMCAS primary", `$${budget.primary}`],
          [`School designations (${Math.max(0, applying.length - 1)})`, `$${budget.designationTotal}`],
          ["Secondaries", `$${budget.secondaries.toFixed(0)}`],
          ["Running total", `$${budget.total.toFixed(0)}`],
        ].map(([label, value]) => (
          <div key={label} className="card">
            <p className="stat-label">{label}</p>
            <span className="stat-value">{value}</span>
          </div>
        ))}
      </div>
      {budget.waived > 0 && (
        <p className="meta" style={{ marginBottom: "var(--sp-4)" }}>
          ${budget.waived.toFixed(0)} WAIVED ACROSS APPROVED FEE WAIVERS
        </p>
      )}

      <hr className="rule" />

      {/* ── Secondaries ──────────────────────────────────────────────── */}
      <p className="section-title flex items-center gap-2">
        Secondary Essays
      </p>

      {applying.length === 0 ? (
        <EmptyState title="No schools marked Applying" action={{ href: "/schools", label: "Browse schools" }}>
          {"Open the Schools page and mark a school as Applying. It appears here with a secondary tracker."}
          </EmptyState>
      ) : (
        <div style={{ display: "grid", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
          {applying.map((a) => (
            <div key={a.id} className="card" style={{ padding: "var(--sp-2)" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                    <span
                      className="badge"
                      style={{
                        color: STATUS_COLOR[a.secondary_status],
                        borderColor: "var(--border-strong)",
                        background: "transparent",
                      }}
                    >
                      {a.secondary_status}
                    </span>
                    {a.deadline && (
                      <span className="meta">Due {formatDate(a.deadline)}</span>
                    )}
                    {a.word_limit ? <span className="meta">{a.word_limit} WORDS</span> : null}
                  </div>
                  <h3 className="text-base font-semibold">{a.school_name}</h3>
                  {a.secondary_prompt && (
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)", marginTop: 4, whiteSpace: "pre-wrap" }}
                    >
                      {a.secondary_prompt}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {SECONDARY_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSecondaryStatus(a.id, s)}
                      className="text-xs font-bold"
                      style={{
                        padding: "4px 7px",
                        borderRadius: "var(--radius)",
                        cursor: "pointer",
                        border: `1px solid ${a.secondary_status === s ? "var(--text)" : "var(--border)"}`,
                        background: a.secondary_status === s ? "var(--surface-alt)" : "var(--surface)",
                        color: a.secondary_status === s ? "var(--text)" : "var(--text-muted)",
                      }}
                    >
                      {s === "Not Started" ? "Not started" : s === "Draft" ? "Draft" : "Submitted"}
                    </button>
                  ))}
                  <button
                    onClick={() => setEditing(editing === a.id ? null : a.id)}
                    className="btn btn-secondary"
                  >
                    {editing === a.id ? "Close" : "Edit"}
                  </button>
                </div>
              </div>

              {editing === a.id && (
                <form
                  action={updateApplication.bind(null, a.id)}
                  style={{ marginTop: "var(--sp-2)", paddingTop: "var(--sp-2)", borderTop: "1px dashed var(--border-strong)" }}
                >
                  <div style={{ marginBottom: "var(--sp-2)" }}>
                    <label htmlFor="secondary-prompt-input" className="label">Prompt</label>
                    <textarea id="secondary-prompt-input"
                      name="secondary_prompt"
                      rows={3}
                      defaultValue={a.secondary_prompt ?? ""}
                      placeholder="Paste the secondary prompt"
                      className="field"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                    <div>
                      <label htmlFor="word-limit-input" className="label">Word limit</label>
                      <input id="word-limit-input" name="word_limit" type="number" min="0" defaultValue={a.word_limit ?? ""} placeholder="500" className="field tnum" />
                    </div>
                    <div>
                      <label htmlFor="deadline-input" className="label">Deadline</label>
                      <input id="deadline-input" name="deadline" type="date" defaultValue={a.deadline ?? ""} className="field" />
                    </div>
                    <div>
                      <label htmlFor="secondary-status-input" className="label">Status</label>
                      <select id="secondary-status-input" name="secondary_status" defaultValue={a.secondary_status} className="field">
                        {SECONDARY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="secondary-fee-input" className="label">FEE ($)</label>
                      <input id="secondary-fee-input" name="secondary_fee" type="number" min="0" step="1" defaultValue={Number(a.secondary_fee ?? 0)} className="field tnum" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                    <div>
                      <label htmlFor="fee-waiver-status-input" className="label">Fee waiver</label>
                      <select id="fee-waiver-status-input" name="fee_waiver_status" defaultValue={a.fee_waiver_status} className="field">
                        {FEE_WAIVER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="notes-input" className="label">Notes</label>
                      <input id="notes-input" name="notes" type="text" defaultValue={a.notes ?? ""} placeholder="Anything to remember" className="field" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="btn btn-primary">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSchool(a.id)}
                      className="text-xs font-semibold"
                      style={{
                        padding: "7px var(--sp-2)",
                        color: "var(--danger)",
                        background: "var(--surface)",
                        border: "1px solid var(--danger)",
                        borderRadius: "var(--radius)",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      {targets.length > 0 && (
        <>
          <hr className="rule" />
          <p className="section-title flex items-center gap-2">
            Targets, not yet applying
          </p>
          <div style={{ display: "grid", gap: "var(--sp-1)" }}>
            {targets.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3"
                style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}
              >
                <span className="text-sm">{t.school_name}</span>
                <span className="meta">Target</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
