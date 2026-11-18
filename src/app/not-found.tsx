import Link from "next/link";
import Logo from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="min-h-screen" style={{ background: "var(--background)", padding: "var(--sp-6) var(--sp-3)" }}>
      <div style={{ maxWidth: 1120, marginInline: "auto" }}>
        <Link href="/" className="inline-flex items-center gap-3 font-semibold" style={{ color: "var(--text)", textDecoration: "none", minHeight: 44 }}>
          <Logo size={28} />
          ClinicLog MD
        </Link>
        <div className="grid lg:grid-cols-12" style={{ gap: "var(--sp-4)", marginTop: "var(--sp-12)" }}>
          <p className="lg:col-span-4 display text-5xl" aria-hidden="true" style={{ color: "var(--border-strong)", fontWeight: 500, lineHeight: 1 }}>
            404
          </p>
          <div className="lg:col-span-7">
            <h1 className="text-3xl">We could not find that page.</h1>
            <p className="measure" style={{ color: "var(--text-muted)", marginTop: "var(--sp-2)" }}>
              The link may be old, or a letter may have slipped. Your entries are where you left them.
            </p>
            <div className="flex flex-wrap gap-2" style={{ marginTop: "var(--sp-4)" }}>
              <Link href="/dashboard" className="btn btn-primary">Go to your Overview</Link>
              <Link href="/" className="btn btn-ghost">Home page</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
