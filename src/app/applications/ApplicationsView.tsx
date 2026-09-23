"use client";

import { useMemo, useState } from "react";
import {
  AMCAS_PER_SCHOOL_FEE,
  AMCAS_PRIMARY_FEE,
  FEE_WAIVER_STATUSES,
  SECONDARY_STATUSES,
  SchoolApplication,
} from "@/lib/appTypes";
import { formatMedicalDate } from "@/lib/formatMedical";
import { EmptyState } from "@/components/EmptyStates";
import { TabIndex } from "@/components/MedicalIcons";
import { removeSchool, setSecondaryStatus, updateApplication } from "./actions";

const STATUS_COLOR: Record<string, string> = {
  "Not Started": "var(--text-tertiary)",
  Draft: "var(--warning)",
  Submitted: "var(--accent)",
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
      <p className="dept-header flex items-center gap-2">
        Application Budget <TabIndex n={1} />
      </p>
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}
      >
        {[
          ["AMCAS PRIMARY", `$${budget.primary}`],
          [`DESIGNATIONS (${Math.max(0, applying.length - 1)})`, `$${budget.designationTotal}`],
          ["SECONDARIES", `$${budget.secondaries.toFixed(0)}`],
          ["RUNNING TOTAL", `$${budget.total.toFixed(0)}`],
        ].map(([label, value]) => (
          <div key={label} className="vital-card tick-corners">
            <p className="vital-card-label">{label}</p>
            <span className="vital-card-value">{value}</span>
          </div>
        ))}
      </div>
      {budget.waived > 0 && (
        <p className="exp-id" style={{ marginBottom: "var(--sp-4)", color: "var(--accent)" }}>
          ${budget.waived.toFixed(0)} WAIVED ACROSS APPROVED FEE WAIVERS
        </p>
      )}

      <hr className="tear-line" />

      {/* ── Secondaries ──────────────────────────────────────────────── */}
      <p className="dept-header flex items-center gap-2">
        Secondary Essays <TabIndex n={2} />
      </p>

      {applying.length === 0 ? (
        <EmptyState
          kind="applications"
          title="No schools marked Applying"
          body="Open the Schools page and mark a school as Applying. It appears here with a secondary tracker."
          actionHref="/schools"
          actionLabel="Browse schools"
        />
      ) : (
        <div style={{ display: "grid", gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
          {applying.map((a) => (
            <div key={a.id} className="glass-card" style={{ padding: "var(--sp-2)" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                    <span
                      className="cat-tag"
                      style={{
                        color: STATUS_COLOR[a.secondary_status],
                        borderColor: "var(--border-strong)",
                        background: "transparent",
                      }}
                    >
                      {a.secondary_status}
                    </span>
                    {a.deadline && (
                      <span className="exp-id">DUE {formatMedicalDate(a.deadline)}</span>
                    )}
                    {a.word_limit ? <span className="exp-id">{a.word_limit} WORDS</span> : null}
                  </div>
                  <h3 className="text-base font-semibold">{a.school_name}</h3>
                  {a.secondary_prompt && (
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)", marginTop: 4, whiteSpace: "pre-wrap" }}
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
                      className="text-[10px] font-bold uppercase"
                      style={{
                        padding: "4px 7px",
                        letterSpacing: "0.08em",
                        borderRadius: "var(--radius)",
                        cursor: "pointer",
                        border: `1px solid ${a.secondary_status === s ? "var(--accent)" : "var(--border-strong)"}`,
                        background: a.secondary_status === s ? "var(--accent-soft)" : "#FFFFFF",
                        color: a.secondary_status === s ? "var(--accent)" : "var(--text-tertiary)",
                      }}
                    >
                      {s === "Not Started" ? "NS" : s === "Draft" ? "DR" : "SUB"}
                    </button>
                  ))}
                  <button
                    onClick={() => setEditing(editing === a.id ? null : a.id)}
                    className="btn-ghost text-xs font-semibold"
                    style={{ padding: "5px var(--sp-1)" }}
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
                    <label className="field-label">PROMPT</label>
                    <textarea
                      name="secondary_prompt"
                      rows={3}
                      defaultValue={a.secondary_prompt ?? ""}
                      placeholder="Paste the secondary prompt"
                      className="field-input resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                    <div>
                      <label className="field-label">WORD LIMIT</label>
                      <input name="word_limit" type="number" min="0" defaultValue={a.word_limit ?? ""} placeholder="500" className="field-input mono" />
                    </div>
                    <div>
                      <label className="field-label">DEADLINE</label>
                      <input name="deadline" type="date" defaultValue={a.deadline ?? ""} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">STATUS</label>
                      <select name="secondary_status" defaultValue={a.secondary_status} className="field-input">
                        {SECONDARY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">FEE ($)</label>
                      <input name="secondary_fee" type="number" min="0" step="1" defaultValue={Number(a.secondary_fee ?? 0)} className="field-input mono" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                    <div>
                      <label className="field-label">FEE WAIVER</label>
                      <select name="fee_waiver_status" defaultValue={a.fee_waiver_status} className="field-input">
                        {FEE_WAIVER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="field-label">NOTES</label>
                      <input name="notes" type="text" defaultValue={a.notes ?? ""} placeholder="Anything to remember" className="field-input" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="teal-glow text-xs" style={{ padding: "7px var(--sp-2)" }}>
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSchool(a.id)}
                      className="text-xs font-semibold"
                      style={{
                        padding: "7px var(--sp-2)",
                        color: "var(--margin-rule)",
                        background: "#FFFFFF",
                        border: "1px solid rgba(193,18,31,0.3)",
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
          <hr className="tear-line" />
          <p className="dept-header flex items-center gap-2">
            Targets, not yet applying <TabIndex n={3} />
          </p>
          <div style={{ display: "grid", gap: "var(--sp-1)" }}>
            {targets.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3"
                style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}
              >
                <span className="text-sm">{t.school_name}</span>
                <span className="exp-id">TARGET</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
