"use client";

import { useState, useMemo } from "react";
import { SPECIALTIES, Specialty, Rating } from "@/lib/specialties";
import { EmptyState } from "@/components/ui";

type CompFilter = "" | "low" | "mid" | "high";
type LifestyleFilter = "" | "demanding" | "moderate" | "balanced";
type SalaryFilter = "" | "u300" | "300_500" | "500_700" | "700plus";
type ResidencyFilter = "" | "3" | "4" | "5" | "6plus";

function formatSalary(min: number, max: number): string {
  return `$${(min / 1000).toFixed(0)}k to $${(max / 1000).toFixed(0)}k`;
}

function Rated({ value, label }: { value: Rating; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs" style={{ color: "var(--text-muted)", minWidth: 104 }}>{label}</span>
      <span className="meter" style={{ width: 120 }} aria-hidden="true">
        <span className="meter-fill" style={{ width: `${value * 20}%` }} />
      </span>
      <span className="text-xs tnum">{value} of 5</span>
    </div>
  );
}

export default function SpecialtyExplorer() {
  const [search, setSearch] = useState("");
  const [comp, setComp] = useState<CompFilter>("");
  const [lifestyle, setLifestyle] = useState<LifestyleFilter>("");
  const [salary, setSalary] = useState<SalaryFilter>("");
  const [residency, setResidency] = useState<ResidencyFilter>("");

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
      <div style={{ display: "grid", gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
        <div>
          <label htmlFor="specialty-search" className="label">Search</label>
          <input
            id="specialty-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cardiology, surgery, children…"
            className="field"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: "var(--sp-2)" }}>
          <FilterSelect label="Competitiveness" value={comp} onChange={(v) => setComp(v as CompFilter)} options={[
            { value: "", label: "Any" },
            { value: "low", label: "Low (1 or 2)" },
            { value: "mid", label: "Mid (3)" },
            { value: "high", label: "High (4 or 5)" },
          ]} />
          <FilterSelect label="Lifestyle" value={lifestyle} onChange={(v) => setLifestyle(v as LifestyleFilter)} options={[
            { value: "", label: "Any" },
            { value: "demanding", label: "Demanding (1 or 2)" },
            { value: "moderate", label: "Moderate (3)" },
            { value: "balanced", label: "Balanced (4 or 5)" },
          ]} />
          <FilterSelect label="Salary" value={salary} onChange={(v) => setSalary(v as SalaryFilter)} options={[
            { value: "", label: "Any" },
            { value: "u300", label: "Under $300k" },
            { value: "300_500", label: "$300k to $500k" },
            { value: "500_700", label: "$500k to $700k" },
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
            className="btn btn-sm btn-ghost justify-self-start"
          >
            Clear filters
          </button>
        )}
      </div>

      <p className="text-sm mb-4 font-medium" style={{ color: "var(--text-muted)" }}>
        Showing <span className="font-semibold" style={{ color: "var(--text)" }}>{filtered.length}</span> of {SPECIALTIES.length} specialties
      </p>

      {filtered.length === 0 ? (
        <EmptyState title="No specialties match">Remove a filter or shorten the search to see more.</EmptyState>
      ) : (
        <ul style={{ borderTop: "1px solid var(--border-strong)" }}>
          {filtered.map((s) => (
            <Row key={s.id} specialty={s} />
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <label htmlFor={`filter-${label}`} className="label">{label}</label>
      <select id={`filter-${label}`} value={value} onChange={(e) => onChange(e.target.value)} className="field">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Row({ specialty: s }: { specialty: Specialty }) {
  return (
    <li style={{ borderBottom: "1px solid var(--border)" }}>
      <details className="group">
        <summary
          className="grid gap-x-6 gap-y-1 md:grid-cols-[minmax(0,1fr)_9rem_7rem_10rem] items-baseline cursor-pointer"
          style={{ padding: "var(--sp-2) 0", listStyle: "none" }}
        >
          <span className="text-base font-semibold">
            {s.name}
            <span aria-hidden="true" className="text-xs" style={{ color: "var(--text-muted)", marginLeft: 8 }}>
              <span className="group-open:hidden">Show</span>
              <span className="hidden group-open:inline">Hide</span>
            </span>
          </span>
          <span className="text-sm tnum" style={{ color: "var(--text-muted)" }}>{formatSalary(s.salaryMin, s.salaryMax)}</span>
          <span className="text-sm tnum" style={{ color: "var(--text-muted)" }}>{s.residencyYears} yr residency</span>
          <span className="text-sm" style={{ color: "var(--text-muted)" }}>{s.patientContact} patient contact</span>
        </summary>
        <div className="grid md:grid-cols-12" style={{ gap: "var(--sp-3)", padding: "0 0 var(--sp-3)" }}>
          <p className="md:col-span-7 text-sm measure">{s.summary}</p>
          <div className="md:col-span-5" style={{ display: "grid", gap: "var(--sp-15)" }}>
            <div style={{ display: "grid", gap: "var(--sp-1)" }}>
              <Rated value={s.competitiveness} label="Competitiveness" />
              <Rated value={s.lifestyle} label="Lifestyle balance" />
            </div>
            <div>
              <p className="text-xs font-semibold" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-h)" }}>Strong programs for this path</p>
              <ul className="text-sm" style={{ display: "grid", gap: 2 }}>
                {s.topSchools.map((school) => <li key={school}>{school}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </details>
    </li>
  );
}
