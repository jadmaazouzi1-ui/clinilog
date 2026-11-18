import PublicPage from "@/components/PublicPage";

/** Shared shell for the Privacy and Terms pages: the title and date on the
 *  left, the text in a single readable column on the right. */
export default function LegalPage({
  title,
  updated,
  children,
}: {
  page?: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <PublicPage>
      <div className="grid lg:grid-cols-12" style={{ gap: "var(--sp-4)" }}>
        <div className="lg:col-span-4">
          <h1 className="text-3xl">{title}</h1>
          <p className="meta" style={{ marginTop: "var(--sp-1)" }}>Last updated {updated}</p>
        </div>
        <div className="lg:col-span-8 legal-prose">{children}</div>
      </div>
    </PublicPage>
  );
}
