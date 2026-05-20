import { Experience, ExperienceType } from "@/lib/types";

const TARGETS: { type: ExperienceType; label: string; min: number }[] = [
  { type: "clinical_work", label: "Clinical Work", min: 100 },
  { type: "shadowing",     label: "Shadowing",     min: 40  },
  { type: "research",      label: "Research",       min: 20  },
  { type: "volunteer",     label: "Volunteering",   min: 40  },
];

export default function AMCASTracker({
  experiences,
}: {
  experiences: Experience[];
}) {
  const hoursByType: Partial<Record<ExperienceType, number>> = {};
  for (const e of experiences) {
    const t = e.type as ExperienceType;
    hoursByType[t] = (hoursByType[t] ?? 0) + e.hours;
  }

  return (
    <div className="glass-card rounded-2xl p-6 mb-8">
      <div className="flex items-baseline justify-between mb-5">
        <h2
          className="text-sm font-semibold uppercase tracking-wide"
          style={{ color: "rgba(248,250,252,0.5)" }}
        >
          AMCAS Hours Tracker
        </h2>
        <span className="text-xs" style={{ color: "rgba(248,250,252,0.4)" }}>Recommended minimums</span>
      </div>

      <div className="space-y-5">
        {TARGETS.map(({ type, label, min }) => {
          const hours = hoursByType[type] ?? 0;
          const pct = Math.min((hours / min) * 100, 100);
          const met = hours >= min;
          const display = hours % 1 === 0 ? hours : hours.toFixed(1);

          return (
            <div key={type}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium" style={{ color: "#F8FAFC" }}>{label}</span>
                <span className="text-xs tabular-nums">
                  <span
                    className="font-semibold"
                    style={{ color: met ? "#00D4FF" : "#FF4757" }}
                  >
                    {display}
                  </span>
                  <span style={{ color: "rgba(248,250,252,0.4)" }}> / {min} hrs</span>
                  {met && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 font-medium" style={{ color: "#00D4FF" }}>
                      ✓
                    </span>
                  )}
                </span>
              </div>
              <div
                className="h-4 w-full rounded-full overflow-hidden"
                style={{ background: "rgba(248,250,252,0.08)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: met ? "#00D4FF" : "#FF4757" }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
