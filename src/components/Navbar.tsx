"use client";
import { useState } from "react";
import Link from "next/link";


interface NavbarProps {
  userEmail: string;
  activePath?: string;
}

export default function Navbar({ userEmail, activePath }: NavbarProps) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/schools", label: "Schools" },
    { href: "/resources", label: "Resources" },
    { href: "/fee-tracker", label: "Fee Tracker" },
    { href: "/stories", label: "Stories" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <header style={{ backgroundColor: "rgba(22,33,62,0.95)", borderBottom: "1px solid rgba(232,160,32,0.18)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} className="px-6 py-4 relative z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#E8A020" }}>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
            </svg>
          </div>
          <span className="font-semibold text-lg" style={{ color: "#FFFFFF" }}>CliniLog</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>{userEmail}</span>
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm font-medium transition-colors" style={{ color: activePath === l.href ? "#E8A020" : "rgba(255,255,255,0.7)" }}>
              {l.label}
            </Link>
          ))}
          <form action="/auth/signout" method="POST">
            <button type="submit" className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: "#E8A020", border: "1px solid rgba(232,160,32,0.35)", background: "transparent" }}>
              Sign Out
            </button>
          </form>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg" style={{ color: "#E8A020", border: "1px solid rgba(232,160,32,0.25)" }} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="md:hidden absolute left-0 right-0 top-full z-50 px-6 py-4 space-y-3" style={{ backgroundColor: "rgba(22,33,62,0.98)", borderBottom: "1px solid rgba(232,160,32,0.18)" }}>
          <p className="text-xs pb-2" style={{ color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(232,160,32,0.1)" }}>{userEmail}</p>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-medium py-1.5" style={{ color: activePath === l.href ? "#E8A020" : "rgba(255,255,255,0.8)" }}>
              {l.label}
            </Link>
          ))}
          <form action="/auth/signout" method="POST" className="pt-1">
            <button type="submit" className="w-full text-sm py-2 rounded-lg font-medium" style={{ color: "#E8A020", border: "1px solid rgba(232,160,32,0.35)", background: "transparent" }}>
              Sign Out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
