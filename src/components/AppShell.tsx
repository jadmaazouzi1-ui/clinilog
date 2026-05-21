"use client";

import { useState, useEffect } from "react";
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
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (active: boolean) => (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={active ? 2 : 1.75} />
        <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={active ? 2 : 1.75} />
        <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={active ? 2 : 1.75} />
        <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={active ? 2 : 1.75} />
      </svg>
    ),
  },
  {
    href: "/schools",
    label: "Schools",
    icon: (active: boolean) => (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.75} d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/resources",
    label: "Resources",
    icon: (active: boolean) => (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/fee-tracker",
    label: "Fee Tracker",
    icon: (active: boolean) => (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={active ? 2 : 1.75} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.75} d="M2 10h20" />
      </svg>
    ),
  },
  {
    href: "/stories",
    label: "Stories",
    icon: (active: boolean) => (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.75} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" strokeWidth={active ? 2 : 1.75} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.75} d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (active: boolean) => (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" strokeWidth={active ? 2 : 1.75} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2 : 1.75} d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

// Bottom tab bar uses the first 5 items
const BOTTOM_TABS = NAV_ITEMS.slice(0, 5);

const AUTO_BREADCRUMBS: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ label: "Dashboard" }],
  "/schools":   [{ label: "Schools" }],
  "/resources": [{ label: "Resources" }],
  "/fee-tracker": [{ label: "Fee Tracker" }],
  "/stories":   [{ label: "Stories" }],
  "/profile":   [{ label: "Profile" }],
};

export default function AppShell({ userEmail, activePath, breadcrumbs, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("cl-sidebar-collapsed") === "true") setCollapsed(true);
    } catch { /* ignore */ }
  }, []);

  function toggle() {
    const next = !collapsed;
    setCollapsed(next);
    try { localStorage.setItem("cl-sidebar-collapsed", String(next)); } catch { /* ignore */ }
  }

  const crumbs = breadcrumbs ?? AUTO_BREADCRUMBS[activePath] ?? [];

  return (
    <div className="min-h-screen dot-grid-bg" style={{ backgroundColor: "#0A1628" }}>

      {/* ── Desktop Sidebar ─────────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full z-40 overflow-hidden"
        style={{
          width: collapsed ? 64 : 240,
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          backgroundColor: "rgba(6,14,28,0.98)",
          borderRight: "1px solid rgba(0,212,255,0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center px-3.5 py-[18px] flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(0,212,255,0.08)" }}
        >
          <Link href="/" className="flex items-center gap-3 min-w-0 hover:opacity-80 transition-opacity">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#00D4FF", boxShadow: "0 0 14px rgba(0,212,255,0.4)" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 12 6 9 9 13 12 7 15 11 18 8 21 12" />
              </svg>
            </div>
            {!collapsed && (
              <span className="font-bold text-base tracking-wide whitespace-nowrap" style={{ color: "#F8FAFC" }}>
                CliniLog
              </span>
            )}
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className="group relative flex items-center gap-3 px-2.5 py-2.5 rounded-xl transition-all duration-150"
                style={{
                  color: isActive ? "#00D4FF" : "rgba(248,250,252,0.55)",
                  backgroundColor: isActive ? "rgba(0,212,255,0.08)" : "transparent",
                  borderLeft: `2px solid ${isActive ? "#00D4FF" : "transparent"}`,
                  boxShadow: isActive ? "inset 4px 0 12px rgba(0,212,255,0.06)" : "none",
                }}
              >
                {item.icon(isActive)}
                {!collapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
                {/* Collapsed tooltip */}
                {collapsed && (
                  <span
                    className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
                    style={{ backgroundColor: "#1E2A3A", color: "#00D4FF", border: "1px solid rgba(0,212,255,0.25)", boxShadow: "0 4px 12px rgba(0,0,0,0.4)" }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div
          className="flex-shrink-0 px-2 pb-3 pt-2 space-y-1"
          style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}
        >
          {/* Collapse toggle */}
          <button
            onClick={toggle}
            title={collapsed ? "Expand" : "Collapse"}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ color: "rgba(248,250,252,0.35)" }}
          >
            <svg
              className="w-5 h-5 flex-shrink-0 transition-transform duration-300"
              style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
            </svg>
            {!collapsed && <span className="text-xs whitespace-nowrap">Collapse</span>}
          </button>

          {/* User email */}
          {!collapsed && (
            <div className="px-2.5 py-1">
              <p className="text-xs truncate" style={{ color: "rgba(248,250,252,0.3)" }}>{userEmail}</p>
            </div>
          )}

          {/* Sign out */}
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              title={collapsed ? "Sign Out" : undefined}
              className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl transition-colors hover:bg-white/5"
              style={{ color: "rgba(248,250,252,0.4)" }}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!collapsed && <span className="text-sm whitespace-nowrap">Sign Out</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <div className={`${collapsed ? "md:ml-16" : "md:ml-60"} transition-all duration-300 pb-16 md:pb-0`}>
        {/* Breadcrumbs */}
        {crumbs.length > 0 && (
          <div className="flex items-center gap-1.5 px-6 pt-5 pb-1">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="#00D4FF" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-xs font-medium hover:opacity-80 transition-opacity"
                    style={{ color: "#00D4FF" }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-xs font-medium" style={{ color: "rgba(248,250,252,0.5)" }}>
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </div>
        )}

        {/* Page content with fade-in */}
        <div className="page-fade-in">
          {children}
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar ────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
        style={{
          height: 60,
          backgroundColor: "rgba(6,14,28,0.98)",
          borderTop: "1px solid rgba(0,212,255,0.15)",
          backdropFilter: "blur(20px)",
        }}
      >
        {BOTTOM_TABS.map((item) => {
          const isActive = activePath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
              style={{
                color: isActive ? "#00D4FF" : "rgba(248,250,252,0.4)",
                borderTop: `2px solid ${isActive ? "#00D4FF" : "transparent"}`,
              }}
            >
              <span style={{ filter: isActive ? "drop-shadow(0 0 5px rgba(0,212,255,0.7))" : "none" }}>
                {item.icon(isActive)}
              </span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <AIAdvisorButton />
    </div>
  );
}
