"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkImportExperiences, ImportRow } from "./actions";
import { formatHours } from "@/lib/types";

type CategoryDisplay = "Clinical Work" | "Shadowing" | "Research" | "Volunteering" | "Other";

const CATEGORY_MAP: Record<string, ImportRow["type"]> = {
  "clinical work": "clinical_work",
  "shadowing":     "shadowing",
  "research":      "research",
  "volunteering":  "volunteer",
  "volunteer":     "volunteer",
  "other":         "other",
};

const CATEGORY_LABELS: Record<ImportRow["type"], CategoryDisplay> = {
  clinical_work: "Clinical Work",
  shadowing:     "Shadowing",
  research:      "Research",
  volunteer:     "Volunteering",
  other:         "Other",
};

const CATEGORY_COLOR: Record<ImportRow["type"], string> = {
  shadowing:     "#FFFFFF",
  volunteer:     "#FFFFFF",
  clinical_work: "#FFFFFF",
  research:      "#FFFFFF",
  other:         "rgba(255,255,255,0.6)",
};

// ── CSV parsing ────────────────────────────────────────────────────────────
// Minimal RFC-4180-ish CSV parser. Handles quoted fields, escaped quotes,
// and quoted newlines. No deps.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  // Strip BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"') { inQuotes = true; i++; continue; }
    if (c === ",") { row.push(field); field = ""; i++; continue; }
    if (c === "\n" || c === "\r") {
      // Push current row, handle CRLF
      row.push(field); field = "";
      // Only push non-empty rows (avoid trailing newline producing an empty row)
      if (row.some((f) => f.length > 0)) rows.push(row);
      row = [];
      if (c === "\r" && text[i + 1] === "\n") i += 2; else i++;
      continue;
    }
    field += c; i++;
  }
  // Last field
  row.push(field);
  if (row.some((f) => f.length > 0)) rows.push(row);
  return rows;
}

function normalizeDate(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // MM/DD/YYYY or M/D/YYYY
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    const [, m, d, y] = us;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // YYYY/MM/DD
  const isoSlash = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (isoSlash) {
    const [, y, m, d] = isoSlash;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  // Try Date.parse as last resort
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return null;
}

interface ParsedRow {
  selected: boolean;
  row: ImportRow | null;
  raw: string[];
  errors: string[];
}

function rowsFromCsv(matrix: string[][]): ParsedRow[] {
  if (matrix.length === 0) return [];

  // Find header row — first row containing "Experience Name" or skip first row
  const headerIdx = 0;
  const headers = matrix[headerIdx].map((h) => h.trim().toLowerCase());

  const find = (...names: string[]) => headers.findIndex((h) => names.includes(h));
  const titleCol = find("experience name", "title", "name");
  const orgCol   = find("organization", "org");
  const catCol   = find("category", "type");
  const startCol = find("start date", "start", "from");
  const endCol   = find("end date", "end", "to");
  const hoursCol = find("hours");
  const descCol  = find("description", "desc");

  return matrix.slice(1).map((raw): ParsedRow => {
    const errors: string[] = [];
    const get = (i: number) => (i >= 0 ? (raw[i] ?? "").trim() : "");

    const title = get(titleCol);
    const organization = get(orgCol);
    const catText = get(catCol).toLowerCase();
    const startRaw = get(startCol);
    const endRaw = get(endCol);
    const hoursRaw = get(hoursCol);
    const description = get(descCol);

    if (!title) errors.push("Missing experience name");
    if (!organization) errors.push("Missing organization");

    const type = CATEGORY_MAP[catText];
    if (!type) errors.push(`Invalid category "${get(catCol)}" — use one of: Clinical Work, Shadowing, Research, Volunteering, Other`);

    const start_date = normalizeDate(startRaw);
    if (!start_date) errors.push("Invalid or missing start date");

    const end_date = endRaw ? normalizeDate(endRaw) : null;
    if (endRaw && !end_date) errors.push("Invalid end date format");

    const hours = parseFloat(hoursRaw);
    if (!hoursRaw || isNaN(hours) || hours <= 0) errors.push("Invalid hours");

    const row: ImportRow | null = errors.length === 0 ? {
      title,
      organization,
      type: type!,
      start_date: start_date!,
      end_date,
      hours,
      description: description || null,
    } : null;

    return { selected: errors.length === 0, row, raw, errors };
  });
}

const TEMPLATE_CSV = `Experience Name,Organization,Category,Start Date,End Date,Hours,Description
Cardiology Shadowing,UCSF Medical Center,Shadowing,2024-06-01,2024-08-15,40,Shadowed Dr. Chen during morning rounds and outpatient cardiology clinic.
Free Clinic Volunteer,Bayview Community Health Clinic,Volunteering,2024-01-15,,120,
Cancer Research Assistant,Stanford Cancer Institute,Research,2023-09-01,2024-05-30,300,Independent research project investigating immunotherapy response in melanoma patients under Dr. Lee.
`;

export default function ImportView() {
  const router = useRouter();
  const [rows, setRows] = useState<ParsedRow[] | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [result, setResult] = useState<{ kind: "success" | "error"; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File) {
    setResult(null);
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? "");
      try {
        const matrix = parseCsv(text);
        if (matrix.length < 2) {
          setResult({ kind: "error", msg: "CSV must have a header row plus at least one data row." });
          setRows(null);
          return;
        }
        const parsed = rowsFromCsv(matrix);
        setRows(parsed);
      } catch (err) {
        const m = err instanceof Error ? err.message : "Unknown parse error";
        setResult({ kind: "error", msg: `Could not parse CSV: ${m}` });
      }
    };
    reader.onerror = () => setResult({ kind: "error", msg: "Could not read file." });
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clinilog-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setRows(null);
    setFileName(null);
    setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function toggleRow(i: number) {
    if (!rows) return;
    const next = [...rows];
    if (next[i].errors.length > 0) return; // can't select error rows
    next[i] = { ...next[i], selected: !next[i].selected };
    setRows(next);
  }

  function toggleAll(checked: boolean) {
    if (!rows) return;
    setRows(rows.map((r) => (r.errors.length > 0 ? r : { ...r, selected: checked })));
  }

  function doImport() {
    if (!rows) return;
    const validRows = rows.filter((r) => r.selected && r.row).map((r) => r.row!);
    if (validRows.length === 0) {
      setResult({ kind: "error", msg: "No valid rows selected to import." });
      return;
    }
    startTransition(async () => {
      const res = await bulkImportExperiences(validRows);
      if (res.success) {
        setResult({ kind: "success", msg: `Imported ${res.inserted} experience${res.inserted === 1 ? "" : "s"}!` });
        setRows(null);
        setFileName(null);
        // Refresh dashboard data when user navigates back
        router.refresh();
      } else {
        setResult({ kind: "error", msg: res.error ?? "Import failed." });
      }
    });
  }

  const validCount = rows?.filter((r) => r.row && r.selected).length ?? 0;
  const errorCount = rows?.filter((r) => r.errors.length > 0).length ?? 0;
  const allChecked = rows ? rows.every((r) => r.errors.length > 0 || r.selected) : false;

  return (
    <div className="space-y-6">
      {/* Template download card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold mb-1" style={{ color: "#FFFFFF" }}>
              Step 1 — Download the template
            </h2>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              Fill it in with your experiences, then upload below. Columns: Experience Name,
              Organization, Category, Start Date, End Date (optional), Hours, Description (optional).
            </p>
          </div>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-opacity hover:opacity-90"
            style={{ background: "rgba(255,255,255,0.04)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Template
          </button>
        </div>
      </div>

      {/* Upload area */}
      {!rows && (
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#FFFFFF" }}>
            Step 2 — Upload your CSV
          </h2>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file) handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            className="rounded-xl px-6 py-12 flex flex-col items-center justify-center cursor-pointer transition-all"
            style={{
              background: dragOver ? "rgba(232,160,32,0.08)" : "rgba(232,160,32,0.03)",
              border: `2px dashed ${dragOver ? "#FFFFFF" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
              className="hidden"
            />
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)" }}
            >
              <svg className="w-6 h-6" fill="none" stroke="#FFFFFF" strokeWidth="1.75" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#FFFFFF" }}>
              {dragOver ? "Drop your file here" : "Drag and drop your CSV here"}
            </p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              or <span style={{ color: "#FFFFFF" }}>click to browse</span> · CSV files only
            </p>
          </div>
        </div>
      )}

      {/* Result banner */}
      {result && (
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-3"
          style={
            result.kind === "success"
              ? { background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFFFFF" }
              : { background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#DC2626" }
          }
        >
          <svg className="w-5 h-5 flex-shrink-0 mt-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {result.kind === "success" ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <p className="text-sm font-medium flex-1">{result.msg}</p>
        </div>
      )}

      {/* Preview table */}
      {rows && rows.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <div>
              <h2 className="text-sm font-semibold mb-1" style={{ color: "#FFFFFF" }}>
                Step 3 — Review and confirm
              </h2>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
                {fileName} · <span style={{ color: "#FFFFFF" }}>{validCount} selected</span>
                {errorCount > 0 && <> · <span style={{ color: "#DC2626" }}>{errorCount} with errors</span></>}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}
              >
                Choose different file
              </button>
            </div>
          </div>

          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm" style={{ minWidth: 720 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <th className="text-left px-2 py-2" style={{ width: 30 }}>
                    <input
                      type="checkbox"
                      checked={allChecked}
                      onChange={(e) => toggleAll(e.target.checked)}
                      className="accent-amber-500"
                    />
                  </th>
                  <th className="text-left px-2 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Title</th>
                  <th className="text-left px-2 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Organization</th>
                  <th className="text-left px-2 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Category</th>
                  <th className="text-left px-2 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Dates</th>
                  <th className="text-right px-2 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.5)" }}>Hours</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const hasError = r.errors.length > 0;
                  return (
                    <tr
                      key={i}
                      style={{
                        borderBottom: "1px solid rgba(232,160,32,0.06)",
                        backgroundColor: hasError ? "rgba(239,68,68,0.05)" : (r.selected ? "rgba(232,160,32,0.03)" : "transparent"),
                      }}
                    >
                      <td className="px-2 py-3 align-top">
                        <input
                          type="checkbox"
                          disabled={hasError}
                          checked={r.selected && !hasError}
                          onChange={() => toggleRow(i)}
                          className="accent-amber-500"
                          style={{ opacity: hasError ? 0.3 : 1 }}
                        />
                      </td>
                      <td className="px-2 py-3 align-top">
                        <p className="font-medium" style={{ color: hasError ? "rgba(239,68,68,0.85)" : "#FFFFFF" }}>
                          {r.row?.title || r.raw[0] || "—"}
                        </p>
                        {hasError && (
                          <ul className="mt-1 space-y-0.5">
                            {r.errors.map((e, j) => (
                              <li key={j} className="text-xs" style={{ color: "#DC2626" }}>· {e}</li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-2 py-3 align-top text-xs" style={{ color: "rgba(255,255,255,0.7)" }}>
                        {r.row?.organization || r.raw[1] || "—"}
                      </td>
                      <td className="px-2 py-3 align-top">
                        {r.row?.type ? (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              background: `${CATEGORY_COLOR[r.row.type]}1a`,
                              color: CATEGORY_COLOR[r.row.type],
                              border: `1px solid ${CATEGORY_COLOR[r.row.type]}40`,
                            }}
                          >
                            {CATEGORY_LABELS[r.row.type]}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: "rgba(239,68,68,0.7)" }}>—</span>
                        )}
                      </td>
                      <td className="px-2 py-3 align-top text-xs whitespace-nowrap" style={{ color: "rgba(255,255,255,0.65)" }}>
                        {r.row?.start_date || "—"}
                        {r.row?.end_date && <> → {r.row.end_date}</>}
                        {r.row?.start_date && !r.row?.end_date && <> → Present</>}
                      </td>
                      <td className="px-2 py-3 align-top text-right font-semibold text-xs whitespace-nowrap" style={{ color: "#FFFFFF" }}>
                        {r.row ? formatHours(r.row.hours) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Import action */}
          <div className="flex items-center justify-between gap-3 mt-6 pt-5 flex-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              {validCount === 0
                ? "No valid rows selected"
                : `Ready to import ${validCount} experience${validCount === 1 ? "" : "s"}.`}
            </p>
            <button
              onClick={doImport}
              disabled={validCount === 0 || isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#FFFFFF", color: "#000000", boxShadow: validCount > 0 ? "0 0 18px rgba(232,160,32,0.45)" : "none" }}
            >
              {isPending ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Importing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Import {validCount} experience{validCount === 1 ? "" : "s"}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
