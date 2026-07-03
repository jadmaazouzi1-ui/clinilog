"use client";

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
  const crumbs = breadcrumbs ?? AUTO_BREADCRUMBS[activePath] ?? [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Sidebar — desktop. Text labels only, 2px black right border. */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-full z-40 w-[232px]"
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
              CliniLog
            </span>
            <span className="beta-pill">BETA</span>
          </Link>
        </div>

        {/* Nav items — active inverts to black */}
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
      `}</style>

      {/* Main content */}
      <div className="md:ml-[232px] pb-16 md:pb-0">
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

      {/* Mobile bottom nav — text labels only */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
        style={{ height: 52, backgroundColor: "#FFFFFF", borderTop: "2px solid #000000" }}
      >
        {BOTTOM_TABS.map((item) => {
          const isActive = activePath.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex items-center justify-center"
              style={{
                color: isActive ? "#FFFFFF" : "#000000",
                backgroundColor: isActive ? "#000000" : "#FFFFFF",
              }}
            >
              <span className="text-[10px] mono font-bold leading-none uppercase tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <AIAdvisorButton />
    </div>
  );
}
