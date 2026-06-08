"use client";

import { useState, useTransition, useMemo } from "react";
import { GapGoal, GapYearData, saveGapYearData } from "./actions";

const CATEGORIES: { value: GapGoal["category"]; label: string; color: string }[] = [
  { value: "clinical",     label: "Clinical Hours",   color: "#E8A020" },
  { value: "research",     label: "Research",         color: "#A78BFA" },
  { value: "volunteering", label: "Volunteering",     color: "#10B981" },
  { value: "personal",     label: "Personal Growth",  color: "#F59E0B" },
  { value: "financial",    label: "Financial",        color: "#38BDF8" },
];

const MILESTONES: { id: string; label: string; due: string }[] = [
  { id: "mcat_registered",  label: "Register for MCAT",                  due: "By end of Year - 1" },
  { id: "mcat_taken",       label: "Take the MCAT",                       due: "Before AMCAS opens" },
  { id: "amcas_account",    label: "Set up AMCAS account",                due: "Early May, application year" },
  { id: "lor_list",         label: "Identify 3-5 letter writers",         due: "6 months before applying" },
  { id: "lor_request",      label: "Formally request letters",            due: "3 months before applying" },
  { id: "interfolio",       label: "Set up Interfolio or LOR service",    due: "3 months before applying" },
  { id: "personal_statement", label: "First draft of personal statement", due: "4 months before applying" },
  { id: "ps_revisions",     label: "Personal statement revisions",        due: "Until submission" },
  { id: "secondaries_prep", label: "Pre-write common secondary essays",   due: "May–June, application year" },
  { id: "school_list",      label: "Finalize school list",                due: "Before AMCAS submission" },
  { id: "transcript_request", label: "Request official transcripts",      due: "May, application year" },
  { id: "submit_amcas",     label: "Submit AMCAS primary application",    due: "Late May / early June" },
];

function getCategoryMeta(cat: GapGoal["category"]) {
  return CATEGORIES.find((c) => c.value === cat) ?? CATEGORIES[0];
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split("-").map((s) => parseInt(s, 10));
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[m - 1]} ${y}`;
}

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function calcCountdown(year: number | null): { days: number; label: string } | null {
  if (!year) return null;
  // AMCAS typically opens in early May
  const target = new Date(year, 4, 2); // May 2
  const now = new Date();
  const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { days: 0, label: "Cycle has opened" };
  return { days, label: `AMCAS opens ~ May 2, ${year}` };
}

export default function GapYearView({ initial }: { initial: GapYearData }) {
  const [data, setData] = useState<GapYearData>(initial);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Goal editing
  const [newCategory, setNewCategory] = useState<GapGoal["category"]>("clinical");
  const [newTitle, setNewTitle] = useState("");
  const [newTarget, setNewTarget] = useState("");

  // Monthly log editing
  const [logMonth, setLogMonth] = useState(currentYearMonth());
  const [logText, setLogText] = useState("");

  const countdown = useMemo(() => calcCountdown(data.target_cycle_year), [data.target_cycle_year]);
  const milestonesDone = useMemo(() => MILESTONES.filter((m) => data.milestones[m.id]).length, [data.milestones]);

  function persist(next: Partial<GapYearData>) {
    const updated = { ...data, ...next };
    setData(updated);
    startTransition(async () => {
      await saveGapYearData(next);
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  function addGoal() {
    if (!newTitle.trim()) return;
    if (data.goals.length >= 5) return;
    const goal: GapGoal = { id: uid(), category: newCategory, title: newTitle.trim(), target: newTarget.trim() };
    persist({ goals: [...data.goals, goal] });
    setNewTitle(""); setNewTarget("");
  }

  function removeGoal(id: string) {
    persist({ goals: data.goals.filter((g) => g.id !== id) });
  }

  function saveLog() {
    if (!logText.trim()) return;
    persist({ monthly_log: { ...data.monthly_log, [logMonth]: logText.trim() } });
    setLogText("");
  }

  function deleteLog(month: string) {
    const next = { ...data.monthly_log };
    delete next[month];
    persist({ monthly_log: next });
  }

  function toggleMilestone(id: string) {
    persist({ milestones: { ...data.milestones, [id]: !data.milestones[id] } });
  }

  const sortedLogEntries = Object.entries(data.monthly_log).sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Countdown + target year */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(232,160,32,0.7)" }}>Target Application Cycle</p>
            <select
              value={data.target_cycle_year ?? ""}
              onChange={(e) => persist({ target_cycle_year: e.target.value ? parseInt(e.target.value) : null })}
              className="input-dark px-3 py-2 rounded-xl text-sm w-full max-w-xs"
            >
              <option value="">Select target year…</option>
              {[2026, 2027, 2028, 2029, 2030].map((y) => (
                <option key={y} value={y}>{y}–{y + 1} cycle</option>
              ))}
            </select>
          </div>
          {countdown && (
            <div
              className="rounded-xl px-5 py-4 text-center flex-shrink-0"
              style={{ background: "rgba(232,160,32,0.08)", border: "1px solid rgba(232,160,32,0.25)", minWidth: 180 }}
            >
              <p className="text-3xl font-bold" style={{ color: "#E8A020" }}>{countdown.days}</p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>days until {countdown.label}</p>
            </div>
          )}
        </div>
      </div>

      {/* Goals */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "#FFFFFF" }}>Gap Year Goals</h2>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{data.goals.length}/5 set</p>
          </div>
        </div>

        {data.goals.length > 0 && (
          <ul className="space-y-2 mb-5">
            {data.goals.map((g) => {
              const meta = getCategoryMeta(g.category);
              return (
                <li
                  key={g.id}
                  className="flex items-start gap-3 rounded-xl px-3.5 py-3"
                  style={{ background: "rgba(232,160,32,0.04)", border: "1px solid rgba(232,160,32,0.1)" }}
                >
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide flex-shrink-0 mt-0.5"
                    style={{ background: `${meta.color}1f`, color: meta.color, border: `1px solid ${meta.color}40` }}
                  >
                    {meta.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{g.title}</p>
                    {g.target && <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>Target: {g.target}</p>}
                  </div>
                  <button
                    onClick={() => removeGoal(g.id)}
                    className="p-1.5 rounded-lg transition-opacity hover:opacity-100 opacity-50"
                    style={{ color: "#FF4757" }}
                    aria-label="Remove goal"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {data.goals.length < 5 && (
          <div className="grid grid-cols-1 sm:grid-cols-[140px,1fr,140px,auto] gap-2">
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value as GapGoal["category"])} className="input-dark px-3 py-2.5 rounded-xl text-sm">
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Goal title (e.g. Log 500 clinical hours)"
              className="input-dark px-3 py-2.5 rounded-xl text-sm"
            />
            <input
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="Target (optional)"
              className="input-dark px-3 py-2.5 rounded-xl text-sm"
            />
            <button
              onClick={addGoal}
              disabled={!newTitle.trim()}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: "#E8A020", color: "#FFFFFF" }}
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Monthly log */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold mb-1" style={{ color: "#FFFFFF" }}>Monthly Activity Log</h2>
        <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>What did you do this month? Track progress on your goals.</p>

        <div className="grid grid-cols-[140px,1fr,auto] gap-2 mb-4">
          <input
            type="month"
            value={logMonth}
            onChange={(e) => setLogMonth(e.target.value)}
            className="input-dark px-3 py-2.5 rounded-xl text-sm"
          />
          <input
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder="What did you accomplish this month?"
            className="input-dark px-3 py-2.5 rounded-xl text-sm"
          />
          <button
            onClick={saveLog}
            disabled={!logText.trim()}
            className="px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#E8A020", color: "#FFFFFF" }}
          >
            Save
          </button>
        </div>

        {sortedLogEntries.length === 0 ? (
          <p className="text-xs text-center py-4" style={{ color: "rgba(255,255,255,0.4)" }}>No entries logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {sortedLogEntries.map(([month, text]) => (
              <li
                key={month}
                className="rounded-xl px-3.5 py-3 flex items-start gap-3"
                style={{ background: "rgba(232,160,32,0.04)", border: "1px solid rgba(232,160,32,0.1)" }}
              >
                <span className="text-xs font-bold uppercase tracking-wide flex-shrink-0" style={{ color: "#E8A020", minWidth: 76 }}>
                  {formatMonth(month)}
                </span>
                <p className="text-sm flex-1" style={{ color: "rgba(255,255,255,0.85)" }}>{text}</p>
                <button onClick={() => deleteLog(month)} className="p-1 opacity-50 hover:opacity-100" style={{ color: "#FF4757" }} aria-label="Delete log">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Milestones */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "#FFFFFF" }}>Application Milestones</h2>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{milestonesDone}/{MILESTONES.length} complete</p>
          </div>
          <div className="w-32 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(232,160,32,0.1)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${(milestonesDone / MILESTONES.length) * 100}%`,
                background: "#E8A020",
                boxShadow: "0 0 8px rgba(232,160,32,0.5)",
                transition: "width 0.4s",
              }}
            />
          </div>
        </div>

        <ul className="space-y-2">
          {MILESTONES.map((m) => {
            const done = !!data.milestones[m.id];
            return (
              <li key={m.id}>
                <button
                  onClick={() => toggleMilestone(m.id)}
                  className="w-full text-left rounded-xl px-3.5 py-3 flex items-start gap-3 transition-colors"
                  style={{
                    background: done ? "rgba(232,160,32,0.08)" : "rgba(232,160,32,0.02)",
                    border: `1px solid ${done ? "rgba(232,160,32,0.3)" : "rgba(232,160,32,0.08)"}`,
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: done ? "#E8A020" : "transparent",
                      border: `1.5px solid ${done ? "#E8A020" : "rgba(232,160,32,0.4)"}`,
                    }}
                  >
                    {done && (
                      <svg className="w-3 h-3" fill="none" stroke="#0A1628" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium"
                      style={{ color: done ? "rgba(255,255,255,0.55)" : "#FFFFFF", textDecoration: done ? "line-through" : "none" }}
                    >
                      {m.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{m.due}</p>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {savedAt && (
        <p className="text-xs text-center" style={{ color: "rgba(232,160,32,0.5)" }}>
          {isPending ? "Saving…" : `Saved at ${savedAt}`}
        </p>
      )}
    </div>
  );
}
