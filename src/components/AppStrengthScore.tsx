"use client";

import { useState } from "react";

interface AppStrengthScoreProps {
  score: number;
  experienceCount: number;
}

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function arcColor(score: number) {
  if (score >= 71) return "#10B981";
  if (score >= 40) return "#F59E0B";
  return "#FF4757";
}

function scoreLabel(score: number) {
  if (score >= 71) return "Strong";
  if (score >= 40) return "Developing";
  if (score > 0) return "Needs Work";
  return "No Data";
}

const TOOLTIP_LINES = [
  { icon: "⏱", label: "Hours logged", pts: "up to 30 pts" },
  { icon: "🏥", label: "Category (clinical/research/etc.)", pts: "10–25 pts" },
  { icon: "📝", label: "Description present", pts: "15 pts" },
  { icon: "📖", label: "Detailed description (>100 chars)", pts: "10 pts" },
  { icon: "🎯", label: "Leadership keywords", pts: "10 pts" },
  { icon: "🩺", label: "Patient contact keywords", pts: "10 pts" },
];

export default function AppStrengthScore({ score, experienceCount }: AppStrengthScoreProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const color = arcColor(score);
  const offset = CIRCUMFERENCE * (1 - score / 100);

  return (
    <div
      className="rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6"
      style={{ backgroundColor: "#1E2A3A", border: "1px solid rgba(0,212,255,0.14)" }}
    >
      {/* Circular progress */}
      <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
          {/* Track */}
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke="rgba(248,250,252,0.06)"
            strokeWidth="10"
          />
          {/* Arc */}
          <circle
            cx="60" cy="60" r={RADIUS}
            fill="none"
            stroke={score === 0 ? "rgba(248,250,252,0.06)" : color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1), stroke 0.4s ease" }}
          />
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-bold leading-none"
            style={{ color: score === 0 ? "rgba(248,250,252,0.3)" : color }}
          >
            {score}
          </span>
          <span className="text-[10px] font-medium mt-0.5" style={{ color: "rgba(248,250,252,0.4)" }}>/ 100</span>
        </div>
      </div>

      {/* Text + tooltip */}
      <div className="flex-1 min-w-0 text-center sm:text-left">
        <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
          <h3 className="text-base font-bold" style={{ color: "#F8FAFC" }}>
            Application Strength
          </h3>
          {/* Info button */}
          <div className="relative">
            <button
              type="button"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              onFocus={() => setShowTooltip(true)}
              onBlur={() => setShowTooltip(false)}
              onClick={() => setShowTooltip((v) => !v)}
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors"
              style={{ backgroundColor: "rgba(0,212,255,0.12)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)" }}
              aria-label="Score explanation"
            >
              ?
            </button>

            {showTooltip && (
              <div
                className="absolute left-0 top-7 z-50 w-72 rounded-xl p-4 shadow-2xl"
                style={{ backgroundColor: "rgba(10,22,40,0.98)", border: "1px solid rgba(0,212,255,0.2)", backdropFilter: "blur(16px)" }}
              >
                <p className="text-xs font-semibold mb-3" style={{ color: "#F8FAFC" }}>
                  How your score is calculated
                </p>
                <div className="space-y-2">
                  {TOOLTIP_LINES.map((line) => (
                    <div key={line.label} className="flex items-center justify-between gap-3">
                      <span className="text-xs flex items-center gap-1.5" style={{ color: "rgba(248,250,252,0.7)" }}>
                        <span>{line.icon}</span>
                        {line.label}
                      </span>
                      <span className="text-xs font-semibold whitespace-nowrap flex-shrink-0" style={{ color: "#00D4FF" }}>
                        {line.pts}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] mt-3 pt-3" style={{ color: "rgba(248,250,252,0.35)", borderTop: "1px solid rgba(0,212,255,0.1)" }}>
                  Score is averaged across all {experienceCount} experience{experienceCount !== 1 ? "s" : ""}.
                  Max 100 pts per experience.
                </p>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm mb-3" style={{ color: "rgba(248,250,252,0.5)" }}>
          {experienceCount === 0
            ? "Log your first experience to see your score."
            : `Averaged across ${experienceCount} experience${experienceCount !== 1 ? "s" : ""}`}
        </p>

        {/* Status badge */}
        {experienceCount > 0 && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: score === 0 ? "rgba(248,250,252,0.06)" : `${color}20`, color, border: `1px solid ${color}50` }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
            />
            {scoreLabel(score)}
          </span>
        )}

        {/* Tips for improving */}
        {experienceCount > 0 && score < 71 && (
          <p className="text-xs mt-3 leading-relaxed" style={{ color: "rgba(248,250,252,0.4)" }}>
            {score < 40
              ? "Tip: Add detailed descriptions and log more hours to boost your score."
              : "Tip: Add leadership context or patient interaction details to reach Strong."}
          </p>
        )}
      </div>
    </div>
  );
}
