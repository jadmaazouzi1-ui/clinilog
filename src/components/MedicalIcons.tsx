/* ──────────────────────────────────────────────────────────────────────────
   Medical chart primitives: thin single-line icons, chart identifiers, EKG
   dividers and loaders, oscilloscope readouts, and vital-sign status marks.

   Everything here is presentational and hook-free, so it can be used from
   server and client components alike. Motion lives in globals.css so it can
   respect prefers-reduced-motion in one place.
   ────────────────────────────────────────────────────────────────────────── */

interface IconProps {
  size?: number;
  className?: string;
  title?: string;
}

function Svg({
  size = 15,
  className,
  title,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

/** Pulse trace. Used beside hours and activity headings. */
export function IconPulse(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M2 12h3.5l2-5.5L11 17l2.2-7 1.6 3.4h5.2" />
    </Svg>
  );
}

/** Stethoscope outline. Used beside clinical/assessment headings. */
export function IconStethoscope(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M5 3v6a5 5 0 0 0 10 0V3" />
      <path d="M5 3H3.5M15 3h1.5" />
      <path d="M10 14v1.5a4.5 4.5 0 0 0 9 0V14" />
      <circle cx="19" cy="12" r="2" />
    </Svg>
  );
}

/** Clipboard with a cross. Used beside record and intake headings. */
export function IconClipboard(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="2.5" width="6" height="3.2" rx="0.6" />
      <path d="M12 11.5v5M9.5 14h5" />
    </Svg>
  );
}

/** Caduceus outline. Used beside the archetype/diagnosis heading. */
export function IconCaduceus(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 4.5v17" />
      <path d="M8.5 8c0 1.8 7 1.8 7 3.6s-7 1.8-7 3.6 7 1.8 7 3.6" />
      <path d="M8.5 7.2c-2-.9-3.2-.2-3.2-.2s.5 1.9 2.4 2.4" />
      <path d="M15.5 7.2c2-.9 3.2-.2 3.2-.2s-.5 1.9-2.4 2.4" />
      <circle cx="12" cy="3" r="1.2" />
    </Svg>
  );
}

/** Flatline. Error states: no signal. */
export function IconFlatline({ size = 15, className }: IconProps) {
  return (
    <svg
      width={size * 1.6}
      height={size}
      viewBox="0 0 34 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M1 8h32" />
    </svg>
  );
}

/* ── Chart identifiers ──────────────────────────────────────────────────── */

/** Stable 4-digit chart number derived from a page key. */
export function recordNumber(key: string): string {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return String(((h >>> 0) % 9999) + 1).padStart(4, "0");
}

/** "RECORD NO. 0347" marker for the top-right of a page. */
export function RecordNo({ page, className }: { page: string; className?: string }) {
  return (
    <span className={`record-no${className ? ` ${className}` : ""}`}>
      RECORD NO. {recordNumber(page)}
    </span>
  );
}

/** "TAB 01" binder index marker, sits beside a section title. */
export function TabIndex({ n }: { n: number }) {
  return <span className="tab-index">TAB {String(n).padStart(2, "0")}</span>;
}

/* ── EKG divider ────────────────────────────────────────────────────────── */

/**
 * Section divider: hairline, heartbeat, hairline. The trace is a fixed-width
 * SVG between two flexible rules rather than a stretched full-width one, so
 * the beat keeps its shape at any container width.
 */
export function EkgDivider({
  className,
  rich = false,
}: {
  className?: string;
  rich?: boolean;
}) {
  // `rich` is the milestone trace, shown once a user passes 100 logged hours:
  // a fuller complex with a P wave and T wave rather than a single spike.
  // Deliberately quiet, with no badge or announcement attached to it.
  const d = rich
    ? "M0 8h10q2 0 3-2.5T16 8h4l2.5-6L27 17l3.5-11 2.5 7 2-3h4q2 0 3-3t3 3h6q2 0 3-2.5T61 8h11"
    : "M0 8h18l3-5 4 10 3.5-8 2.5 4.5 2-1.5H72";
  return (
    <div className={`ekg-divider${className ? ` ${className}` : ""}`} role="separator">
      <span />
      <svg width="72" height="16" viewBox="0 0 72 16" fill="none" aria-hidden="true">
        <path
          d={d}
          stroke="var(--border-strong)"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span />
    </div>
  );
}

/* ── Loading ────────────────────────────────────────────────────────────── */

/** Pulsing EKG trace, used in place of a spinner. */
export function EkgLoader({ label, width = 120 }: { label?: string; width?: number }) {
  return (
    <div className="ekg-loader" role="status" aria-live="polite">
      <svg width={width} height="22" viewBox="0 0 120 22" fill="none" aria-hidden="true">
        <path
          className="ekg-loader-trace"
          d="M0 11h26l3.5-6.5L34 19l4-12 3 7 2.5-3H74l3.5-6.5L82 19l4-12 3 7 2.5-3H120"
          stroke="var(--accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label ? <span className="ekg-loader-label">{label}</span> : null}
      <span className="sr-only-live">{label ?? "Loading"}</span>
    </div>
  );
}

/* ── Status marks ───────────────────────────────────────────────────────── */

/**
 * Success mark styled as a lab result inside the normal range: a range bar
 * with the reading sitting mid-scale, plus a check and a label.
 */
export function VitalOk({ label = "NORMAL" }: { label?: string }) {
  return (
    <span className="vital-ok">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 12.5l5 5L20 6.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="vital-ok-range" aria-hidden="true">
        <i />
      </span>
      <span className="vital-ok-label">{label}</span>
    </span>
  );
}

/** Error mark: a flatline with a label. */
export function VitalFlat({ label = "NO SIGNAL" }: { label?: string }) {
  return (
    <span className="vital-flat">
      <IconFlatline size={13} />
      <span className="vital-flat-label">{label}</span>
    </span>
  );
}

/* ── Oscilloscope progress readout ──────────────────────────────────────── */

const OSC_W = 200;
const OSC_H = 30;
const OSC_BASE = 23;

/** One EKG cycle: x offset within the cycle, y offset above the baseline. */
const CYCLE: [number, number][] = [
  [0, 0], [8, 0], [12, 2], [16, 0], [20, -3], [22, 14], [24, -5], [28, 0], [34, 3], [40, 0],
];
const CYCLE_W = 40;

/**
 * Progress drawn as an oscilloscope trace instead of a filled bar: a ruled
 * baseline with interval ticks, a live waveform whose amplitude rises with
 * completion, and a flat "no signal" line across the remainder.
 */
export function Oscilloscope({ pct, color = "var(--accent)" }: { pct: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const end = (clamped / 100) * OSC_W;

  const pts: string[] = [];
  for (let x = 0; x <= end; x += 1) {
    const cyclePos = x % CYCLE_W;
    // Interpolate this cycle's shape at cyclePos.
    let i = 0;
    while (i < CYCLE.length - 1 && CYCLE[i + 1][0] < cyclePos) i++;
    const [x0, y0] = CYCLE[i];
    const [x1, y1] = CYCLE[Math.min(i + 1, CYCLE.length - 1)];
    const span = x1 - x0 || 1;
    const k = (cyclePos - x0) / span;
    const yOff = y0 + (y1 - y0) * k;
    // Amplitude grows toward the right so a fuller bar reads as a stronger trace.
    const amp = 0.35 + 0.65 * (x / OSC_W);
    pts.push(`${x},${(OSC_BASE - yOff * amp).toFixed(2)}`);
  }

  const ticks = [];
  for (let x = 0; x <= OSC_W; x += 20) ticks.push(x);

  return (
    <svg
      viewBox={`0 0 ${OSC_W} ${OSC_H}`}
      preserveAspectRatio="none"
      className="oscilloscope"
      aria-hidden="true"
    >
      {/* Ruled baseline */}
      <line x1="0" y1={OSC_BASE} x2={OSC_W} y2={OSC_BASE} stroke="var(--border)" strokeWidth="1" />
      {/* Interval ticks */}
      {ticks.map((x) => (
        <line
          key={x}
          x1={x}
          y1={OSC_BASE}
          x2={x}
          y2={OSC_BASE + 4}
          stroke="var(--border-strong)"
          strokeWidth="1"
        />
      ))}
      {/* Remainder: no signal yet */}
      {clamped < 100 && (
        <line
          x1={end}
          y1={OSC_BASE}
          x2={OSC_W}
          y2={OSC_BASE}
          stroke="var(--border-strong)"
          strokeWidth="1.2"
        />
      )}
      {/* Live trace */}
      {pts.length > 1 && (
        <polyline
          points={pts.join(" ")}
          fill="none"
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      )}
      {/* Sweep head */}
      {clamped > 0 && clamped < 100 && (
        <circle cx={end} cy={OSC_BASE} r="1.8" fill={color} vectorEffect="non-scaling-stroke" />
      )}
    </svg>
  );
}
