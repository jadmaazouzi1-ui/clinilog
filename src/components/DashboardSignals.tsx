import Link from "next/link";
import { Experience, formatHours } from "@/lib/types";
import { formatMedicalDate } from "@/lib/formatMedical";
import { daysUntil, defaultAmcasTarget } from "@/lib/appTypes";
import { daysSinceLastEntry, historyMonths, onThisDay, weekStreak } from "@/lib/signals";

/**
 * The quiet dashboard signals: AMCAS countdown, logging streak, a dormancy
 * nudge, and an anniversary card. Deliberately understated, per the brief:
 * monospace readouts, no badges, no popups.
 */
export default function DashboardSignals({
  experiences,
  amcasTarget,
}: {
  experiences: Experience[];
  amcasTarget: string | null;
}) {
  const target = amcasTarget || defaultAmcasTarget();
  const days = daysUntil(target);
  const streak = weekStreak(experiences);
  const dormant = daysSinceLastEntry(experiences);
  const anniversary = historyMonths(experiences) >= 6 ? onThisDay(experiences) : null;

  const showDormant = dormant !== null && dormant >= 10;

  return (
    <>
      {/* Readout strip */}
      <div
        className="flex items-center gap-x-6 gap-y-2 flex-wrap"
        style={{
          padding: "10px var(--sp-2)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius)",
          background: "var(--bg-card)",
          marginBottom: "var(--sp-2)",
        }}
      >
        <span className="flex items-baseline gap-2">
          <span className="exp-id">AMCAS OPENS</span>
          <span className="mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {days > 0 ? `T-${days}` : days === 0 ? "TODAY" : `T+${Math.abs(days)}`}
          </span>
          <span className="exp-id">{formatMedicalDate(target)}</span>
        </span>

        {streak > 0 && (
          <span className="flex items-baseline gap-2">
            <span className="exp-id">STREAK</span>
            <span className="mono text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              {streak} week{streak === 1 ? "" : "s"}
            </span>
          </span>
        )}

        {dormant !== null && !showDormant && (
          <span className="flex items-baseline gap-2">
            <span className="exp-id">LAST ENTRY</span>
            <span className="mono text-sm" style={{ color: "var(--text-secondary)" }}>
              {dormant === 0 ? "TODAY" : `${dormant}D AGO`}
            </span>
          </span>
        )}
      </div>

      {/* Dormancy nudge: in-app only, never an email */}
      {showDormant && (
        <div
          className="flex items-center justify-between gap-3 flex-wrap"
          style={{
            padding: "10px var(--sp-2)",
            border: "1px solid var(--border-strong)",
            borderLeft: "2px solid var(--warning)",
            borderRadius: "var(--radius)",
            background: "var(--bg-card)",
            marginBottom: "var(--sp-2)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            <span className="exp-id" style={{ marginRight: 8 }}>{dormant}D SINCE LAST ENTRY</span>
            Hours are easiest to log while you still remember the details.
          </p>
          <Link
            href="/dashboard/new"
            className="btn-ghost text-xs font-semibold"
            style={{ padding: "6px var(--sp-2)", textDecoration: "none" }}
          >
            Log recent hours
          </Link>
        </div>
      )}

      {/* On this day */}
      {anniversary && (
        <div
          className="glass-card"
          style={{ padding: "var(--sp-2)", marginBottom: "var(--sp-2)" }}
        >
          <p className="exp-id" style={{ marginBottom: 4 }}>
            ON THIS DAY / {formatMedicalDate(anniversary.start_date)}
          </p>
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            You started <strong>{anniversary.title}</strong> at {anniversary.organization}.
            {" "}
            <span className="mono" style={{ color: "var(--text-secondary)" }}>
              {formatHours(anniversary.hours)} hrs
            </span>
          </p>
        </div>
      )}
    </>
  );
}
