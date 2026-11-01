import { Experience, ExperienceType } from "@/lib/types";
import { formatMedicalHours } from "@/lib/formatMedical";
import { IconStethoscope, Oscilloscope, TabIndex } from "@/components/MedicalIcons";
import { BENCHMARKS } from "@/lib/benchmarks";

const TARGETS: { type: ExperienceType; label: string; min: number }[] = [
  { type: "clinical_work", label: "Clinical Work", min: BENCHMARKS.clinical_work },
  { type: "shadowing",     label: "Shadowing",     min: BENCHMARKS.shadowing },
  { type: "research",      label: "Research",       min: BENCHMARKS.research },
  { type: "volunteer",     label: "Volunteering",   min: BENCHMARKS.volunteer },
];

const COLORS: Record<ExperienceType, string> = {
  clinical_work: "var(--cat-clinical)",
  shadowing:     "var(--cat-shadowing)",
  research:      "var(--cat-research)",
  volunteer:     "var(--cat-volunteer)",
  other:         "var(--cat-other)",
};

export default function AMCASTracker({ experiences }: { experiences: Experience[] }) {
  const hoursByType: Partial<Record<ExperienceType, number>> = {};
  for (const e of experiences) {
    const t = e.type as ExperienceType;
    hoursByType[t] = (hoursByType[t] ?? 0) + e.hours;
  }

  return (
    <div className="glass-card tick-corners" style={{ padding: "var(--sp-2)" }}>
      <p className="dept-header flex items-center gap-2">
        <IconStethoscope size={13} />
        AMCAS hours tracker
        <TabIndex n={2} />
      </p>
      <p className="text-xs" style={{ color: "var(--text-tertiary)", marginTop: 4 }}>
        Targets are common benchmarks many applicants use, not requirements set by any school.
      </p>

      <div style={{ display: "grid", gap: "var(--sp-2)", marginTop: "var(--sp-2)" }}>
        {TARGETS.map(({ type, label, min }) => {
          const hours = hoursByType[type] ?? 0;
          const pct = Math.min((hours / min) * 100, 100);
          const met = hours >= min;
          const padded = formatMedicalHours(hours);
          const minPadded = `${String(min).padStart(3, "0")} HRS`;

          return (
            <div key={type}>
              <div className="flex items-baseline justify-between" style={{ marginBottom: 2 }}>
                <span
                  className="text-xs font-bold uppercase"
                  style={{ color: "var(--text-secondary)", letterSpacing: "0.08em" }}
                >
                  {label}
                </span>
                <span className="text-[11px] mono">
                  <span style={{ color: "var(--text-primary)" }}>{padded}</span>
                  <span style={{ color: "var(--text-tertiary)" }}> / {minPadded}</span>
                  {met && (
                    <span style={{ color: "var(--accent)", marginLeft: 6, fontWeight: 700 }}>
                      MET
                    </span>
                  )}
                </span>
              </div>
              {/* Progress as an oscilloscope trace: amplitude rises with
                  completion, and the remainder reads as a flat no-signal line. */}
              <Oscilloscope pct={pct} color={COLORS[type]} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
