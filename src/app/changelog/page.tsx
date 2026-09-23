import Link from "next/link";
import { CHANGELOG } from "@/lib/changelog";
import { formatMedicalDate } from "@/lib/formatMedical";
import { EkgDivider, RecordNo } from "@/components/MedicalIcons";

export const metadata = {
  title: "Changelog | ClinicLog MD",
  description: "What has shipped in ClinicLog MD, newest first.",
};

export default function ChangelogPage() {
  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: "var(--bg-page)", borderBottom: "1px solid var(--border-strong)" }}
      >
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold" style={{ fontSize: "1.0625rem", textDecoration: "none", color: "var(--text-primary)" }}>
            ClinicLog MD
          </Link>
          <RecordNo page="/changelog" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-8)" }}>
        <p className="dept-header">Changelog</p>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)", marginBottom: "var(--sp-1)" }}>
          What has shipped.
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-5)" }}>
          Newest first. Every entry is something you can use today.
        </p>

        {CHANGELOG.map((entry, i) => (
          <article key={`${entry.date}-${entry.title}`}>
            {/* Journal-style masthead: stamp on the left, title beneath */}
            <div className="flex items-baseline gap-3 flex-wrap" style={{ marginBottom: 6 }}>
              <span className="exp-id">{formatMedicalDate(entry.date)}</span>
              {entry.tags.map((t) => (
                <span key={t} className="cat-tag">{t}</span>
              ))}
            </div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)", marginBottom: 4 }}>
              {entry.title}
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 620 }}>
              {entry.body}
            </p>
            {i < CHANGELOG.length - 1 && <EkgDivider />}
          </article>
        ))}
      </main>
    </div>
  );
}
