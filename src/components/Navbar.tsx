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
    <header style={{ backgroundColor: "#FFFFFF", borderBottom: "2px solid #000000" }} className="px-6 py-4 relative z-50">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span className="text-xl" style={{ color: "#000000", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }}>CliniLog</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4">
          <span className="text-sm" style={{ color: "rgba(0,0,0,0.6)" }}>{userEmail}</span>
          {links.map(l => (
            <Link key={l.href} href={l.href} className="text-sm font-medium transition-colors" style={{ color: activePath === l.href ? "#000000" : "rgba(0,0,0,0.7)" }}>
              {l.label}
            </Link>
          ))}
          <form action="/auth/signout" method="POST">
            <button type="submit" className="text-sm px-3 py-1.5 rounded-lg transition-colors" style={{ color: "#000000", border: "2px solid #000000", background: "transparent" }}>
              Sign Out
            </button>
          </form>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2 rounded-lg" style={{ color: "#000000", border: "2px solid #000000" }} onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {open && (
        <div className="md:hidden absolute left-0 right-0 top-full z-50 px-6 py-4 space-y-3" style={{ backgroundColor: "#FFFFFF", borderBottom: "2px solid #000000" }}>
          <p className="text-xs pb-2" style={{ color: "rgba(0,0,0,0.4)", borderBottom: "2px solid #000000" }}>{userEmail}</p>
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block text-sm font-medium py-1.5" style={{ color: activePath === l.href ? "#000000" : "rgba(0,0,0,0.8)" }}>
              {l.label}
            </Link>
          ))}
          <form action="/auth/signout" method="POST" className="pt-1">
            <button type="submit" className="w-full text-sm py-2 rounded-lg font-medium" style={{ color: "#000000", border: "2px solid #000000", background: "transparent" }}>
              Sign Out
            </button>
          </form>
        </div>
      )}
    </header>
  );
}
