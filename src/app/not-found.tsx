import Link from "next/link";
import { RecordNo } from "@/components/MedicalIcons";

export const metadata = { title: "Record not found | ClinicLog MD" };

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-start justify-center"
      style={{ backgroundColor: "var(--bg-page)", padding: "var(--sp-8) var(--sp-3)" }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>
        <div className="flex items-baseline justify-between gap-3" style={{ marginBottom: "var(--sp-2)" }}>
          <span className="exp-id">CHART LOOKUP</span>
          <RecordNo page="/404" />
        </div>

        <div
          className="tick-corners"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-strong)",
            borderLeft: "2px solid var(--margin-rule)",
            borderRadius: "var(--radius)",
            padding: "var(--sp-4) var(--sp-3)",
          }}
        >
          {/* Flatline: no record on file */}
          <svg width="100%" height="34" viewBox="0 0 320 34" fill="none" aria-hidden="true" style={{ marginBottom: "var(--sp-2)" }}>
            <line x1="0" y1="17" x2="320" y2="17" stroke="var(--margin-rule)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>

          <p className="exp-id" style={{ marginBottom: 6, color: "var(--margin-rule)" }}>
            ERR 404 / NO RECORD ON FILE
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", marginBottom: "var(--sp-1)" }}>
            That page isn&apos;t in the chart.
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}>
            The address you followed doesn&apos;t match any record. It may have been moved,
            or the link may have been mistyped.
          </p>

          <hr className="tear-line" />

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href="/dashboard"
              className="teal-glow inline-flex items-center text-sm"
              style={{ padding: "10px var(--sp-3)", textDecoration: "none" }}
            >
              Back to dashboard
            </Link>
            <Link
              href="/"
              className="btn-ghost inline-flex items-center text-sm"
              style={{ padding: "10px var(--sp-3)", textDecoration: "none" }}
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
