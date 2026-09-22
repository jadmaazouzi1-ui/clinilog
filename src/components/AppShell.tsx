"use client";

import { useState } from "react";
import Link from "next/link";
import AIAdvisorButton from "./AIAdvisorButton";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppShellProps {
  userEmail: string;
  activePath: string;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
}

function Icon({ d, viewBox = "0 0 24 24" }: { d: string; viewBox?: string }) {
  return (
    <svg width="18" height="18" viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Overview",    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/archetype",   label: "My Archetype", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" },
  { href: "/schools",     label: "Schools",      icon: "M3 21V7l9-4 9 4v14M9 21V12h6v9" },
  { href: "/specialties", label: "Specialties",  icon: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" },
  { href: "/gapyear",     label: "Gap Year",     icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
  { href: "/postbacc",    label: "Post-bacc",    icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { href: "/resources",   label: "Resources",    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  { href: "/fee-tracker", label: "Fee Tracker",  icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  { href: "/stories",     label: "Stories",      icon: "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm10 10v-2a4 4 0 00-3-3.87m-4-11.13a4 4 0 010 7.75" },
  { href: "/import",      label: "Import CSV",   icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
  { href: "/profile",     label: "Profile",      icon: "M4 20c0-4 3.6-7 8-7s8 3 8 7M12 12a4 4 0 100-8 4 4 0 000 8z" },
];

const BOTTOM_TABS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/schools",   label: "Schools" },
  { href: "/archetype", label: "Archetype" },
];
const PROFILE_TAB = { href: "/profile", label: "Profile" };

const TOOLS_MODAL_ITEMS: { label: string; href: string }[] = [
  { label: "Narrative Builder",  href: "/archetype" },
  { label: "Reframe Engine",     href: "/dashboard/new" },
  { label: "Specialty Explorer", href: "/specialties" },
  { label: "Resource Library",   href: "/resources" },
  { label: "Gap Year Planner",   href: "/gapyear" },
  { label: "Post-bacc Tracker",  href: "/postbacc" },
  { label: "Fee Tracker",        href: "/fee-tracker" },
  { label: "Import CSV",         href: "/import" },
  { label: "Stories",            href: "/stories" },
  { label: "About",              href: "/about" },
];

const AUTO_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ label: "Overview" }],
  "/archetype": [{ label: "Overview", href: "/dashboard" }, { label: "My Archetype" }],
  "/schools":   [{ label: "Schools" }],
  "/specialties": [{ label: "Specialties" }],
  "/gapyear":   [{ label: "Gap Year Planner" }],
  "/postbacc":  [{ label: "Post-bacc Tracker" }],
  "/resources": [{ label: "Resources" }],
  "/fee-tracker": [{ label: "Fee Tracker" }],
  "/stories":   [{ label: "Stories" }],
  "/import":    [{ label: "Overview", href: "/dashboard" }, { label: "Import CSV" }],
  "/profile":   [{ label: "Profile" }],
};

export default function AppShell({ userEmail, activePath, breadcrumbs, children }: AppShellProps) {
  const [toolsOpen, setToolsOpen] = useState(false);
  const crumbs = breadcrumbs ?? AUTO_BREADCRUMBS[activePath] ?? [];

  function openAdvisor() {
    setToolsOpen(false);
    window.dispatchEvent(new CustomEvent("cliniclog:open-advisor"));
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-page)" }}>
      {/* Sidebar - desktop */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full z-40 w-[220px]"
        style={{
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Wordmark */}
        <div className="px-5 py-6 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(135deg, var(--accent), var(--accent-bright))" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
              </svg>
            </div>
            <div>
              <p className="leading-none" style={{ color: "var(--text-primary)", fontWeight: 700, fontSize: "0.9375rem" }}>ClinicLog MD</p>
              <p className="leading-none mt-1" style={{ color: "var(--text-tertiary)", fontSize: "0.6875rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>Application Tracker</p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5"
                style={{
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "13.5px",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <Icon d={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div
            className="px-3 py-3 mb-2"
            style={{ background: "var(--bg-soft)", borderRadius: "var(--radius-md)" }}
          >
            <p className="text-xs font-semibold" style={{ color: "var(--text-primary)" }}>Private tracker</p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>Saved to your private account</p>
          </div>
          <div className="flex items-center gap-2.5 px-3 py-1.5">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent)", fontWeight: 700, fontSize: 12 }}
            >
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs truncate flex-1" style={{ color: "var(--text-secondary)" }}>{userEmail}</p>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-3 py-2 mt-1"
              style={{ color: "var(--text-secondary)", fontWeight: 500, fontSize: "13px", borderRadius: "var(--radius-sm)" }}
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <style>{`
        .nav-item-brutal:hover { background: var(--bg-soft) !important; }
        aside nav a:hover { background: var(--bg-soft); }
        .bottom-tab-soft { min-height: 44px; }
        .bottom-tab-soft:active { opacity: 0.7; }
        .tools-modal-item:active { opacity: 0.7; }
      `}</style>

      {/* Main content */}
      <div className="md:ml-[220px] pb-[80px] md:pb-0">
        {crumbs.length > 0 && (
          <div className="flex items-center gap-1.5 px-6 md:px-8 pt-6 pb-1">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>/</span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-xs font-semibold hover:underline"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs font-semibold" style={{ color: "var(--text-tertiary)" }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="page-fade-in">{children}</div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          height: 64,
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid var(--border)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {BOTTOM_TABS.map((item) => {
          const isActive = activePath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bottom-tab-soft flex-1 flex items-center justify-center"
              style={{
                color: isActive ? "var(--accent)" : "var(--text-tertiary)",
              }}
            >
              <span className="text-[11px] font-semibold leading-none">{item.label}</span>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setToolsOpen(true)}
          className="bottom-tab-soft flex-1 flex items-center justify-center"
          style={{ color: "var(--text-tertiary)", background: "transparent", border: "none" }}
          aria-haspopup="dialog"
          aria-expanded={toolsOpen}
        >
          <span className="text-[11px] font-semibold leading-none">Tools</span>
        </button>

        {(() => {
          const isActive = activePath.startsWith(PROFILE_TAB.href);
          return (
            <Link
              href={PROFILE_TAB.href}
              className="bottom-tab-soft flex-1 flex items-center justify-center"
              style={{ color: isActive ? "var(--accent)" : "var(--text-tertiary)" }}
            >
              <span className="text-[11px] font-semibold leading-none">{PROFILE_TAB.label}</span>
            </Link>
          );
        })()}
      </nav>

      {/* Tools full-screen modal */}
      {toolsOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] flex flex-col"
          style={{ backgroundColor: "#FFFFFF" }}
          role="dialog"
          aria-modal="true"
          aria-label="All tools"
        >
          <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 64, borderBottom: "1px solid var(--border)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Tools</span>
            <button
              type="button"
              onClick={() => setToolsOpen(false)}
              aria-label="Close menu"
              className="flex items-center justify-center"
              style={{ width: 44, height: 44, background: "var(--bg-soft)", border: "none", borderRadius: "50%", color: "var(--text-primary)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <button
              type="button"
              onClick={openAdvisor}
              className="tools-modal-item w-full text-left px-4 py-3.5"
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "var(--text-primary)",
                background: "var(--bg-soft)",
                border: "none",
                borderRadius: "var(--radius-md)",
              }}
            >
              AI Advisor
            </button>
            {TOOLS_MODAL_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setToolsOpen(false)}
                className="tools-modal-item block px-4 py-3.5"
                style={{
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  borderRadius: "var(--radius-md)",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <AIAdvisorButton />
    </div>
  );
}
