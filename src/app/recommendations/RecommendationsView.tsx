"use client";

import { useState } from "react";
import { RECOMMENDATION_STATUSES, Recommendation } from "@/lib/appTypes";
import { formatDate } from "@/lib/format";
import { EmptyState } from "@/components/EmptyStates";
import {
  createRecommendation,
  deleteRecommendation,
  setRecommendationStatus,
  updateRecommendation,
} from "./actions";

const STATUS_COLOR: Record<string, string> = {
  Requested: "var(--text-muted)",
  "In Progress": "var(--action-text)",
  Submitted: "var(--text)",
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
              <div key={label} className="card">
                <p className="stat-label">{label}</p>
                <span className="stat-value">{value}</span>
              </div>
            ))}
          </div>
          <hr className="rule" />
        </>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: "var(--sp-2)" }}>
        <p className="section-title flex items-center gap-2" style={{ margin: 0, border: 0, padding: 0 }}>
          Letters
        </p>
        <button onClick={() => setAdding(!adding)} className="btn btn-primary text-sm" style={{ padding: "8px var(--sp-2)" }}>
          {adding ? "Cancel" : "Add a letter"}
        </button>
      </div>

      {adding && (
        <form
          action={async (fd) => { await createRecommendation(fd); setAdding(false); }}
          className="card"
          style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-2)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
            <div>
              <label className="label">RECOMMENDER</label>
              <input name="recommender_name" required placeholder="Dr. Patel" className="field" />
            </div>
            <div>
              <label className="label">RELATIONSHIP</label>
              <input name="relationship" placeholder="Research PI" className="field" />
            </div>
            <div>
              <label className="label">REQUESTED</label>
              <input name="date_requested" type="date" className="field" />
            </div>
            <div>
              <label className="label">STATUS</label>
              <select name="status" className="field">
                {RECOMMENDATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
            <div>
              <label className="label">ASSIGNED SCHOOLS</label>
              <input name="assigned_schools" placeholder="Comma separated, e.g. Yale, Duke" className="field" />
            </div>
            <div>
              <label className="label">NOTES</label>
              <input name="notes" placeholder="Sent packet on 12 MAY" className="field" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary text-sm" style={{ padding: "8px var(--sp-3)" }}>Save</button>
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
            <div key={l.id} className="card" style={{ padding: "var(--sp-2)" }}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 4 }}>
                    <span
                      className="badge"
                      style={{ color: STATUS_COLOR[l.status], background: "transparent", borderColor: "var(--border-strong)" }}
                    >
                      {l.status}
                    </span>
                    {l.date_requested && <span className="meta">REQ {formatDate(l.date_requested)}</span>}
                  </div>
                  <h3 className="text-base font-semibold">{l.recommender_name}</h3>
                  {l.relationship && (
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{l.relationship}</p>
                  )}
                  {l.assigned_schools?.length > 0 && (
                    <p className="text-xs tnum" style={{ color: "var(--text-muted)", marginTop: 4 }}>
                      ASSIGNED: {l.assigned_schools.join(" / ")}
                    </p>
                  )}
                  {l.notes && (
                    <p className="text-sm" style={{ color: "var(--text-muted)", marginTop: 4 }}>{l.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <select
                    defaultValue={l.status}
                    onChange={(e) => setRecommendationStatus(l.id, e.target.value)}
                    className="field"
                    style={{ width: 132, fontSize: "var(--text-xs)" }}
                    aria-label={`Status for ${l.recommender_name}`}
                  >
                    {RECOMMENDATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button onClick={() => setEditing(editing === l.id ? null : l.id)} className="btn btn-secondary text-xs font-semibold" style={{ padding: "5px var(--sp-1)" }}>
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
                      <label className="label">RECOMMENDER</label>
                      <input name="recommender_name" defaultValue={l.recommender_name} required className="field" />
                    </div>
                    <div>
                      <label className="label">RELATIONSHIP</label>
                      <input name="relationship" defaultValue={l.relationship ?? ""} className="field" />
                    </div>
                    <div>
                      <label className="label">REQUESTED</label>
                      <input name="date_requested" type="date" defaultValue={l.date_requested ?? ""} className="field" />
                    </div>
                    <div>
                      <label className="label">STATUS</label>
                      <select name="status" defaultValue={l.status} className="field">
                        {RECOMMENDATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
                    <div>
                      <label className="label">ASSIGNED SCHOOLS</label>
                      <input name="assigned_schools" defaultValue={(l.assigned_schools ?? []).join(", ")} className="field" />
                    </div>
                    <div>
                      <label className="label">NOTES</label>
                      <input name="notes" defaultValue={l.notes ?? ""} className="field" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="btn btn-primary text-xs" style={{ padding: "7px var(--sp-2)" }}>Save</button>
                    <button
                      type="button"
                      onClick={() => deleteRecommendation(l.id)}
                      className="text-xs font-semibold"
                      style={{
                        padding: "7px var(--sp-2)", color: "var(--danger)", background: "var(--surface)",
                        border: "1px solid var(--danger)", borderRadius: "var(--radius)", cursor: "pointer",
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
