import Link from "next/link";

/* ──────────────────────────────────────────────────────────────────────────
   Empty states: a minimal line drawing in the chart idiom, a plain
   explanation, and a way out. One component so every empty surface in the
   app reads the same.
   ────────────────────────────────────────────────────────────────────────── */

type Kind = "experiences" | "schools" | "interviews" | "recommendations" | "applications";

function Art({ kind }: { kind: Kind }) {
  const common = {
    fill: "none",
    stroke: "var(--border-strong)",
    strokeWidth: 1.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg width="96" height="64" viewBox="0 0 96 64" aria-hidden="true" style={{ display: "block" }}>
      {/* Shared chart baseline */}
      <line x1="4" y1="58" x2="92" y2="58" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 4" />

      {kind === "experiences" && (
        <>
          {/* Clipboard with a flat trace: nothing recorded yet */}
          <rect x="30" y="8" width="36" height="42" rx="2" {...common} />
          <rect x="41" y="4" width="14" height="7" rx="1.5" {...common} />
          <path d="M36 32h8l2-5 3 10 2-5h9" {...common} />
        </>
      )}

      {kind === "schools" && (
        <>
          {/* Building with a magnifier: no match in the current filter */}
          <path d="M20 46V26l16-8 16 8v20" {...common} />
          <path d="M28 46V34h8v12" {...common} />
          <circle cx="66" cy="30" r="9" {...common} />
          <path d="M72.5 36.5L80 44" {...common} />
        </>
      )}

      {kind === "interviews" && (
        <>
          {/* Two facing speech forms: no conversation logged */}
          <path d="M14 14h32v20H28l-8 7v-7h-6z" {...common} />
          <path d="M82 26H56v18h12l7 6v-6h7z" {...common} />
        </>
      )}

      {kind === "recommendations" && (
        <>
          {/* Sealed letter */}
          <rect x="22" y="16" width="52" height="32" rx="2" {...common} />
          <path d="M22 19l26 17 26-17" {...common} />
          <circle cx="74" cy="44" r="7" {...common} />
          <path d="M71 44l2.2 2.2L77 42.5" {...common} />
        </>
      )}

      {kind === "applications" && (
        <>
          {/* Stacked forms, the top one blank */}
          <rect x="18" y="14" width="42" height="34" rx="2" {...common} />
          <rect x="26" y="8" width="42" height="34" rx="2" {...common} />
          <path d="M33 18h28M33 25h28M33 32h16" {...common} />
        </>
      )}
    </svg>
  );
}

export function EmptyState({
  kind,
  title,
  body,
  actionHref,
  actionLabel,
}: {
  kind: Kind;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div
      className="glass-card tick-corners"
      style={{ padding: "var(--sp-4) var(--sp-3)", marginBottom: "var(--sp-2)" }}
    >
      <div style={{ marginBottom: "var(--sp-2)" }}>
        <Art kind={kind} />
      </div>
      <p className="exp-id" style={{ marginBottom: 6 }}>NO RECORDS</p>
      <h3 className="text-base font-semibold" style={{ color: "var(--text-primary)", marginBottom: 4 }}>
        {title}
      </h3>
      <p className="text-sm" style={{ color: "var(--text-secondary)", maxWidth: 440 }}>
        {body}
      </p>
      {actionHref && actionLabel && (
        <Link
          href={actionHref}
          className="teal-glow inline-flex items-center text-sm"
          style={{ padding: "9px var(--sp-2)", marginTop: "var(--sp-3)", textDecoration: "none" }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
