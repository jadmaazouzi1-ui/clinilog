import { Experience, ExperienceType } from "@/lib/types";
import { formatMedicalHours } from "@/lib/formatMedical";

const TARGETS: { type: ExperienceType; label: string; min: number }[] = [
  { type: "clinical_work", label: "Clinical Work", min: 100 },
  { type: "shadowing",     label: "Shadowing",     min: 40  },
  { type: "research",      label: "Research",       min: 20  },
  { type: "volunteer",     label: "Volunteering",   min: 40  },
];

export default function AMCASTracker({ experiences }: { experiences: Experience[] }) {
  const hoursByType: Partial<Record<ExperienceType, number>> = {};
  for (const e of experiences) {
    const t = e.type as ExperienceType;
    hoursByType[t] = (hoursByType[t] ?? 0) + e.hours;
  }

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <p className="dept-header">— AMCAS Hours Tracker</p>

      <div className="space-y-5 mt-4">
        {TARGETS.map(({ type, label, min }) => {
          const hours = hoursByType[type] ?? 0;
          const pct = Math.min((hours / min) * 100, 100);
          const met = hours >= min;
          const padded = formatMedicalHours(hours);
          const minPadded = `${String(min).padStart(3, "0")} HRS`;

          return (
            <div key={type}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium" style={{ color: "#FFFFFF" }}>{label}</span>
                <span className="text-[11px] mono">
                  <span style={{ color: "#FFFFFF" }}>{padded}</span>
                  <span style={{ color: "rgba(255,255,255,0.25)" }}> / {minPadded}</span>
                  {met && (
                    <span className="ml-1.5" style={{ color: "#FFFFFF" }}>✓</span>
                  )}
                </span>
              </div>
              <div className="thin-progress">
                <div
                  className="liquid-fill"
                  style={{ "--fill": `${pct}%` } as React.CSSProperties}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
