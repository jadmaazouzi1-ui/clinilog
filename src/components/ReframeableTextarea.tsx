"use client";

import { useState } from "react";

interface ReframeableTextareaProps {
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
}

export default function ReframeableTextarea({
  defaultValue = "",
  required = false,
  placeholder = "What did you do?",
}: ReframeableTextareaProps) {
  const [value, setValue] = useState(defaultValue);
  const [originalValue, setOriginalValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasReframed = originalValue !== null;

  async function handleReframe() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Write a description first, then reframe it.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: trimmed }),
      });
      const data = await res.json();
      if (data.reframed) {
        setOriginalValue(value);
        setValue(data.reframed);
      } else {
        setError(data.error ?? "Reframe failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleUndo() {
    if (originalValue !== null) {
      setValue(originalValue);
      setOriginalValue(null);
      setError(null);
    }
  }

  return (
    <div className="space-y-2">
      {/* Textarea */}
      <div className="relative">
        <textarea
          id="description"
          name="description"
          required={required}
          rows={4}
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          className="input-dark w-full px-3.5 py-2.5 rounded-xl text-sm resize-none transition-all"
          style={{
            borderColor: hasReframed ? "rgba(0,212,255,0.5)" : undefined,
            boxShadow: hasReframed ? "0 0 0 3px rgba(0,212,255,0.08)" : undefined,
          }}
        />
        {/* Reframed badge */}
        {hasReframed && (
          <div
            className="absolute top-2.5 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ backgroundColor: "rgba(0,212,255,0.12)", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)" }}
          >
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            AI Reframed
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs" style={{ color: "#FF4757" }}>{error}</p>
      )}

      {/* Action row */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleReframe}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
          style={{
            backgroundColor: loading ? "rgba(0,212,255,0.15)" : "rgba(0,212,255,0.12)",
            color: loading ? "rgba(0,212,255,0.6)" : "#00D4FF",
            border: "1px solid rgba(0,212,255,0.3)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? (
            <>
              {/* Spinner */}
              <svg
                className="w-3.5 h-3.5 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Reframing…
            </>
          ) : (
            <>
              {/* Sparkle / wand icon */}
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Reframe with AI
            </>
          )}
        </button>

        {hasReframed && (
          <button
            type="button"
            onClick={handleUndo}
            className="inline-flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80"
            style={{ color: "rgba(248,250,252,0.45)" }}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
            Undo reframe
          </button>
        )}
      </div>
    </div>
  );
}
