"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import AIAdvisorButton from "./AIAdvisorButton";
import RouteProgress, { LinkPending } from "./RouteProgress";
import ThemeToggle from "./ThemeToggle";
import PageView from "./PageView";
import TourRoot from "./tour/TourRoot";
import HelpButton from "./tour/HelpButton";
import PageTourLink from "./tour/PageTourLink";

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

// Grouped by when in the cycle you reach for them, not alphabetically.
const NAV_GROUPS: { label: string | null; items: { href: string; label: string }[] }[] = [
  { label: null, items: [{ href: "/dashboard", label: "Overview" }, { href: "/import", label: "Import CSV" }] },
  {
    label: "Applying",
    items: [
      { href: "/schools", label: "Schools" },
      { href: "/applications", label: "Applications" },
      { href: "/interviews", label: "Interviews" },
      { href: "/recommendations", label: "Letters" },
      { href: "/fee-tracker", label: "Fees" },
    ],
  },
  {
    label: "Writing",
    items: [
      { href: "/archetype", label: "Archetype" },
      { href: "/outline", label: "Statement outline" },
      { href: "/mock-interview", label: "Mock interview" },
    ],
  },
  {
    label: "Planning",
    items: [
      { href: "/specialties", label: "Specialties" },
      { href: "/gapyear", label: "Gap year" },
      { href: "/postbacc", label: "Post-bacc" },
      { href: "/resources", label: "Resources" },
      { href: "/stories", label: "Stories" },
    ],
  },
];

const BOTTOM_TABS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/schools",   label: "Schools" },
  { href: "/dashboard/new", label: "Log hours" },
];
const PROFILE_TAB = { href: "/profile", label: "Profile" };

const AUTO_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ label: "Overview" }],
  "/archetype": [{ label: "Overview", href: "/dashboard" }, { label: "Archetype" }],
  "/schools":   [{ label: "Schools" }],
  "/applications": [{ label: "Overview", href: "/dashboard" }, { label: "Applications" }],
  "/interviews": [{ label: "Overview", href: "/dashboard" }, { label: "Interviews" }],
  "/recommendations": [{ label: "Overview", href: "/dashboard" }, { label: "Letters" }],
  "/outline": [{ label: "Overview", href: "/dashboard" }, { label: "Statement outline" }],
  "/mock-interview": [{ label: "Overview", href: "/dashboard" }, { label: "Mock interview" }],
  "/admin/insights": [{ label: "Overview", href: "/dashboard" }, { label: "Insights" }],
  "/specialties": [{ label: "Specialties" }],
  "/gapyear":   [{ label: "Gap year" }],
  "/postbacc":  [{ label: "Post-bacc" }],
  "/resources": [{ label: "Resources" }],
  "/fee-tracker": [{ label: "Fees" }],
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
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--background)" }}
    >
      <a href="#content" className="skip-link">Skip to content</a>
      <RouteProgress />
      <PageView />
      {/* Sidebar - desktop */}
      <aside
        className="app-sidebar hidden md:flex flex-col fixed top-0 left-0 h-full z-40 w-[220px]"
        style={{
          backgroundColor: "var(--surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        <div className="px-5 pt-6 pb-4 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2.5" style={{ color: "var(--text)", textDecoration: "none" }}>
            <Logo size={28} />
            <span className="font-semibold" style={{ fontSize: "var(--text-sm)" }}>ClinicLog MD</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pb-3" aria-label="Main">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi}>
              {group.label && <p className="nav-group">{group.label}</p>}
              {group.items.map((item) => {
                const isActive = activePath.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch
                    className="nav-item"
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                    <LinkPending />
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="flex-shrink-0 px-2 py-3" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/profile" className="nav-item" aria-current={activePath.startsWith("/profile") ? "page" : undefined}>
            Profile and settings
          </Link>
          <div className="flex items-center justify-between gap-2" style={{ padding: "0 0 0 var(--sp-15)" }}>
            <p className="meta truncate" title={userEmail}>{userEmail}</p>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="btn btn-sm btn-ghost" style={{ color: "var(--text-muted)" }}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>


      {/* Main content */}
      <div className="md:ml-[220px] pb-[80px] md:pb-0">
        <div className="flex items-center justify-between gap-3 px-6 md:px-8 pt-6 pb-1">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap min-w-0">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span className="text-xs" aria-hidden="true" style={{ color: "var(--text-muted)" }}>/</span>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-xs hover:underline"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs" aria-current="page" style={{ color: "var(--text)" }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
          <div className="flex items-center gap-2 flex-shrink-0">
            <PageTourLink />
            <button type="button" onClick={openAdvisor} className="btn btn-sm btn-secondary hidden md:inline-flex">
              Ask the advisor
            </button>
            <HelpButton tourId="help-button" />
            <span data-tour="theme-toggle" className="inline-flex">
              <ThemeToggle />
            </span>
          </div>
        </div>

        <div id="content" tabIndex={-1} className="app-content" style={{ outline: "none" }}>{children}</div>
      </div>

      {/* Mobile bottom nav */}
      <nav
        className="app-bottomnav md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          height: 64,
          backgroundColor: "var(--surface)",
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
              prefetch
              aria-current={isActive ? "page" : undefined}
              className="flex-1 flex flex-col items-center justify-center gap-1"
              style={{ color: isActive ? "var(--text)" : "var(--text-muted)" }}
            >
              <span className="text-xs font-semibold leading-none">{item.label}</span>
              {/* Fixed-height rule in both states: the active marker must not
                  change the tab's box, or the bar shifts on every navigation. */}
              <span
                aria-hidden="true"
                style={{
                  display: "block",
                  width: 18,
                  height: 2,
                  background: isActive ? "currentColor" : "transparent",
                }}
              />
              <LinkPending />
            </Link>
          );
        })}

        <button
          type="button"
          onClick={() => setToolsOpen(true)}
          className="flex-1 flex items-center justify-center"
          style={{ color: "var(--text-muted)", background: "transparent", border: "none" }}
          aria-haspopup="dialog"
          aria-expanded={toolsOpen}
        >
          <span className="text-xs font-semibold leading-none">More</span>
        </button>

        {(() => {
          const isActive = activePath.startsWith(PROFILE_TAB.href);
          return (
            <Link
              href={PROFILE_TAB.href}
              className="flex-1 flex items-center justify-center"
              aria-current={isActive ? "page" : undefined}
              style={{ color: isActive ? "var(--text)" : "var(--text-muted)" }}
            >
              <span className="text-xs font-semibold leading-none">{PROFILE_TAB.label}</span>
            </Link>
          );
        })()}
      </nav>

      {/* Tools full-screen modal */}
      {toolsOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] flex flex-col"
          style={{ backgroundColor: "var(--surface)" }}
          role="dialog"
          aria-modal="true"
          aria-label="Everything else"
        >
          <div className="flex items-center justify-between px-5 flex-shrink-0" style={{ height: 64, borderBottom: "1px solid var(--border)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>Everything else</span>
            <button
              type="button"
              onClick={() => setToolsOpen(false)}
              aria-label="Close menu"
              className="flex items-center justify-center"
              style={{ width: 44, height: 44, background: "transparent", border: "none", borderRadius: "var(--radius-control)", color: "var(--text)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-6">
            <div className="flex flex-wrap gap-2" style={{ padding: "var(--sp-15) var(--sp-h)" }} onClick={() => setToolsOpen(false)}>
              <HelpButton tourId="help-tools" />
              <button type="button" onClick={openAdvisor} className="btn btn-sm btn-secondary">
                Ask the AI Advisor
              </button>
            </div>
            {NAV_GROUPS.map((group, gi) => (
              <div key={gi}>
                {group.label && <p className="nav-group">{group.label}</p>}
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setToolsOpen(false)}
                    className="nav-item"
                    style={{ minHeight: 44 }}
                    aria-current={activePath.startsWith(item.href) ? "page" : undefined}
                  >
                    {item.label}
                    <LinkPending />
                  </Link>
                ))}
              </div>
            ))}
            <p className="nav-group">About</p>
            {[
              { href: "/changelog", label: "Changelog" },
              { href: "/about", label: "About ClinicLog MD" },
            ].map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setToolsOpen(false)} className="nav-item" style={{ minHeight: 44 }}>
                {item.label}
              </Link>
            ))}

            {/* Sign out lives in the desktop sidebar, which is hidden below
                768px. Without this there is no way to sign out on a phone. */}
            <div style={{ paddingTop: "var(--sp-15)", marginTop: "var(--sp-2)", borderTop: "1px solid var(--border)" }}>
              <p className="meta truncate" style={{ padding: "0 var(--sp-15) var(--sp-1)" }}>{userEmail}</p>
              <form action="/auth/signout" method="POST">
                <button type="submit" className="nav-item w-full text-left" style={{ minHeight: 44, background: "transparent", border: 0, cursor: "pointer" }}>
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <AIAdvisorButton />
      <TourRoot />
    </div>
  );
}
