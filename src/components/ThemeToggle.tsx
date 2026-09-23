"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Theme toggle.
 *
 * localStorage is the source of truth for rendering, because it is readable
 * before paint and so avoids a flash of the wrong theme. The profile column
 * is written alongside it so the preference follows the user to another
 * device; a failure to persist there must not break the toggle, so it is
 * fire-and-forget.
 */
export default function ThemeToggle({ initial }: { initial?: Theme }) {
  const [theme, setTheme] = useState<Theme>(initial ?? "light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let stored: Theme | null = null;
    try {
      stored = window.localStorage.getItem("cliniclog-theme") as Theme | null;
    } catch {
      // Private mode or blocked storage: fall back to the server value.
    }
    const next = stored ?? initial ?? "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    setMounted(true);
  }, [initial]);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      window.localStorage.setItem("cliniclog-theme", next);
    } catch {
      // Not fatal: the in-memory switch already applied.
    }
    void fetch("/api/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: next }),
    }).catch(() => {});
  }

  // Render a stable label until mounted, so server and client markup match.
  const label = mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme";

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      aria-pressed={mounted ? theme === "dark" : undefined}
      aria-label="Toggle colour theme"
      title="Toggle colour theme"
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        {mounted && theme === "dark" ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" strokeLinecap="round" />
          </>
        ) : (
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" strokeLinejoin="round" />
        )}
      </svg>
      {label}
    </button>
  );
}
