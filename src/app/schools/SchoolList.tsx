"use client";

import { useState } from "react";
import { School, SCHOOLS, ALL_STATES, hasPublishedStats } from "@/lib/schools";
import SchoolActions from "./SchoolActions";
import ExportTargetList from "./ExportTargetList";
import { EmptyState } from "@/components/ui";


type MissionFilter = "Primary Care & Underserved" | "Research" | "Osteopathic" | "Community Health" | "Caribbean";

const MISSION_FILTERS: { label: string; value: MissionFilter; dot: string }[] = [
  { label: "Primary Care & Underserved", value: "Primary Care & Underserved", dot: "var(--data-2)" },
  { label: "Research",                   value: "Research",                   dot: "var(--data-2)" },
  { label: "Osteopathic (DO)",           value: "Osteopathic",                dot: "var(--data-2)" },
  { label: "Community Health",           value: "Community Health",           dot: "var(--data-2)" },
  { label: "Caribbean",                  value: "Caribbean",                  dot: "var(--data-2)" },
];

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

  // Clamped to the real ranges: a GPA of 40 or an MCAT of 9 would otherwise
  // silently match nothing, which reads as a broken filter rather than as
  // invalid input.
  const gpaRaw = parseFloat(gpa);
  const mcatRaw = parseInt(mcat, 10);
  const gpaNum = Number.isFinite(gpaRaw) ? Math.min(4, Math.max(0, gpaRaw)) : NaN;
  const mcatNum = Number.isFinite(mcatRaw) ? Math.min(528, Math.max(472, mcatRaw)) : NaN;
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

  const toggle = (active: boolean) => `btn btn-sm ${active ? "btn-primary" : "btn-secondary"}`;

  return (
    <div>
      <header style={{ marginBottom: "var(--sp-4)" }}>
        <h1 className="text-2xl">Schools</h1>
        <p className="text-sm measure" style={{ color: "var(--text-muted)", marginTop: "var(--sp-h)" }}>
          {SCHOOLS.length} programs with their published applicant averages. Enter your numbers to see where you sit,
          and check each school&apos;s own site before you apply: averages move every cycle.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }} data-tour="schools-stats">
        <div>
          <label htmlFor="gpa-input" className="label">Your GPA</label>
          <input id="gpa-input" type="number" inputMode="decimal" min={0} max={4.0} step={0.01} placeholder="3.70"
            value={gpa} onChange={(e) => setGpa(e.target.value)} className="field tnum" />
        </div>
        <div>
          <label htmlFor="mcat-input" className="label">Your MCAT</label>
          <input id="mcat-input" type="number" inputMode="numeric" min={472} max={528} step={1} placeholder="512"
            value={mcat} onChange={(e) => setMcat(e.target.value)} className="field tnum" />
        </div>
        <div data-tour="schools-home-state">
          <label htmlFor="home-state" className="label">Home state <span className="optional">(optional)</span></label>
          <select id="home-state" value={homeState} onChange={(e) => setHomeState(e.target.value)} className="field">
            <option value="">Not set</option>
            {ALL_STATES.filter((s) => s !== "Intl").map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </section>
      <p className="hint" style={{ marginBottom: "var(--sp-3)" }}>
        A match means within 0.3 of the GPA average and 5 points of the MCAT average. Home state shows only that
        state&apos;s schools that favour residents.
      </p>

      <div className="flex flex-wrap items-center gap-2" style={{ paddingBottom: "var(--sp-2)", borderBottom: "1px solid var(--border)", marginBottom: "var(--sp-2)" }} data-tour="schools-filters" role="group" aria-label="Filters">
        {MISSION_FILTERS.map((f) => {
          const active = missionFilters.has(f.value);
          return (
            <button key={f.value} type="button" onClick={() => toggleMission(f.value)} aria-pressed={active} className={toggle(active)}>
              {f.label}
            </button>
          );
        })}
        {(["In-State Friendly", "Out-of-State Friendly"] as const).map((pref) => {
          const active = inStatePrefFilter === pref;
          return (
            <button key={pref} type="button" onClick={() => setInStatePrefFilter(active ? "" : pref)} aria-pressed={active} className={toggle(active)}>
              {pref}
            </button>
          );
        })}
        <label htmlFor="state-filter" className="sr-only">School state</label>
        <select id="state-filter" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="field" style={{ width: "auto", minHeight: 36, padding: "4px 8px", fontSize: "var(--text-sm)" }}>
          <option value="">Any state</option>
          {ALL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          type="button" onClick={() => setMatchOnly((v) => !v)} disabled={!bothEntered} aria-pressed={matchOnly}
          title={!bothEntered ? "Enter GPA and MCAT above first" : undefined}
          className={toggle(matchOnly)}
        >
          Matches my numbers
        </button>
        {hasActiveFilters && (
          <button type="button" onClick={clearAll} className="btn btn-sm btn-ghost">Clear filters</button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: "var(--sp-15)" }}>
        <p className="text-sm" style={{ color: "var(--text-muted)" }} aria-live="polite">
          Showing <span className="font-semibold tnum" style={{ color: "var(--text)" }}>{filtered.length}</span> of {SCHOOLS.length}
        </p>
        <ExportTargetList schools={SCHOOLS.filter((sc) => statuses[sc.name] === "Applying")} userName={userName} />
      </div>

      {filtered.length === 0 ? (
        <div>
          <EmptyState title="No schools match every filter">
            {`None of the ${SCHOOLS.length} programs fits all of these at once. Removing the state or a mission filter usually brings results back.`}
          </EmptyState>
          <button type="button" onClick={clearAll} className="btn btn-secondary" style={{ marginTop: "var(--sp-2)" }}>
            Clear filters
          </button>
        </div>
      ) : (
        <ul style={{ borderTop: "1px solid var(--border-strong)" }}>
          <li className="hidden md:grid grid-cols-[minmax(0,1fr)_5rem_5rem_minmax(0,18rem)] gap-x-6 text-xs font-semibold" style={{ color: "var(--text-muted)", padding: "var(--sp-1) 0", borderBottom: "1px solid var(--border)" }} aria-hidden="true">
            <span>School</span>
            <span className="text-right">Avg GPA</span>
            <span className="text-right">Avg MCAT</span>
            <span>Your list</span>
          </li>
          {filtered.map((school) => {
            const match = isGoodMatch(school);
            const isInStateForUser = homeState !== "" && school.state === homeState && school.inStatePref === "In-State Friendly";
            return (
              <li
                key={school.name}
                className="grid grid-cols-2 md:grid-cols-[minmax(0,1fr)_5rem_5rem_minmax(0,18rem)] gap-x-6 gap-y-2"
                style={{ padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)" }}
              >
                <div className="col-span-2 md:col-span-1 min-w-0">
                  <h3 className="text-base">{school.name}</h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)", marginTop: 2 }}>
                    {school.degree === "Caribbean" ? "Caribbean program" : `${school.degree} program`} · {school.state} · {school.mission}
                    {school.inStatePref !== "Neutral" ? ` · ${school.inStatePref}` : ""}
                  </p>
                  {(isInStateForUser || match) && (
                    <p style={{ marginTop: "var(--sp-1)" }} className="flex gap-1 flex-wrap">
                      {isInStateForUser && <span className="badge badge-info">In-state for you</span>}
                      {match && <span className="badge badge-success">Matches your numbers</span>}
                    </p>
                  )}
                </div>
                <p className="tnum md:text-right text-sm">
                  <span className="md:hidden text-xs" style={{ color: "var(--text-muted)" }}>Avg GPA </span>
                  {school.avgGpa === null ? <span style={{ color: "var(--text-muted)" }}>Not reported</span> : school.avgGpa.toFixed(2)}
                </p>
                <p className="tnum md:text-right text-sm">
                  <span className="md:hidden text-xs" style={{ color: "var(--text-muted)" }}>Avg MCAT </span>
                  {school.avgMcat === null ? <span style={{ color: "var(--text-muted)" }}>Not reported</span> : school.avgMcat}
                </p>
                <div className="col-span-2 md:col-span-1">
                  <SchoolActions
                    school={school}
                    status={statuses[school.name] ?? null}
                    gpa={gpa !== "" && !isNaN(gpaNum) ? gpaNum : null}
                    mcat={mcat !== "" && !isNaN(mcatNum) ? mcatNum : null}
                    clinicalHours={clinicalHours}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
