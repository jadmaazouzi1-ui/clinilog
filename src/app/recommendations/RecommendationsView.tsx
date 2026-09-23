"use client";

import { useState } from "react";
import { RECOMMENDATION_STATUSES, Recommendation } from "@/lib/appTypes";
import { formatMedicalDate } from "@/lib/formatMedical";
import { EmptyState } from "@/components/EmptyStates";
import { TabIndex } from "@/components/MedicalIcons";
import {
  createRecommendation,
  deleteRecommendation,
  setRecommendationStatus,
  updateRecommendation,
} from "./actions";

const STATUS_COLOR: Record<string, string> = {
  Requested: "var(--text-tertiary)",
  "In Progress": "var(--warning)",
  Submitted: "var(--accent)",
};

export default function RecommendationsView({ letters }: { letters: Recommendation[] }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const submitted = letters.filter((l) => l.status === "Submitted").length;

  return (
    <>
      {letters.length > 0 && (
        <>
          <div className="grid grid-cols-3" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-4)" }}>
            {[
              ["LETTERS REQUESTED", String(letters.length).padStart(2, "0")],
              ["SUBMITTED", String(submitted).padStart(2, "0")],
              ["OUTSTANDING", String(letters.length - submitted).padStart(2, "0")],
            ].map(([label, value]) => (
              <div key={label} className="vital-card tick-corners">
                <p className="vital-card-label">{label}</p>
                <span className="vital-card-value">{value}</span>
              </div>
            ))}
          </div>
          <hr className="tear-line" />
        </>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: "var(--sp-2)" }}>
        <p className="dept-header flex items-center gap-2" style={{ margin: 0, border: 0, padding: 0 }}>
          Letters <TabIndex n={1} />
        </p>
        <button onClick={() => setAdding(!adding)} className="teal-glow text-sm" style={{ padding: "8px var(--sp-2)" }}>
          {adding ? "Cancel" : "Add a letter"}
        </button>
      </div>

      {adding && (
        <form
          action={async (fd) => { await createRecommendation(fd); setAdding(false); }}
          className="glass-card"
          style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-2)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
            <div>
              <label className="field-label">RECOMMENDER</label>
              <input name="recommender_name" required placeholder="Dr. Patel" className="field-input" />
            </div>
            <div>
              <label className="field-label">RELATIONSHIP</label>
              <input name="relationship" placeholder="Research PI" className="field-input" />
            </div>
            <div>
              <label className="field-label">REQUESTED</label>
              <input name="date_requested" type="date" className="field-input" />
            </div>
            <div>
              <label className="field-label">STATUS</label>
              <select name="status" className="field-input">
                {RECOMMENDATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
            <div>
              <label className="field-label">ASSIGNED SCHOOLS</label>
              <input name="assigned_schools" placeholder="Comma separated, e.g. Yale, Duke" className="field-input" />
            </div>
            <div>
              <label className="field-label">NOTES</label>
              <input name="notes" placeholder="Sent packet on 12 MAY" className="field-input" />
            </div>
          </div>
          <button type="submit" className="teal-glow text-sm" style={{ padding: "8px var(--sp-3)" }}>Save</button>
        </form>
      )}

      {letters.length === 0 && !adding ? (
        <EmptyState
          kind="recommendations"
          title="No letters logged"
          body="Track each letter you have requested, who is writing it, and which schools it has been assigned to."
        />
      ) : (
        <div style={{ display: "grid", gap: "var(--sp-2)" }}>
          {letters.map((l) => (
            <div key={l.id} className="glass-card" style={{ padding: "var(--sp-2)" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                    <span
                      className="cat-tag"
                      style={{ color: STATUS_COLOR[l.status], background: "transparent", borderColor: "var(--border-strong)" }}
                    >
                      {l.status}
                    </span>
                    {l.date_requested && <span className="exp-id">REQ {formatMedicalDate(l.date_requested)}</span>}
                  </div>
                  <h3 className="text-base font-semibold">{l.recommender_name}</h3>
                  {l.relationship && (
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{l.relationship}</p>
                  )}
                  {l.assigned_schools?.length > 0 && (
                    <p className="text-xs mono" style={{ color: "var(--text-tertiary)", marginTop: 4 }}>
                      ASSIGNED: {l.assigned_schools.join(" / ")}
                    </p>
                  )}
                  {l.notes && (
                    <p className="text-sm" style={{ color: "var(--text-secondary)", marginTop: 4 }}>{l.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    defaultValue={l.status}
                    onChange={(e) => setRecommendationStatus(l.id, e.target.value)}
                    className="field-input"
                    style={{ width: 132, fontSize: 12 }}
                    aria-label={`Status for ${l.recommender_name}`}
                  >
                    {RECOMMENDATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setEditing(editing === l.id ? null : l.id)} className="btn-ghost text-xs font-semibold" style={{ padding: "5px var(--sp-1)" }}>
                    {editing === l.id ? "Close" : "Edit"}
                  </button>
                </div>
              </div>

              {editing === l.id && (
                <form
                  action={async (fd) => { await updateRecommendation(l.id, fd); setEditing(null); }}
                  style={{ marginTop: "var(--sp-2)", paddingTop: "var(--sp-2)", borderTop: "1px dashed var(--border-strong)" }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                    <div>
                      <label className="field-label">RECOMMENDER</label>
                      <input name="recommender_name" defaultValue={l.recommender_name} required className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">RELATIONSHIP</label>
                      <input name="relationship" defaultValue={l.relationship ?? ""} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">REQUESTED</label>
                      <input name="date_requested" type="date" defaultValue={l.date_requested ?? ""} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">STATUS</label>
                      <select name="status" defaultValue={l.status} className="field-input">
                        {RECOMMENDATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                    <div>
                      <label className="field-label">ASSIGNED SCHOOLS</label>
                      <input name="assigned_schools" defaultValue={(l.assigned_schools ?? []).join(", ")} className="field-input" />
                    </div>
                    <div>
                      <label className="field-label">NOTES</label>
                      <input name="notes" defaultValue={l.notes ?? ""} className="field-input" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="teal-glow text-xs" style={{ padding: "7px var(--sp-2)" }}>Save</button>
                    <button
                      type="button"
                      onClick={() => deleteRecommendation(l.id)}
                      className="text-xs font-semibold"
                      style={{
                        padding: "7px var(--sp-2)", color: "var(--margin-rule)", background: "#FFFFFF",
                        border: "1px solid rgba(193,18,31,0.3)", borderRadius: "var(--radius)", cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
