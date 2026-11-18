/* Shared presentational pieces. The styles live in globals.css under the
   matching class names; DESIGN.md lists every component and its states.
   Hook-free, so server and client components can both use them. */

import Link from "next/link";

/** Inline status line while something loads. No animation: the words say
 *  what is happening, and the skeleton blocks show the shape to come. */
export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <p className="loading" role="status" aria-live="polite">
      {label}…
    </p>
  );
}

/** Grey placeholder blocks in the shape of the content that is loading. */
export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="skeleton" aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} style={{ width: i === lines - 1 ? "60%" : "100%" }} />
      ))}
    </div>
  );
}

/** Progress toward a target, as a plain bar. */
export function Meter({ value, label }: { value: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)} aria-label={label}>
      <span className="meter-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

type Tone = "info" | "success" | "warning" | "danger";

/** A message that sits in the page: saved, failed, heads up. */
export function Notice({ tone = "info", title, children }: { tone?: Tone; title?: string; children: React.ReactNode }) {
  return (
    <div className={`notice notice-${tone}`} role={tone === "danger" ? "alert" : "status"}>
      {title ? <p className="notice-title">{title}</p> : null}
      <div>{children}</div>
    </div>
  );
}

/** What to show when a list is empty: what goes here, and the one thing to
 *  do about it. */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: { href: string; label: string };
}) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children ? <p className="empty-body">{children}</p> : null}
      {action ? (
        <Link href={action.href} className="btn btn-primary">
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
