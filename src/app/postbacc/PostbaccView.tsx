"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addCourse, deleteCourse, saveProfile, PostbaccCourse, PostbaccProfile } from "./actions";
import { GRADES, calcGpa, formatGpa } from "@/lib/gpa";

const PROGRAM_TYPES = [
  { value: "formal",  label: "Formal Post-bacc",       desc: "Structured program at a college" },
  { value: "diy",     label: "DIY Post-bacc",          desc: "Self-designed coursework" },
  { value: "smp",     label: "Special Master's (SMP)", desc: "Graduate-level med-school-style year" },
];

export default function PostbaccView({
  initialCourses,
  initialProfile,
}: {
  initialCourses: PostbaccCourse[];
  initialProfile: PostbaccProfile;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // ── GPA calculations ────────────────────────────────────────────────
  const cumulativeGpa = useMemo(() => calcGpa(initialCourses), [initialCourses]);
  const bcpmGpa = useMemo(() => calcGpa(initialCourses.filter((c) => c.is_bcpm)), [initialCourses]);
  const totalCredits = initialCourses.reduce((s, c) => s + c.credits, 0);
  const bcpmCredits = initialCourses.filter((c) => c.is_bcpm).reduce((s, c) => s + c.credits, 0);

  function persistProfile(patch: Partial<PostbaccProfile>) {
    const updated = { ...profile, ...patch };
    setProfile(updated);
    startTransition(async () => {
      await saveProfile(patch);
      setSavedAt(new Date().toLocaleTimeString());
    });
  }

  // ── Course form ─────────────────────────────────────────────────────
  const [cName, setCName] = useState("");
  const [cSemester, setCSemester] = useState("");
  const [cCredits, setCCredits] = useState("");
  const [cGrade, setCGrade] = useState("A");
  const [cBcpm, setCBcpm] = useState(true);

  async function handleAddCourse(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const fd = new FormData();
    fd.set("name", cName);
    fd.set("semester", cSemester);
    fd.set("credits", cCredits);
    fd.set("grade", cGrade);
    if (cBcpm) fd.set("is_bcpm", "on");
    startTransition(async () => {
      const res = await addCourse(fd);
      if (res.error) {
        setFormError(res.error);
        return;
      }
      setCName(""); setCSemester(""); setCCredits(""); setCGrade("A"); setCBcpm(true);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteCourse(id);
      router.refresh();
    });
  }

  // ── Render ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Program type selector */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold mb-1" style={{ color: "#FFFFFF" }}>Program Type</h2>
        <p className="text-xs mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>Tell us which post-bacc path you&apos;re on.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {PROGRAM_TYPES.map((pt) => {
            const active = profile.program_type === pt.value;
            return (
              <button
                key={pt.value}
                onClick={() => persistProfile({ program_type: pt.value })}
                className="text-left rounded-xl px-4 py-3 transition-all"
                style={{
                  background: active ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? "#FFFFFF" : "rgba(255,255,255,0.04)"}`,
                  boxShadow: active ? "0 0 14px rgba(255,255,255,0.1)" : "none",
                }}
              >
                <p className="text-sm font-bold mb-0.5" style={{ color: active ? "#FFFFFF" : "#FFFFFF" }}>{pt.label}</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{pt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* GPA dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GpaCard
          label="Cumulative GPA"
          sub={`${totalCredits} credits across ${initialCourses.length} ${initialCourses.length === 1 ? "course" : "courses"}`}
          value={cumulativeGpa}
          goal={profile.gpa_goal}
          onGoalChange={(g) => persistProfile({ gpa_goal: g })}
        />
        <GpaCard
          label="BCPM (Science) GPA"
          sub={`${bcpmCredits} BCPM credits`}
          value={bcpmGpa}
          goal={profile.bcpm_goal}
          onGoalChange={(g) => persistProfile({ bcpm_goal: g })}
        />
      </div>

      {/* Add course form */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: "#FFFFFF" }}>Add a Course</h2>
        <form onSubmit={handleAddCourse} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              placeholder="Course name (e.g. Organic Chemistry I)"
              className="input-dark px-3 py-2.5 rounded-xl text-sm"
              required
            />
            <input
              value={cSemester}
              onChange={(e) => setCSemester(e.target.value)}
              placeholder="Semester (e.g. Fall 2026)"
              className="input-dark px-3 py-2.5 rounded-xl text-sm"
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-[120px,140px,1fr,auto] gap-3 items-center">
            <input
              value={cCredits}
              onChange={(e) => setCCredits(e.target.value)}
              type="number" min="0.5" max="20" step="0.5"
              placeholder="Credits"
              className="input-dark px-3 py-2.5 rounded-xl text-sm"
              required
            />
            <select
              value={cGrade}
              onChange={(e) => setCGrade(e.target.value)}
              className="input-dark px-3 py-2.5 rounded-xl text-sm"
            >
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer" style={{ color: "rgba(255,255,255,0.85)" }}>
              <input
                type="checkbox"
                checked={cBcpm}
                onChange={(e) => setCBcpm(e.target.checked)}
                className="accent-white w-4 h-4"
              />
              BCPM course (Bio, Chem, Physics, Math)
            </label>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2.5 rounded-xl font-semibold text-sm disabled:opacity-40"
              style={{ background: "#FFFFFF", color: "#000000" }}
            >
              Add Course
            </button>
          </div>
          {formError && <p className="text-xs" style={{ color: "#DC2626" }}>{formError}</p>}
        </form>
      </div>

      {/* Course list */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold mb-4" style={{ color: "#FFFFFF" }}>Your Courses</h2>
        {initialCourses.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "rgba(255,255,255,0.5)" }}>
            No courses logged yet. Add your first course above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ minWidth: 600 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th className="text-left px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Course</th>
                  <th className="text-left px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Semester</th>
                  <th className="text-right px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Credits</th>
                  <th className="text-center px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Grade</th>
                  <th className="text-center px-2 py-2 text-xs uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>BCPM</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {initialCourses.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <td className="px-2 py-3" style={{ color: "#FFFFFF" }}>{c.name}</td>
                    <td className="px-2 py-3" style={{ color: "rgba(255,255,255,0.65)" }}>{c.semester || "—"}</td>
                    <td className="px-2 py-3 text-right" style={{ color: "rgba(255,255,255,0.85)" }}>{c.credits}</td>
                    <td className="px-2 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-9 px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: "rgba(255,255,255,0.04)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.12)" }}>
                        {c.grade}
                      </span>
                    </td>
                    <td className="px-2 py-3 text-center">
                      {c.is_bcpm ? (
                        <svg className="w-4 h-4 mx-auto" fill="none" stroke="#FFFFFF" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span style={{ color: "rgba(255,255,255,0.45)" }}>—</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 opacity-50 hover:opacity-100" style={{ color: "#DC2626" }} aria-label="Delete course">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-base font-semibold mb-1" style={{ color: "#FFFFFF" }}>Notes</h2>
        <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Track strategy, advisor meetings, anything else.</p>
        <textarea
          value={profile.notes ?? ""}
          onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
          onBlur={() => persistProfile({ notes: profile.notes })}
          rows={4}
          placeholder="Write notes here. Auto-saves when you click away."
          className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm resize-none"
        />
      </div>

      {savedAt && (
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.2)" }}>
          {isPending ? "Saving…" : `Saved at ${savedAt}`}
        </p>
      )}
    </div>
  );
}

function GpaCard({ label, sub, value, goal, onGoalChange }: {
  label: string;
  sub: string;
  value: number | null;
  goal: number;
  onGoalChange: (g: number) => void;
}) {
  const [editingGoal, setEditingGoal] = useState(goal.toString());
  useEffect(() => setEditingGoal(goal.toString()), [goal]);

  const pct = value === null ? 0 : Math.min(100, (value / goal) * 100);
  const metGoal = value !== null && value >= goal;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.7)" }}>{label}</p>
        {value !== null && (
          <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: metGoal ? "#FFFFFF" : "rgba(255,255,255,0.5)" }}>
            {metGoal ? "Goal Met ✓" : `${pct.toFixed(0)}% to goal`}
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-4xl font-bold" style={{ color: "#FFFFFF" }}>{formatGpa(value)}</span>
        <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>/ 4.00</span>
      </div>

      <div className="w-full h-2 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: "100%",
            transform: `scaleX(${pct / 100})`,
            transformOrigin: "left center",
            background: metGoal ? "#FFFFFF" : "#FFFFFF",
            transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      <p className="text-xs mb-2" style={{ color: "rgba(255,255,255,0.5)" }}>{sub}</p>

      <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <label className="text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>Goal:</label>
        <input
          type="number" min="2.0" max="4.0" step="0.05"
          value={editingGoal}
          onChange={(e) => setEditingGoal(e.target.value)}
          onBlur={() => {
            const n = parseFloat(editingGoal);
            if (Number.isFinite(n) && n >= 2 && n <= 4) onGoalChange(n);
            else setEditingGoal(goal.toString());
          }}
          className="input-dark px-2 py-1 rounded-md text-xs w-16"
        />
      </div>
    </div>
  );
}
