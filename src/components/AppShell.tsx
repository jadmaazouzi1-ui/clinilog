"use client";

import { useState } from "react";
import Link from "next/link";
import AIAdvisorButton from "./AIAdvisorButton";
import { RecordNo } from "./MedicalIcons";

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

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Overview",    code: "OV" },
  { href: "/archetype",   label: "My Archetype", code: "AR" },
  { href: "/schools",     label: "Schools",      code: "SC" },
  { href: "/specialties", label: "Specialties",  code: "SP" },
  { href: "/gapyear",     label: "Gap Year",     code: "GY" },
  { href: "/postbacc",    label: "Post-bacc",    code: "PB" },
  { href: "/resources",   label: "Resources",    code: "RS" },
  { href: "/fee-tracker", label: "Fee Tracker",  code: "FT" },
  { href: "/stories",     label: "Stories",      code: "ST" },
  { href: "/import",      label: "Import CSV",   code: "IM" },
  { href: "/profile",     label: "Profile",      code: "PR" },
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
                className={`binder-tab flex items-center gap-3 px-3 py-2.5${isActive ? " is-active" : ""}`}
                style={{
                  color: isActive ? "var(--accent)" : "var(--text-secondary)",
                  backgroundColor: isActive ? "var(--accent-soft)" : "transparent",
                  fontWeight: isActive ? 600 : 500,
                  fontSize: "13.5px",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <span
                  className="mono"
                  style={{
                    flexShrink: 0,
                    width: 22,
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    color: isActive ? "var(--accent)" : "var(--text-tertiary)",
                  }}
                >
                  {item.code}
                </span>
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
        <div className="flex items-center justify-between gap-3 px-6 md:px-8 pt-6 pb-1">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
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
          <RecordNo page={activePath} />
        </div>

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
