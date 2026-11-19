import Link from "next/link";
import { DATA_PAGE } from "@/lib/data-sources";

/** "About this data": always open on wide screens, collapsible on phones so
 *  it does not push the results below the fold. */
export default function DataNote({ text, id = "about-this-data" }: { text: string; id?: string }) {
  const body = (
    <p className="text-sm measure" style={{ color: "var(--text-muted)" }}>
      {text} <Link href={DATA_PAGE} className="link">See all sources</Link>
    </p>
  );
  return (
    <aside id={id} aria-label="About this data" className="card" style={{ padding: "var(--sp-15) var(--sp-2)", marginBottom: "var(--sp-3)" }}>
      <div className="hidden md:block">
        <p className="text-sm font-semibold" style={{ marginBottom: 2 }}>About this data</p>
        {body}
      </div>
      <details className="md:hidden">
        <summary className="text-sm font-semibold" style={{ cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>
          About this data
        </summary>
        {body}
      </details>
    </aside>
  );
}

/** "Source: ... See About this data." under a figure. */
export function SourceLine({ children, anchor = "#about-this-data" }: { children: React.ReactNode; anchor?: string }) {
  return (
    <p className="text-sm" style={{ color: "var(--text-muted)" }}>
      {children} <a href={anchor} className="link">About this data</a>
    </p>
  );
}
