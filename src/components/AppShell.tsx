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

const NAV_ITEMS = [
  { href: "/dashboard",   label: "Dashboard" },
  { href: "/archetype",   label: "My Archetype" },
  { href: "/schools",     label: "Schools" },
  { href: "/specialties", label: "Specialties" },
  { href: "/gapyear",     label: "Gap Year" },
  { href: "/postbacc",    label: "Post-bacc" },
  { href: "/resources",   label: "Resources" },
  { href: "/fee-tracker", label: "Fee Tracker" },
  { href: "/stories",     label: "Stories" },
  { href: "/import",      label: "Import CSV" },
  { href: "/profile",     label: "Profile" },
];

// The mobile bottom bar shows 4 direct destinations plus a "Tools" tab that
// opens a full-screen modal listing everything else. Narrative Builder and
// Reframe Engine have no dedicated route in this app (they're features
// embedded in /archetype and the experience form respectively), so those two
// point at the page where that functionality actually lives. AI Advisor has
// no route at all — it's the floating chat widget — so tapping it closes the
// modal and opens the chat drawer via a custom event instead of navigating.
const BOTTOM_TABS = [
  { href: "/dashboard", label: "Dashboard" },
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
  "/dashboard": [{ label: "Dashboard" }],
  "/archetype": [{ label: "Dashboard", href: "/dashboard" }, { label: "My Archetype" }],
  "/schools":   [{ label: "Schools" }],
  "/specialties": [{ label: "Specialties" }],
  "/gapyear":   [{ label: "Gap Year Planner" }],
  "/postbacc":  [{ label: "Post-bacc Tracker" }],
  "/resources": [{ label: "Resources" }],
  "/fee-tracker": [{ label: "Fee Tracker" }],
  "/stories":   [{ label: "Stories" }],
  "/import":    [{ label: "Dashboard", href: "/dashboard" }, { label: "Import CSV" }],
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
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Sidebar - desktop. Text labels only, 2px black right border. */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full z-40 w-[180px]"
        style={{
          backgroundColor: "#FFFFFF",
          borderRight: "2px solid #000000",
        }}
      >
        {/* Wordmark */}
        <div className="px-4 py-5 flex-shrink-0" style={{ borderBottom: "2px solid #000000" }}>
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className="whitespace-nowrap"
              style={{ color: "#000000", fontWeight: 900, fontSize: "1rem", textTransform: "uppercase", letterSpacing: "-0.01em" }}
            >
              ClinicLog
            </span>
            <span className="beta-pill">BETA</span>
          </Link>
        </div>

        {/* Nav items - active inverts to black */}
        <nav className="flex-1 overflow-y-auto py-3">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2.5 nav-item-brutal"
                style={{
                  color: isActive ? "#FFFFFF" : "#000000",
                  backgroundColor: isActive ? "#000000" : "transparent",
                  fontWeight: 800,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="flex-shrink-0 pb-3 pt-2" style={{ borderTop: "2px solid #000000" }}>
          <div className="px-4 py-1.5">
            <p className="text-[10px] mono truncate" style={{ color: "rgba(0,0,0,0.55)" }}>{userEmail}</p>
          </div>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full text-left px-4 py-2 nav-item-brutal"
              style={{
                color: "#000000",
                fontWeight: 800,
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      <style>{`
        .nav-item-brutal:hover {
          background: #000000 !important;
          color: #FFFFFF !important;
        }
        .bottom-tab-brutal { min-height: 44px; }
        .bottom-tab-brutal:active { opacity: 0.7; }
        .tools-modal-item:active { opacity: 0.7; }
      `}</style>

      {/* Main content */}
      <div className="md:ml-[180px] pb-[80px] md:pb-0">
        {crumbs.length > 0 && (
          <div className="flex items-center gap-1.5 px-6 pt-5 pb-1">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-[10px] mono" style={{ color: "#000000" }}>/</span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-[10px] mono uppercase tracking-widest font-bold underline"
                    style={{ color: "#000000" }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[10px] mono uppercase tracking-widest font-bold" style={{ color: "rgba(0,0,0,0.55)" }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        <div className="page-fade-in">{children}</div>
      </div>

      {/* Mobile bottom nav - 5 tabs, real Link components, 64px + safe-area */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          height: 64,
          backgroundColor: "#FFFFFF",
          borderTop: "2px solid #000000",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {BOTTOM_TABS.map((item) => {
          const isActive = activePath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="bottom-tab-brutal flex-1 flex items-center justify-center"
              style={{
                color: isActive ? "#FFFFFF" : "#000000",
                backgroundColor: isActive ? "#000000" : "#FFFFFF",
              }}
            >
              <span className="text-[10px] mono font-bold leading-none uppercase tracking-wide">{item.label}</span>
            </Link>
          );
        })}

        {/* Tools tab - a <button>, not a Link, since it toggles a modal
            rather than navigating to a route. */}
        <button
          type="button"
          onClick={() => setToolsOpen(true)}
          className="bottom-tab-brutal flex-1 flex items-center justify-center"
          style={{
            color: "#000000",
            backgroundColor: "#FFFFFF",
            border: "none",
          }}
          aria-haspopup="dialog"
          aria-expanded={toolsOpen}
        >
          <span className="text-[10px] mono font-bold leading-none uppercase tracking-wide">Tools</span>
        </button>

        {(() => {
          const isActive = activePath.startsWith(PROFILE_TAB.href);
          return (
            <Link
              href={PROFILE_TAB.href}
              className="bottom-tab-brutal flex-1 flex items-center justify-center"
              style={{
                color: isActive ? "#FFFFFF" : "#000000",
                backgroundColor: isActive ? "#000000" : "#FFFFFF",
              }}
            >
              <span className="text-[10px] mono font-bold leading-none uppercase tracking-wide">{PROFILE_TAB.label}</span>
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
          <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 64, borderBottom: "2px solid #000000" }}>
            <span className="text-sm mono font-bold uppercase tracking-widest" style={{ color: "#000000" }}>Tools</span>
            <button
              type="button"
              onClick={() => setToolsOpen(false)}
              aria-label="Close menu"
              className="flex items-center justify-center"
              style={{ width: 44, height: 44, background: "transparent", border: "none", color: "#000000" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <button
              type="button"
              onClick={openAdvisor}
              className="tools-modal-item w-full text-left"
              style={{
                display: "block",
                padding: "1.25rem 1.5rem",
                fontSize: "1.125rem",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
                color: "#000000",
                background: "transparent",
                border: "none",
                borderBottom: "2px solid #000000",
              }}
            >
              AI Advisor
            </button>
            {TOOLS_MODAL_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setToolsOpen(false)}
                className="tools-modal-item"
                style={{
                  display: "block",
                  padding: "1.25rem 1.5rem",
                  fontSize: "1.125rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                  color: "#000000",
                  textDecoration: "none",
                  borderBottom: "2px solid #000000",
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
