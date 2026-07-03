"use client";

import { useState, useMemo } from "react";
import { SPECIALTIES, ICON_PATHS, Specialty, Rating, PatientContact } from "@/lib/specialties";

type CompFilter = "" | "low" | "mid" | "high";
type LifestyleFilter = "" | "demanding" | "moderate" | "balanced";
type SalaryFilter = "" | "u300" | "300_500" | "500_700" | "700plus";
type ResidencyFilter = "" | "3" | "4" | "5" | "6plus";

function patientColor(level: PatientContact): string {
  if (level === "High") return "#000000";
  if (level === "Medium") return "#000000";
  return "rgba(0,0,0,0.5)";
}

function formatSalary(min: number, max: number): string {
  return `$${(min / 1000).toFixed(0)}k – $${(max / 1000).toFixed(0)}k`;
}

function RatingDots({ value, color, label }: { value: Rating; color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "rgba(0,0,0,0.5)", minWidth: 96 }}>{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: i <= value ? color : "rgba(0,0,0,0.04)",
              
            }}
          />
        ))}
      </div>
      <span className="text-[10px]" style={{ color: "rgba(0,0,0,0.45)" }}>{value}/5</span>
    </div>
  );
}

export default function SpecialtyExplorer() {
  const [search, setSearch] = useState("");
  const [comp, setComp] = useState<CompFilter>("");
  const [lifestyle, setLifestyle] = useState<LifestyleFilter>("");
  const [salary, setSalary] = useState<SalaryFilter>("");
  const [residency, setResidency] = useState<ResidencyFilter>("");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return SPECIALTIES.filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.summary.toLowerCase().includes(q)) return false;
      }
      if (comp === "low" && s.competitiveness > 2) return false;
      if (comp === "mid" && (s.competitiveness < 3 || s.competitiveness > 3)) return false;
      if (comp === "high" && s.competitiveness < 4) return false;
      if (lifestyle === "demanding" && s.lifestyle > 2) return false;
      if (lifestyle === "moderate" && (s.lifestyle < 3 || s.lifestyle > 3)) return false;
      if (lifestyle === "balanced" && s.lifestyle < 4) return false;
      const avgSal = (s.salaryMin + s.salaryMax) / 2;
      if (salary === "u300" && avgSal >= 300000) return false;
      if (salary === "300_500" && (avgSal < 300000 || avgSal >= 500000)) return false;
      if (salary === "500_700" && (avgSal < 500000 || avgSal >= 700000)) return false;
      if (salary === "700plus" && avgSal < 700000) return false;
      if (residency === "3" && s.residencyYears !== 3) return false;
      if (residency === "4" && s.residencyYears !== 4) return false;
      if (residency === "5" && s.residencyYears !== 5) return false;
      if (residency === "6plus" && s.residencyYears < 6) return false;
      return true;
    });
  }, [search, comp, lifestyle, salary, residency]);

  const hasActive = search || comp || lifestyle || salary || residency;

  return (
    <div>
      {/* Search + filter bar */}
      <div className="glass-card rounded-2xl p-5 mb-6 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search specialties…"
          className="input-dark w-full px-4 py-2.5 rounded-xl text-sm"
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <FilterSelect label="Competitiveness" value={comp} onChange={(v) => setComp(v as CompFilter)} options={[
            { value: "", label: "Any" },
            { value: "low", label: "Low (1-2)" },
            { value: "mid", label: "Mid (3)" },
            { value: "high", label: "High (4-5)" },
          ]} />
          <FilterSelect label="Lifestyle" value={lifestyle} onChange={(v) => setLifestyle(v as LifestyleFilter)} options={[
            { value: "", label: "Any" },
            { value: "demanding", label: "Demanding (1-2)" },
            { value: "moderate", label: "Moderate (3)" },
            { value: "balanced", label: "Balanced (4-5)" },
          ]} />
          <FilterSelect label="Salary" value={salary} onChange={(v) => setSalary(v as SalaryFilter)} options={[
            { value: "", label: "Any" },
            { value: "u300", label: "Under $300k" },
            { value: "300_500", label: "$300k – $500k" },
            { value: "500_700", label: "$500k – $700k" },
            { value: "700plus", label: "$700k+" },
          ]} />
          <FilterSelect label="Residency" value={residency} onChange={(v) => setResidency(v as ResidencyFilter)} options={[
            { value: "", label: "Any" },
            { value: "3", label: "3 years" },
            { value: "4", label: "4 years" },
            { value: "5", label: "5 years" },
            { value: "6plus", label: "6+ years" },
          ]} />
        </div>

        {hasActive && (
          <button
            type="button"
            onClick={() => { setSearch(""); setComp(""); setLifestyle(""); setSalary(""); setResidency(""); }}
            className="text-xs font-medium"
            style={{ color: "#000000" }}
          >
            Clear all filters
          </button>
        )}
      </div>

      <p className="text-sm mb-4 font-medium" style={{ color: "rgba(0,0,0,0.5)" }}>
        Showing <span className="font-semibold" style={{ color: "#000000" }}>{filtered.length}</span> of {SPECIALTIES.length} specialties
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filtered.map((s) => (
          <Card key={s.id} specialty={s} expanded={openId === s.id} onToggle={() => setOpenId(openId === s.id ? null : s.id)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full glass-card rounded-2xl p-8 text-center text-sm" style={{ color: "rgba(0,0,0,0.5)" }}>
            No specialties match your filters.
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "rgba(0,0,0,0.5)" }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-dark w-full px-3 py-2 rounded-lg text-sm"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Card({ specialty: s, expanded, onToggle }: { specialty: Specialty; expanded: boolean; onToggle: () => void }) {
  return (
    <div
      className="glass-card rounded-2xl p-5 cursor-pointer transition-all"
      style={{ borderColor: expanded ? "rgba(0,0,0,0.2)" : undefined }}
      onClick={onToggle}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#FFFFFF", border: "2px solid #000000" }}
        >
          <svg className="w-5 h-5" fill="none" stroke="#000000" strokeWidth="1.75" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
            {ICON_PATHS[s.icon].split(" M").map((d, i) => (
              <path key={i} d={i === 0 ? d : `M${d}`} />
            ))}
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold leading-tight" style={{ color: "#000000" }}>{s.name}</h3>
            <svg
              className="w-4 h-4 flex-shrink-0 transition-transform"
              style={{ transform: expanded ? "rotate(180deg)" : "none", color: "rgba(0,0,0,0.4)" }}
              fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-1.5 text-xs" style={{ color: "rgba(0,0,0,0.55)" }}>
            <span>{formatSalary(s.salaryMin, s.salaryMax)}</span>
            <span style={{ color: "rgba(0,0,0,0.45)" }}>·</span>
            <span>{s.residencyYears}-yr residency</span>
            <span style={{ color: "rgba(0,0,0,0.45)" }}>·</span>
            <span style={{ color: patientColor(s.patientContact), fontWeight: 600 }}>{s.patientContact} patient contact</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-5 pt-5 space-y-4" style={{ borderTop: "2px solid #000000" }}>
          <div className="space-y-2">
            <RatingDots value={s.competitiveness} color="#000000" label="Competitive" />
            <RatingDots value={s.lifestyle} color="#000000" label="Lifestyle" />
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: "rgba(0,0,0,0.7)" }}>Day in the Life</p>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(0,0,0,0.8)" }}>{s.summary}</p>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: "rgba(0,0,0,0.7)" }}>Top Schools for This Path</p>
            <ul className="space-y-1.5">
              {s.topSchools.map((school) => (
                <li key={school} className="text-xs flex items-start gap-2" style={{ color: "rgba(0,0,0,0.75)" }}>
                  <span style={{ color: "#000000" }}>·</span>
                  {school}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
