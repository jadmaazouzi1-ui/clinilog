import { Experience, ExperienceType, formatHours } from "@/lib/types";
import { Meter } from "@/components/ui";
import { BENCHMARKS } from "@/lib/benchmarks";

const TARGETS: { type: ExperienceType; label: string; min: number }[] = [
  { type: "clinical_work", label: "Clinical Work", min: BENCHMARKS.clinical_work },
  { type: "shadowing",     label: "Shadowing",     min: BENCHMARKS.shadowing },
  { type: "research",      label: "Research",       min: BENCHMARKS.research },
  { type: "volunteer",     label: "Volunteering",   min: BENCHMARKS.volunteer },
];

export default function AMCASTracker({ experiences }: { experiences: Experience[] }) {
  const hoursByType: Partial<Record<ExperienceType, number>> = {};
  for (const e of experiences) {
    const t = e.type as ExperienceType;
    hoursByType[t] = (hoursByType[t] ?? 0) + e.hours;
  }

  return (
    <section className="card" style={{ padding: "var(--sp-3)" }} aria-labelledby="amcas-tracker-title">
      <h2 className="section-title" id="amcas-tracker-title" style={{ marginBottom: "var(--sp-h)" }}>
        Against common benchmarks
      </h2>
      <p className="text-xs" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-3)" }}>
        Figures many applicants aim for. No school requires them.
      </p>

      <ul style={{ display: "grid", gap: "var(--sp-2)" }}>
        {TARGETS.map(({ type, label, min }) => {
          const hours = hoursByType[type] ?? 0;
          const pct = Math.min((hours / min) * 100, 100);
          const met = hours >= min;
          return (
            <li key={type}>
              <div className="flex items-baseline justify-between gap-3" style={{ marginBottom: 6 }}>
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-sm tnum" style={{ color: "var(--text-muted)" }}>
                  <span style={{ color: "var(--text)", fontWeight: 600 }}>{formatHours(hours)}</span> of {min}
                  {met && <span className="badge badge-success" style={{ marginLeft: "var(--sp-1)" }}>Reached</span>}
                </span>
              </div>
              <Meter value={pct} label={`${label}: ${formatHours(hours)} of ${min} hours`} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
