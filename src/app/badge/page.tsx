import Link from "next/link";
import BadgeCode from "./BadgeCode";
import { RecordNo } from "@/components/MedicalIcons";

export const metadata = {
  title: "Embeddable badge | ClinicLog MD",
  description: "Copy a small badge linking to ClinicLog MD.",
};

const SITE = "https://www.cliniclogmd.com";

/* Self-contained: inline styles only, no external CSS or script, so it
   renders the same wherever it is pasted and cannot be broken by a host
   page's stylesheet. */
const HTML_BADGE = `<a href="${SITE}" target="_blank" rel="noopener"
   style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;
          border:1px solid #16241D;border-radius:3px;background:#FFFFFF;
          color:#16241D;text-decoration:none;font:600 12px/1.2 system-ui,sans-serif;">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2D6A4F"
       stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12"/>
  </svg>
  Track your hours with ClinicLog MD
</a>`;

const DARK_BADGE = `<a href="${SITE}" target="_blank" rel="noopener"
   style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;
          border:1px solid #2D6A4F;border-radius:3px;background:#0B3D2E;
          color:#EAF3ED;text-decoration:none;font:600 12px/1.2 system-ui,sans-serif;">
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#74C69D"
       stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12"/>
  </svg>
  Track your hours with ClinicLog MD
</a>`;

const MARKDOWN_BADGE = `[Track your hours with ClinicLog MD](${SITE})`;

function Preview({ dark }: { dark?: boolean }) {
  return (
    <a
      href={SITE}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        border: `1px solid ${dark ? "#2D6A4F" : "#16241D"}`,
        borderRadius: 3,
        background: dark ? "#0B3D2E" : "#FFFFFF",
        color: dark ? "#EAF3ED" : "#16241D",
        textDecoration: "none",
        font: "600 12px/1.2 system-ui, sans-serif",
      }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={dark ? "#74C69D" : "#2D6A4F"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
      </svg>
      Track your hours with ClinicLog MD
    </a>
  );
}

export default function BadgePage() {
  return (
    <div style={{ backgroundColor: "var(--bg-page)", minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid var(--border-strong)" }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold" style={{ fontSize: "1.0625rem", textDecoration: "none", color: "var(--text-primary)" }}>
            ClinicLog MD
          </Link>
          <RecordNo page="/badge" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-8)" }}>
        <p className="dept-header">Embeddable badge</p>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)", marginBottom: "var(--sp-1)" }}>
          Put a badge on your site.
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-4)", maxWidth: 560 }}>
          For pre-med clubs, advising pages and personal sites. The markup is self-contained,
          with no external stylesheet or script, so it renders the same wherever you paste it.
        </p>

        <hr className="tear-line" />

        <p className="dept-header">Light</p>
        <div style={{ marginBottom: "var(--sp-2)" }}><Preview /></div>
        <BadgeCode label="HTML" code={HTML_BADGE} />

        <p className="dept-header">Dark</p>
        <div style={{ marginBottom: "var(--sp-2)" }}><Preview dark /></div>
        <BadgeCode label="HTML" code={DARK_BADGE} />

        <p className="dept-header">Markdown</p>
        <BadgeCode label="Markdown, for READMEs" code={MARKDOWN_BADGE} />
      </main>
    </div>
  );
}
