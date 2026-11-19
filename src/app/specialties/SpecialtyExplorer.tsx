"use client";

import { useMemo, useState } from "react";
import { SPECIALTIES, Specialty, matchRate, type OnlyChoiceResult } from "@/lib/specialties";
import { EmptyState } from "@/components/ui";
import { SourceLine } from "@/components/DataNote";

type Sort = "name" | "md-rate";

function Result({ label, r }: { label: string; r: OnlyChoiceResult }) {
  return (
    <div>
      <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-base tnum">
        <span className="font-semibold">{matchRate(r)}%</span>{" "}
        <span style={{ color: "var(--text-muted)" }}>
          {r.matched.toLocaleString("en-US")} of {r.total.toLocaleString("en-US")} matched
        </span>
      </p>
    </div>
  );
}

function Row({ s }: { s: Specialty }) {
  return (
    <li className="grid gap-x-6 gap-y-2 md:grid-cols-[minmax(0,1fr)_12rem_12rem]" style={{ padding: "var(--sp-2) 0", borderBottom: "1px solid var(--border)" }}>
      <div className="min-w-0">
        <h2 className="text-base" style={{ fontFamily: "var(--font-sans)" }}>{s.name}</h2>
        {s.md ? (
          <SourceLine>Source: NRMP 2025 Main Residency Match, Table 12A ({s.nrmpName}).</SourceLine>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Not in the NRMP 2025 Main Residency Match report, so no figures are shown.</p>
        )}
      </div>
      {s.md && s.do ? (
        <>
          <Result label="U.S. MD seniors who ranked only this" r={s.md} />
          <Result label="U.S. DO seniors who ranked only this" r={s.do} />
        </>
      ) : null}
    </li>
  );
}

export default function SpecialtyExplorer() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<Sort>("name");

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = SPECIALTIES.filter((s) => !q || s.name.toLowerCase().includes(q) || (s.nrmpName ?? "").toLowerCase().includes(q));
    return [...filtered].sort((a, b) => {
      if (sort === "md-rate") {
        const ra = a.md ? matchRate(a.md) : 101;
        const rb = b.md ? matchRate(b.md) : 101;
        if (ra !== rb) return ra - rb;
      }
      return a.name.localeCompare(b.name);
    });
  }, [search, sort]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_16rem]" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-3)" }}>
        <div>
          <label htmlFor="specialty-search" className="label">Search</label>
          <input id="specialty-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Surgery, pediatrics, neurology…" className="field" />
        </div>
        <div>
          <label htmlFor="specialty-sort" className="label">Order</label>
          <select id="specialty-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="field">
            <option value="name">A to Z</option>
            <option value="md-rate">Lowest MD match rate first</option>
          </select>
        </div>
      </div>

      <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-15)" }} aria-live="polite">
        Showing <span className="tnum font-semibold" style={{ color: "var(--text)" }}>{list.length}</span> of {SPECIALTIES.length}
      </p>

      {list.length === 0 ? (
        <EmptyState title="No specialties match">Shorten the search to see more.</EmptyState>
      ) : (
        <ul style={{ borderTop: "1px solid var(--border-strong)" }}>
          {list.map((s) => <Row key={s.id} s={s} />)}
        </ul>
      )}
    </div>
  );
}
