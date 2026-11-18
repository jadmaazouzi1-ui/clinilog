import Link from "next/link";
import { Experience, formatHours } from "@/lib/types";
import { formatDate } from "@/lib/format";
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

  const countdown =
    days > 1 ? `in ${days} days` : days === 1 ? "tomorrow" : days === 0 ? "today" : `${Math.abs(days)} days ago`;

  return (
    <>
      {/* A few plain facts in one line, not a dashboard of widgets. */}
      <p
        data-tour="signals"
        className="text-sm"
        style={{ color: "var(--text-muted)", marginBottom: "var(--sp-2)" }}
      >
        AMCAS {days >= 0 ? "opens" : "opened"} <time className="tnum" dateTime={target} style={{ color: "var(--text)" }}>{formatDate(target)}</time>, {countdown}.
        {streak > 1 && <> New entries {streak} weeks running.</>}
        {dormant !== null && !showDormant && (
          <> Last entry {dormant === 0 ? "today" : dormant === 1 ? "yesterday" : `${dormant} days ago`}.</>
        )}
      </p>

      {/* Gap banner: in-app for everyone; email only for those who opt in */}
      {showDormant && <GapBanner days={dormant!} offerReminders={offerReminders} />}

      {recap.entries > 0 && (
        <div
          data-tour="recap"
          className="flex items-center justify-between gap-3 flex-wrap"
          style={{ padding: "var(--sp-15) 0", borderTop: "1px solid var(--border)", marginBottom: "var(--sp-2)" }}
        >
          <p className="text-sm">
            <strong>{recap.monthLabel}:</strong> {formatHours(recap.hours)} hours across {recap.entries}{" "}
            {recap.entries === 1 ? "entry" : "entries"}.
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

      {anniversary && (
        <p className="text-sm" style={{ padding: "var(--sp-15) 0", borderTop: "1px solid var(--border)", marginBottom: "var(--sp-2)" }}>
          Around this time in {new Date(anniversary.start_date).getFullYear()}, on {formatDate(anniversary.start_date)}, you started <strong>{anniversary.title}</strong> at{" "}
          {anniversary.organization}. It has {formatHours(anniversary.hours)} hours so far.
        </p>
      )}
    </>
  );
}
