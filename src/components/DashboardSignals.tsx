import Link from "next/link";
import { Experience, formatHours } from "@/lib/types";
import { formatMedicalDate } from "@/lib/formatMedical";
import { daysUntil, defaultAmcasTarget } from "@/lib/appTypes";
import { daysSinceLastEntry, historyMonths, onThisDay, priorMonthSummary, weekStreak } from "@/lib/signals";
import RecapCard from "./RecapCard";
import GapBanner from "./checks/GapBanner";

/**
 * The quiet dashboard signals: AMCAS countdown, logging streak, a dormancy
 * nudge, and an anniversary card. Deliberately understated, per the brief:
 * monospace readouts, no badges, no popups.
 */
export default function DashboardSignals({
  experiences,
  amcasTarget,
  archetype = null,
  gapThreshold = 14,
  bannerHidden = false,
  offerReminders = false,
}: {
  experiences: Experience[];
  amcasTarget: string | null;
  archetype?: string | null;
  /** The user's reminder gap setting; 14 days if they have none. */
  gapThreshold?: number;
  /** Dismissed in the last 7 days. */
  bannerHidden?: boolean;
  /** Never answered the reminder offer. */
  offerReminders?: boolean;
}) {
  const target = amcasTarget || defaultAmcasTarget();
  const days = daysUntil(target);
  const streak = weekStreak(experiences);
  const dormant = daysSinceLastEntry(experiences);
  const anniversary = historyMonths(experiences) >= 6 ? onThisDay(experiences) : null;

  const showDormant = dormant !== null && dormant >= gapThreshold && !bannerHidden;

  // Offered only when the month just gone actually had activity, so it never
  // produces a card reading zero.
  const recap = priorMonthSummary(experiences);

  return (
    <>
      {/* Readout strip */}
      <div
        data-tour="signals"
        className="flex items-center gap-x-6 gap-y-2 flex-wrap"
        style={{
          padding: "10px var(--sp-2)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius)",
          background: "var(--surface)",
          marginBottom: "var(--sp-2)",
        }}
      >
        <span className="flex items-baseline gap-2">
          <span className="exp-id">AMCAS OPENS</span>
          <span className="mono text-sm font-semibold" style={{ color: "var(--text)" }}>
            {days > 0 ? `T-${days}` : days === 0 ? "TODAY" : `T+${Math.abs(days)}`}
          </span>
          <span className="exp-id">{formatMedicalDate(target)}</span>
        </span>

        {streak > 0 && (
          <span className="flex items-baseline gap-2">
            <span className="exp-id">STREAK</span>
            <span className="mono text-sm font-semibold" style={{ color: "var(--text)" }}>
              {streak} week{streak === 1 ? "" : "s"}
            </span>
          </span>
        )}

        {dormant !== null && !showDormant && (
          <span className="flex items-baseline gap-2">
            <span className="exp-id">LAST ENTRY</span>
            <span className="mono text-sm" style={{ color: "var(--text-muted)" }}>
              {dormant === 0 ? "TODAY" : `${dormant}D AGO`}
            </span>
          </span>
        )}
      </div>

      {/* Gap banner: in-app for everyone; email only for those who opt in */}
      {showDormant && <GapBanner days={dormant!} offerReminders={offerReminders} />}

      {/* Monthly recap */}
      {recap.entries > 0 && (
        <div
          data-tour="recap"
          className="flex items-center justify-between gap-3 flex-wrap"
          style={{
            padding: "10px var(--sp-2)",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius)",
            background: "var(--surface)",
            marginBottom: "var(--sp-2)",
          }}
        >
          <p className="text-sm" style={{ color: "var(--text)" }}>
            <span className="exp-id" style={{ marginRight: 8 }}>{recap.monthLabel.toUpperCase()}</span>
            {formatHours(recap.hours)} hours across {recap.entries} {recap.entries === 1 ? "entry" : "entries"}.
          </p>
          <RecapCard
            monthLabel={recap.monthLabel}
            hours={recap.hours}
            entries={recap.entries}
            topCategory={recap.topCategory}
            archetype={archetype}
          />
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
          <p className="text-sm" style={{ color: "var(--text)" }}>
            You started <strong>{anniversary.title}</strong> at {anniversary.organization}.
            {" "}
            <span className="mono" style={{ color: "var(--text-muted)" }}>
              {formatHours(anniversary.hours)} hrs
            </span>
          </p>
        </div>
      )}
    </>
  );
}
