"use client";

import { useState } from "react";
import { School, SCHOOLS, ALL_STATES, hasPublishedStats } from "@/lib/schools";
import SchoolActions from "./SchoolActions";
import ExportTargetList from "./ExportTargetList";
import { EmptyState } from "@/components/EmptyStates";


type MissionFilter = "Primary Care & Underserved" | "Research" | "Osteopathic" | "Community Health" | "Caribbean";

const MISSION_FILTERS: { label: string; value: MissionFilter; dot: string }[] = [
  { label: "Primary Care & Underserved", value: "Primary Care & Underserved", dot: "var(--text-primary)" },
  { label: "Research",                   value: "Research",                   dot: "var(--text-primary)" },
  { label: "Osteopathic (DO)",           value: "Osteopathic",                dot: "var(--text-primary)" },
  { label: "Community Health",           value: "Community Health",           dot: "var(--text-primary)" },
  { label: "Caribbean",                  value: "Caribbean",                  dot: "var(--text-primary)" },
];

function getMissionBadgeStyle(mission: string): React.CSSProperties {
  const m = mission.toLowerCase();
  if (m.includes("caribbean"))
    return { background: "#FFFFFF", color: "var(--text-primary)", border: "1px solid var(--border-strong)" };
  if (m.includes("osteopathic"))
    return { background: "rgba(22,36,29,0.1)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" };
  if (m.includes("community health"))
    return { background: "#FFFFFF", color: "var(--text-primary)", border: "1px solid var(--border-strong)" };
  if (m.includes("underserved") && m.includes("primary"))
    return { background: "rgba(22,36,29,0.1)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" };
  if (m.includes("underserved"))
    return { background: "rgba(22,36,29,0.1)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" };
  if (m.includes("primary care"))
    return { background: "#FFFFFF", color: "var(--text-primary)", border: "1px solid var(--border-strong)" };
  return { background: "#FFFFFF", color: "var(--text-primary)", border: "1px solid var(--border-strong)" };
}

export default function SchoolList({
  userEmail: _userEmail,
  statuses = {},
  clinicalHours = 0,
  userName = "",
}: {
  userEmail: string;
  statuses?: Record<string, "Target" | "Applying">;
  clinicalHours?: number;
  userName?: string;
}) {
  const [gpa, setGpa] = useState("");
  const [mcat, setMcat] = useState("");
  const [missionFilters, setMissionFilters] = useState<Set<MissionFilter>>(new Set());
  const [stateFilter, setStateFilter] = useState("");
  const [homeState, setHomeState] = useState("");
  const [inStatePrefFilter, setInStatePrefFilter] = useState<"" | "In-State Friendly" | "Out-of-State Friendly">("");
  const [matchOnly, setMatchOnly] = useState(false);

  const gpaNum = parseFloat(gpa);
  const mcatNum = parseInt(mcat, 10);
  const bothEntered = gpa !== "" && !isNaN(gpaNum) && mcat !== "" && !isNaN(mcatNum);

  function isGoodMatch(school: School): boolean {
    if (!bothEntered) return false;
    // A school with no published averages cannot be matched against. Treating
    // null as 0 would make every such school look wildly out of range; treating
    // it as a match would be worse. It is simply not comparable.
    if (!hasPublishedStats(school)) return false;
    return Math.abs(school.avgGpa! - gpaNum) <= 0.3 && Math.abs(school.avgMcat! - mcatNum) <= 5;
  }

  function toggleMission(value: MissionFilter) {
    setMissionFilters((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  }

  function clearAll() {
    setMissionFilters(new Set());
    setStateFilter("");
    setHomeState("");
    setInStatePrefFilter("");
    setMatchOnly(false);
  }

  const hasActiveFilters = missionFilters.size > 0 || stateFilter !== "" || homeState !== "" || inStatePrefFilter !== "" || matchOnly;

  const filtered = SCHOOLS.filter((s) => {
    const m = s.mission.toLowerCase();
    if (missionFilters.size > 0) {
      const missionMatch = [...missionFilters].some((f) => {
        if (f === "Primary Care & Underserved") return m.includes("underserved") || m.includes("primary care");
        if (f === "Research")         return m.includes("research");
        if (f === "Osteopathic")      return m.includes("osteopathic");
        if (f === "Community Health") return m.includes("community health");
        if (f === "Caribbean")        return m.includes("caribbean");
        return false;
      });
      if (!missionMatch) return false;
    }
    if (stateFilter && s.state !== stateFilter) return false;
    if (inStatePrefFilter && s.inStatePref !== inStatePrefFilter) return false;
    // home state: show only schools in the user's state that are in-state friendly
    if (homeState && !(s.state === homeState && s.inStatePref === "In-State Friendly")) return false;
    if (matchOnly && !isGoodMatch(s)) return false;
    return true;
  });

  // Inactive filter button style
  const inactiveFilterStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid var(--border-strong)",
    color: "var(--text-primary)",
  };
  // Active filter button style
  const activeFilterStyle: React.CSSProperties = {
    background: "var(--accent)",
    border: "1px solid var(--border-strong)",
    color: "#FFFFFF",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Medical School Explorer</h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(22,36,29,0.5)" }}>
          See how your stats compare to average applicant profiles across {SCHOOLS.length} programs.
        </p>
      </div>

      {/* Stats inputs */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
          <div>
            <label htmlFor="gpa-input" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(22,36,29,0.85)" }}>GPA</label>
            <input
              id="gpa-input" type="number" min={0} max={4.0} step={0.01} placeholder="e.g. 3.7"
              value={gpa} onChange={(e) => setGpa(e.target.value)}
              className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>
          <div>
            <label htmlFor="mcat-input" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(22,36,29,0.85)" }}>MCAT</label>
            <input
              id="mcat-input" type="number" min={472} max={528} step={1} placeholder="e.g. 512"
              value={mcat} onChange={(e) => setMcat(e.target.value)}
              className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm"
            />
          </div>
        </div>
        <p className="text-xs" style={{ color: "rgba(22,36,29,0.4)" }}>Highlights schools within ±0.3 GPA and ±5 MCAT points of your stats.</p>
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--border-strong)" }}>
          <label htmlFor="home-state" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(22,36,29,0.85)" }}>
            My Home State <span className="font-normal" style={{ color: "rgba(22,36,29,0.4)" }}>(optional - highlights in-state schools for you)</span>
          </label>
          <select
            id="home-state"
            value={homeState}
            onChange={(e) => setHomeState(e.target.value)}
            className="input-dark w-full sm:w-64 px-3.5 py-2.5 rounded-xl text-sm"
          >
            <option value="">Select your state...</option>
            {ALL_STATES.filter((s) => s !== "Intl").map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Filter bar */}
      <div className="glass-card rounded-2xl p-4 mb-5">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
          {MISSION_FILTERS.map((f) => {
            const active = missionFilters.has(f.value);
            return (
              <button
                key={f.value} type="button" onClick={() => toggleMission(f.value)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
                style={active ? activeFilterStyle : inactiveFilterStyle}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: active ? "#FFFFFF" : "var(--text-primary)" }}
                />
                {f.label}
              </button>
            );
          })}

          {/* Divider */}
          <span className="w-px h-5 mx-1 self-center flex-shrink-0" style={{ background: "#FFFFFF" }} />

          {/* In-state pref filter buttons */}
          {(["In-State Friendly", "Out-of-State Friendly"] as const).map((pref) => {
            const active = inStatePrefFilter === pref;
            return (
              <button
                key={pref} type="button"
                onClick={() => setInStatePrefFilter(active ? "" : pref)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors flex-shrink-0"
                style={active ? activeFilterStyle : inactiveFilterStyle}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: active ? "var(--text-primary)" : pref === "In-State Friendly" ? "var(--text-primary)" : "var(--text-primary)" }}
                />
                {pref}
              </button>
            );
          })}

          {/* Divider */}
          <span className="w-px h-5 mx-1 self-center flex-shrink-0" style={{ background: "#FFFFFF" }} />

          <select
            value={stateFilter} onChange={(e) => setStateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl text-sm font-medium transition-colors focus:outline-none flex-shrink-0"
            style={stateFilter ? activeFilterStyle : inactiveFilterStyle}
          >
            <option value="">School State</option>
            {ALL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <button
            type="button" onClick={() => setMatchOnly((v) => !v)}
            disabled={!bothEntered}
            title={!bothEntered ? "Enter GPA and MCAT above first" : undefined}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            style={matchOnly ? activeFilterStyle : inactiveFilterStyle}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: matchOnly ? "var(--text-primary)" : "var(--text-primary)" }}
            />
            My Stats Match
          </button>
        </div>

        {hasActiveFilters && (
          <div className="pt-2">
            <button
              type="button" onClick={clearAll}
              className="text-xs font-medium px-2 py-1"
              style={{ color: "var(--text-primary)" }}
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
          Showing <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{filtered.length}</span> of {SCHOOLS.length} schools
        </p>
        <ExportTargetList
          schools={SCHOOLS.filter((sc) => statuses[sc.name] === "Applying")}
          userName={userName}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((school) => {
          const match = isGoodMatch(school);
          const isInStateForUser = homeState !== "" && school.state === homeState && school.inStatePref === "In-State Friendly";
          return (
            <div
              key={school.name}
              className="glass-card rounded-2xl p-5 transition-all"
              style={
                isInStateForUser
                  ? { background: "rgba(22,36,29,0.1)", borderColor: "var(--text-primary)" }
                  : match
                  ? { background: "#FFFFFF", borderColor: "var(--text-primary)" }
                  : {}
              }
            >
              <div className="mb-3">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-sm font-bold leading-snug" style={{ color: "var(--text-primary)" }}>{school.name}</h3>
                  {isInStateForUser && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold whitespace-nowrap"
                      style={{ background: "rgba(22,36,29,0.1)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" }}
                    >
                      In-State for You ✓
                    </span>
                  )}
                  {match && !isInStateForUser && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-semibold whitespace-nowrap"
                      style={{ background: "#FFFFFF", color: "var(--text-primary)", border: "1px solid var(--border-strong)" }}
                    >
                      Good Match
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium"
                  style={{ background: "#FFFFFF", color: "rgba(22,36,29,0.55)", border: "1px solid var(--border-strong)" }}
                >
                  {school.state}
                </span>
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium"
                  style={getMissionBadgeStyle(school.mission)}
                >
                  {school.mission}
                </span>
                {school.inStatePref !== "Neutral" && (
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium"
                    style={
                      school.inStatePref === "In-State Friendly"
                        ? { background: "rgba(22,36,29,0.1)", color: "var(--text-primary)", border: "1px solid var(--border-strong)" }
                        : { background: "#FFFFFF", color: "var(--text-primary)", border: "1px solid var(--border-strong)" }
                    }
                  >
                    {school.inStatePref}
                  </span>
                )}
              </div>

              <SchoolActions
                school={school}
                status={statuses[school.name] ?? null}
                gpa={gpa !== "" && !isNaN(gpaNum) ? gpaNum : null}
                mcat={mcat !== "" && !isNaN(mcatNum) ? mcatNum : null}
                clinicalHours={clinicalHours}
              />

              <div className="flex items-center gap-3">
                <div
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                  style={{ background: "#FFFFFF", border: "1px solid var(--border-strong)" }}
                >
                  <span className="text-xs font-medium" style={{ color: "rgba(22,36,29,0.55)" }}>Avg GPA</span>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{school.avgGpa === null ? "Not reported" : school.avgGpa.toFixed(2)}</span>
                </div>
                <div
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
                  style={{ background: "#FFFFFF", border: "1px solid var(--border-strong)" }}
                >
                  <span className="text-xs font-medium" style={{ color: "rgba(22,36,29,0.55)" }}>Avg MCAT</span>
                  <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{school.avgMcat === null ? "Not reported" : school.avgMcat}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-1 sm:col-span-2">
            <EmptyState
              kind="schools"
              title="No schools match these filters"
              body="Nothing in the list of 149 programs fits every filter at once. Widening the state or mission filter usually brings results back."
            />
            <button type="button" onClick={clearAll} className="btn-ghost text-sm font-semibold" style={{ padding: "8px var(--sp-2)" }}>
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
