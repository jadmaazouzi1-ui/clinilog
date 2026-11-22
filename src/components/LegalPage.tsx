import PublicPage from "@/components/PublicPage";

export type LegalSection = { id: string; title: string };

/** Shared shell for the Privacy Policy and Terms of Service: the title,
 *  version and contents on the left (sticky on wide screens), and the text in
 *  one readable column on the right, starting with a plain summary box. */
export default function LegalPage({
  title,
  version,
  effective,
  summary,
  sections,
  children,
}: {
  title: string;
  version: string;
  effective: string;
  summary: React.ReactNode;
  sections: LegalSection[];
  children: React.ReactNode;
}) {
  return (
    <PublicPage>
      <div className="grid lg:grid-cols-12" style={{ gap: "var(--sp-4)" }}>
        <aside className="lg:col-span-4">
          <div className="legal-aside">
            <h1 className="text-3xl">{title}</h1>
            <p className="meta" style={{ marginTop: "var(--sp-1)" }}>
              Effective {effective}. Version {version}.
            </p>
            <nav aria-label="Contents" className="legal-toc no-print">
              <h2 className="label">Contents</h2>
              <ol>
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`}>
                      {i + 1}. {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
        </aside>
        <div className="lg:col-span-8 legal-prose">
          <section aria-label="Summary" className="legal-summary">
            <h2>The short version</h2>
            {summary}
          </section>
          {children}
        </div>
      </div>
    </PublicPage>
  );
}

/** One numbered section with an anchor the contents list links to. */
export function Section({ id, n, title, children }: { id: string; n: number; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="legal-section">
      <h2 id={`${id}-h`}>
        {n}. {title}
      </h2>
      {children}
    </section>
  );
}
