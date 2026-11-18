import Link from "next/link";
import { CHANGELOG } from "@/lib/changelog";
import { formatDate } from "@/lib/format";
import ChangelogNote from "@/components/tour/ChangelogNote";
import TourRoot from "@/components/tour/TourRoot";

export const metadata = {
  description: "What has shipped in ClinicLog MD, newest first.",
};

export default function ChangelogPage() {
  return (
    <div style={{ backgroundColor: "var(--background)", minHeight: "100vh" }}>
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: "var(--background)", borderBottom: "1px solid var(--border-strong)" }}
      >
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold" style={{ fontSize: "1.0625rem", textDecoration: "none", color: "var(--text)" }}>
            ClinicLog MD
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-8)" }}>
        <ChangelogNote />
        <p className="section-title">Changelog</p>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text)", marginBottom: "var(--sp-1)" }}>
          What has shipped.
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-5)" }}>
          Newest first. Every entry is something you can use today.
        </p>

        {CHANGELOG.map((entry, i) => (
          <article key={`${entry.date}-${entry.title}`}>
            {/* Journal-style masthead: stamp on the left, title beneath */}
            <div className="flex items-baseline gap-3 flex-wrap" style={{ marginBottom: 6 }}>
              <span className="meta">{formatDate(entry.date)}</span>
              {entry.tags.map((t) => (
                <span key={t} className="badge">{t}</span>
              ))}
            </div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text)", marginBottom: 4 }}>
              {entry.title}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-muted)", lineHeight: 1.7, maxWidth: 620 }}>
              {entry.body}
            </p>
            {i < CHANGELOG.length - 1 && <hr className="rule" />}
          </article>
        ))}
      </main>
      <TourRoot />
    </div>
  );
}
