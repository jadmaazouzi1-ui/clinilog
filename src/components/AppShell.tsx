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
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/archetype",
    label: "My Archetype",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    href: "/schools",
    label: "Schools",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 21V7l9-4 9 4v14M9 21V12h6v9" />
      </svg>
    ),
  },
  {
    href: "/specialties",
    label: "Specialties",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
        <path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4" />
        <circle cx="20" cy="10" r="2" />
      </svg>
    ),
  },
  {
    href: "/gapyear",
    label: "Gap Year",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/postbacc",
    label: "Post-bacc",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/resources",
    label: "Resources",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    href: "/fee-tracker",
    label: "Fee Tracker",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2 10h20" />
      </svg>
    ),
  },
  {
    href: "/stories",
    label: "Stories",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/import",
    label: "Import CSV",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
];

const BOTTOM_TABS = NAV_ITEMS.slice(0, 5);

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
    <div className="min-h-screen" style={{ backgroundColor: "#000000" }}>
      {/* Sidebar — desktop */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-full z-40 sidebar-collapse ${collapsed ? "is-collapsed" : ""}`}
        style={{
          backgroundColor: "#000000",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div className="px-4 py-5 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div
              className="w-7 h-7 flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#FFFFFF", borderRadius: 1 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
              </svg>
            </div>
            {!collapsed && (
              <>
                <span className="font-medium text-sm tracking-tight whitespace-nowrap" style={{ color: "#FFFFFF" }}>
                  CliniLog
                </span>
                <span className="beta-pill">BETA</span>
              </>
            )}
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activePath.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className="group relative flex items-center gap-3 px-3 py-2 transition-colors duration-150"
                style={{
                  color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                  backgroundColor: isActive ? "rgba(255,255,255,0.04)" : "transparent",
                  fontWeight: isActive ? 500 : 400,
                  borderLeft: isActive ? "2px solid #FFFFFF" : "2px solid transparent",
                  borderRadius: 0,
                }}
              >
                {item.icon}
                {!collapsed && (
                  <span className="text-[13px] whitespace-nowrap">{item.label}</span>
                )}
                {collapsed && (
                  <span
                    className="pointer-events-none absolute left-full ml-3 px-2.5 py-1 text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50"
                    style={{ backgroundColor: "#111111", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 1 }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className="flex-shrink-0 px-2 pb-3 pt-2 space-y-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={toggle}
            title={collapsed ? "Expand" : "Collapse"}
            className="w-full flex items-center gap-3 px-2.5 py-1.5 transition-colors"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            <svg
              className="w-4 h-4 flex-shrink-0 transition-transform duration-300"
              style={{ transform: collapsed ? "rotate(180deg)" : "none" }}
              fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
            </svg>
            {!collapsed && <span className="text-[10px] mono whitespace-nowrap uppercase tracking-widest">Collapse</span>}
          </button>

          {!collapsed && (
            <div className="px-2.5 py-1">
              <p className="text-[10px] mono truncate" style={{ color: "rgba(255,255,255,0.45)" }}>{userEmail}</p>
            </div>
          )}

          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              title={collapsed ? "Sign Out" : undefined}
              className="w-full flex items-center gap-3 px-2.5 py-1.5 transition-colors"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!collapsed && <span className="text-[13px] whitespace-nowrap">Sign Out</span>}
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className={`${collapsed ? "md:ml-16" : "md:ml-[232px]"} transition-all duration-300 pb-16 md:pb-0`}>
        {crumbs.length > 0 && (
          <div className="flex items-center gap-1.5 px-6 pt-5 pb-1">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && (
                  <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="rgba(255,255,255,0.35)" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className="text-[10px] mono uppercase tracking-widest font-medium hover:opacity-80"
                    style={{ color: "rgba(255,255,255,0.55)" }}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-[10px] mono uppercase tracking-widest font-medium" style={{ color: "rgba(255,255,255,0.35)" }}>
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
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
        style={{ height: 56, backgroundColor: "#000000", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        {BOTTOM_TABS.map((item) => {
          const isActive = activePath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors"
              style={{
                color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.3)",
                borderTop: `2px solid ${isActive ? "#FFFFFF" : "transparent"}`,
              }}
            >
              {item.icon}
              <span className="text-[10px] mono font-medium leading-none uppercase tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <AIAdvisorButton />
    </div>
  );
}
