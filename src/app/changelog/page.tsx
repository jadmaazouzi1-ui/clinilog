import PublicPage from "@/components/PublicPage";
import { CHANGELOG } from "@/lib/changelog";
import { formatDate } from "@/lib/format";
import ChangelogNote from "@/components/tour/ChangelogNote";
import TourRoot from "@/components/tour/TourRoot";

export const metadata = {
  description: "What has shipped in ClinicLog MD, newest first.",
};

export default function ChangelogPage() {
  return (
    <PublicPage>
      <ChangelogNote />
      <div className="grid lg:grid-cols-12" style={{ gap: "var(--sp-4)", marginBottom: "var(--sp-5)" }}>
        <h1 className="text-3xl lg:col-span-4">Changelog</h1>
        <p className="lg:col-span-8 measure" style={{ color: "var(--text-muted)" }}>
          What has changed, newest first. Every entry describes something in the app today.
        </p>
      </div>
      <ol style={{ borderTop: "1px solid var(--border-strong)" }}>
        {CHANGELOG.map((entry) => (
          <li key={`${entry.date}-${entry.title}`} className="grid lg:grid-cols-12" style={{ gap: "var(--sp-1) var(--sp-4)", padding: "var(--sp-3) 0", borderBottom: "1px solid var(--border)" }}>
            <div className="lg:col-span-4">
              <time dateTime={entry.date} className="text-sm tnum" style={{ color: "var(--text-muted)" }}>{formatDate(entry.date)}</time>
              <p className="flex flex-wrap gap-1" style={{ marginTop: "var(--sp-h)" }}>
                {entry.tags.map((t) => <span key={t} className="badge">{t}</span>)}
              </p>
            </div>
            <article className="lg:col-span-8">
              <h2 className="text-xl">{entry.title}</h2>
              <p className="measure" style={{ color: "var(--text-muted)", marginTop: "var(--sp-h)" }}>{entry.body}</p>
            </article>
          </li>
        ))}
      </ol>
      <TourRoot />
    </PublicPage>
  );
}
