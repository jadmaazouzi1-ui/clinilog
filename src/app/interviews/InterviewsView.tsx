"use client";

import { useState } from "react";
import {
  INTERVIEW_FORMATS,
  INTERVIEW_STATUSES,
  Interview,
  WaitlistUpdate,
} from "@/lib/appTypes";
import { formatMedicalDate } from "@/lib/formatMedical";
import { EmptyState } from "@/components/EmptyStates";
import { TabIndex } from "@/components/MedicalIcons";
import {
  addWaitlistUpdate,
  createInterview,
  deleteInterview,
  deleteWaitlistUpdate,
  setInterviewStatus,
  updateInterview,
} from "./actions";

const STATUS_COLOR: Record<string, string> = {
  Scheduled: "var(--text-secondary)",
  Completed: "var(--cat-shadowing)",
  Waitlisted: "var(--warning)",
  Accepted: "var(--accent)",
  Rejected: "var(--margin-rule)",
};

export default function InterviewsView({
  interviews,
  waitlist,
}: {
  interviews: Interview[];
  waitlist: WaitlistUpdate[];
}) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const counts = INTERVIEW_STATUSES.map((s) => ({
    status: s,
    n: interviews.filter((i) => i.status === s).length,
  }));

  return (
    <>
      {interviews.length > 0 && (
        <>
          <p className="dept-header flex items-center gap-2">
            Cycle Status <TabIndex n={1} />
          </p>
          <div
            className="grid grid-cols-2 md:grid-cols-5"
            style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}
          >
            {counts.map(({ status, n }) => (
              <div key={status} className="vital-card tick-corners">
                <p className="vital-card-label">{status}</p>
                <span className="vital-card-value" style={{ color: STATUS_COLOR[status] }}>
                  {String(n).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
          <hr className="tear-line" />
        </>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: "var(--sp-2)" }}>
        <p className="dept-header flex items-center gap-2" style={{ margin: 0, border: 0, padding: 0 }}>
          Interview Log <TabIndex n={2} />
        </p>
        <button onClick={() => setAdding(!adding)} className="teal-glow text-sm" style={{ padding: "8px var(--sp-2)" }}>
          {adding ? "Cancel" : "Log an invite"}
        </button>
      </div>

      {adding && (
        <form
          action={async (fd) => { await createInterview(fd); setAdding(false); }}
          className="glass-card"
          style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-2)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
            <div className="md:col-span-2">
              <label className="field-label">SCHOOL</label>
              <input name="school_name" required placeholder="School name" className="field-input" />
            </div>
            <div>
              <label className="field-label">FORMAT</label>
              <select name="format" className="field-input">
                {INTERVIEW_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">DATE</label>
              <input name="interview_date" type="date" className="field-input" />
            </div>
          </div>
          <div style={{ marginBottom: "var(--sp-2)" }}>
            <label className="field-label">STATUS</label>
            <select name="status" className="field-input">
              {INTERVIEW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: "var(--sp-2)" }}>
            <label className="field-label">REFLECTION</label>
            <textarea name="reflection" rows={3} placeholder="Post-interview notes: what was asked, how it went" className="field-input resize-none" />
          </div>
          <button type="submit" className="teal-glow text-sm" style={{ padding: "8px var(--sp-3)" }}>Save</button>
        </form>
      )}

      {interviews.length === 0 && !adding ? (
        <EmptyState
          kind="interviews"
          title="No interviews logged"
          body="When an invite arrives, log the school, format and date here. Waitlist movement can be tracked against any interview marked Waitlisted."
        />
      ) : (
        <div style={{ display: "grid", gap: "var(--sp-2)" }}>
          {interviews.map((iv) => {
            const updates = waitlist.filter((w) => w.interview_id === iv.id);
            return (
              <div key={iv.id} className="glass-card tear-tab" style={{ padding: "var(--sp-2)" }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                      <span
                        className="cat-tag"
                        style={{ color: STATUS_COLOR[iv.status], background: "transparent", borderColor: "var(--border-strong)" }}
                      >
                        {iv.status}
                      </span>
                      <span className="exp-id">{iv.format.toUpperCase()}</span>
                      {iv.interview_date && <span className="exp-id">{formatMedicalDate(iv.interview_date)}</span>}
                    </div>
                    <h3 className="text-base font-semibold">{iv.school_name}</h3>
                    {iv.reflection && (
                      <p className="text-sm" style={{ color: "var(--text-secondary)", marginTop: 4, whiteSpace: "pre-wrap" }}>
                        {iv.reflection}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <select
                      defaultValue={iv.status}
                      onChange={(e) => setInterviewStatus(iv.id, e.target.value)}
                      className="field-input"
                      style={{ width: 128, fontSize: 12 }}
                      aria-label={`Status for ${iv.school_name}`}
                    >
                      {INTERVIEW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => setEditing(editing === iv.id ? null : iv.id)} className="btn-ghost text-xs font-semibold" style={{ padding: "5px var(--sp-1)" }}>
                      {editing === iv.id ? "Close" : "Edit"}
                    </button>
                  </div>
                </div>

                {/* ── Waitlist movement ───────────────────────────────── */}
                {iv.status === "Waitlisted" && (
                  <div style={{ marginTop: "var(--sp-2)", paddingTop: "var(--sp-2)", borderTop: "1px dashed var(--border-strong)" }}>
                    <p className="exp-id" style={{ marginBottom: 6 }}>WAITLIST MOVEMENT</p>
                    {updates.length > 0 && (
                      <div style={{ marginBottom: "var(--sp-1)" }}>
                        {updates.map((w) => (
                          <div key={w.id} className="flex items-baseline gap-3" style={{ padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                            <span className="exp-id" style={{ minWidth: 96 }}>{formatMedicalDate(w.update_date)}</span>
                            <span className="text-sm flex-1">{w.note}</span>
                            <button
                              onClick={() => deleteWaitlistUpdate(w.id)}
                              className="text-[10px] font-bold uppercase"
                              style={{ color: "var(--text-tertiary)", background: "none", border: 0, cursor: "pointer" }}
                              aria-label="Delete update"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <form action={addWaitlistUpdate.bind(null, iv.id)} className="flex items-end gap-2 flex-wrap">
                      <div style={{ width: 150 }}>
                        <label className="field-label">DATE</label>
                        <input name="update_date" type="date" className="field-input" />
                      </div>
                      <div className="flex-1" style={{ minWidth: 200 }}>
                        <label className="field-label">UPDATE</label>
                        <input name="note" required placeholder="Moved to active waitlist, letter of intent sent" className="field-input" />
                      </div>
                      <button type="submit" className="btn-ghost text-xs font-semibold" style={{ padding: "7px var(--sp-2)" }}>Add</button>
                    </form>
                  </div>
                )}

                {editing === iv.id && (
                  <form
                    action={async (fd) => { await updateInterview(iv.id, fd); setEditing(null); }}
                    style={{ marginTop: "var(--sp-2)", paddingTop: "var(--sp-2)", borderTop: "1px dashed var(--border-strong)" }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                      <div className="md:col-span-2">
                        <label className="field-label">SCHOOL</label>
                        <input name="school_name" defaultValue={iv.school_name} required className="field-input" />
                      </div>
                      <div>
                        <label className="field-label">FORMAT</label>
                        <select name="format" defaultValue={iv.format} className="field-input">
                          {INTERVIEW_FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="field-label">DATE</label>
                        <input name="interview_date" type="date" defaultValue={iv.interview_date ?? ""} className="field-input" />
                      </div>
                    </div>
                    <input type="hidden" name="status" value={iv.status} />
                    <div style={{ marginBottom: "var(--sp-2)" }}>
                      <label className="field-label">REFLECTION</label>
                      <textarea name="reflection" rows={4} defaultValue={iv.reflection ?? ""} className="field-input resize-none" />
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="submit" className="teal-glow text-xs" style={{ padding: "7px var(--sp-2)" }}>Save</button>
                      <button
                        type="button"
                        onClick={() => deleteInterview(iv.id)}
                        className="text-xs font-semibold"
                        style={{
                          padding: "7px var(--sp-2)", color: "var(--margin-rule)", background: "var(--bg-card)",
                          border: "1px solid rgba(193,18,31,0.3)", borderRadius: "var(--radius)", cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
