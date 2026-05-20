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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
      <div className="flex items-baseline justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          AMCAS Hours Tracker
        </h2>
        <span className="text-xs text-gray-400">Recommended minimums</span>
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
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <span className="text-xs tabular-nums">
                  <span className={met ? "font-semibold text-green-600" : "font-semibold text-gray-900"}>
                    {display}
                  </span>
                  <span className="text-gray-400"> / {min} hrs</span>
                  {met && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 text-green-600 font-medium">
                      ✓
                    </span>
                  )}
                </span>
              </div>
              <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${met ? "bg-green-500" : "bg-indigo-500"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
