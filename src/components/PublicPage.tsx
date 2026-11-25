import Link from "next/link";
import Logo from "@/components/brand/Logo";

/** Frame for the pages anyone can read: About, Privacy, Terms, Changelog,
 *  Badge. Same header and footer, so they read as one site. */
export default function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--background)", color: "var(--text)" }}>
      <header style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between gap-3" style={{ maxWidth: 1120, margin: "0 auto", padding: "var(--sp-15) var(--sp-3)" }}>
          <Link href="/" className="inline-flex items-center gap-3 font-semibold" style={{ color: "var(--text)", textDecoration: "none", minHeight: 44 }}>
            <Logo size={24} />
            ClinicLog MD
          </Link>
          <nav aria-label="Site" className="flex items-center gap-5 text-sm">
            <Link href="/about" className="inline-flex items-center" style={{ minHeight: 44, color: "var(--text)" }}>About</Link>
            <Link href="/auth/login" className="inline-flex items-center" style={{ minHeight: 44, color: "var(--text)" }}>Sign in</Link>
          </nav>
        </div>
      </header>
      <main className="w-full flex-1" style={{ maxWidth: 1120, margin: "0 auto", padding: "var(--sp-6) var(--sp-3) var(--sp-8)" }}>
        {children}
      </main>
      <footer style={{ borderTop: "1px solid var(--border)" }}>
        <div className="flex flex-wrap items-center justify-end gap-3 text-xs" style={{ maxWidth: 1120, margin: "0 auto", padding: "var(--sp-3)", color: "var(--text-muted)" }}>
          <nav aria-label="Footer" className="flex flex-wrap gap-4">
            {[["About", "/about"], ["Privacy", "/privacy"], ["Terms", "/terms"], ["Changelog", "/changelog"], ["Data sources", "/data-sources"]].map(([label, href]) => (
              <Link key={href} href={href} className="inline-flex items-center" style={{ minHeight: 44, color: "var(--text-muted)" }}>{label}</Link>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  );
}
