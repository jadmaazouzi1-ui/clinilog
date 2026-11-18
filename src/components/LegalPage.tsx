import Link from "next/link";

/** Shared shell for the Privacy and Terms pages. */
export default function LegalPage({
  page,
  title,
  updated,
  children,
}: {
  page: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid var(--border-strong)" }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold" style={{ fontSize: "1.0625rem", textDecoration: "none", color: "var(--text)" }}>
            ClinicLog MD
          </Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 legal-prose" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-8)" }}>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text)", marginBottom: 6 }}>{title}</h1>
        <p className="meta" style={{ marginBottom: "var(--sp-4)" }}>LAST UPDATED {updated}</p>
        {children}
        <hr className="rule" />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          <Link href="/privacy" style={{ color: "var(--action-text)" }}>Privacy Policy</Link>
          {"  /  "}
          <Link href="/terms" style={{ color: "var(--action-text)" }}>Terms of Use</Link>
          {"  /  "}
          <Link href="/" style={{ color: "var(--action-text)" }}>Home</Link>
        </p>
      </main>
    </div>
  );
}
