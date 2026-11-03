import Link from "next/link";
import BadgeCode from "./BadgeCode";
import { RecordNo } from "@/components/MedicalIcons";
import Logo from "@/components/brand/Logo";
import { markSvg } from "@/lib/logo";
import { PALETTE as P } from "@/lib/palette";

export const metadata = {
  title: "Embeddable badge | ClinicLog MD",
  description: "Copy a small badge linking to ClinicLog MD.",
};

const SITE = "https://www.cliniclogmd.com";

/* Self-contained: inline styles only, no external CSS or script, so it
   renders the same wherever it is pasted and cannot be broken by a host
   page's stylesheet. The colours are literal for that reason, taken from the
   palette that mirrors theme.css. */
const BADGE = {
  light: { border: P.black, bg: P.white, text: P.ink },
  dark: { border: P.gold500, bg: P.black, text: P.cream },
};

function badgeHtml(t: { border: string; bg: string; text: string }) {
  return `<a href="${SITE}" target="_blank" rel="noopener"
   style="display:inline-flex;align-items:center;gap:8px;padding:8px 12px;
          border:2px solid ${t.border};background:${t.bg};
          color:${t.text};text-decoration:none;font:600 12px/1.2 system-ui,sans-serif;">
  ${markSvg(16)}
  Track your hours with ClinicLog MD
</a>`;
}

const HTML_BADGE = badgeHtml(BADGE.light);
const DARK_BADGE = badgeHtml(BADGE.dark);

const MARKDOWN_BADGE = `[Track your hours with ClinicLog MD](${SITE})`;

function Preview({ dark }: { dark?: boolean }) {
  const t = dark ? BADGE.dark : BADGE.light;
  return (
    <a
      href={SITE}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        border: `2px solid ${t.border}`,
        borderRadius: 0,
        background: t.bg,
        color: t.text,
        textDecoration: "none",
        font: "600 12px/1.2 system-ui, sans-serif",
      }}
    >
      <Logo size={16} />
      Track your hours with ClinicLog MD
    </a>
  );
}

export default function BadgePage() {
  return (
    <div style={{ backgroundColor: "var(--bg)", minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid var(--border-strong)" }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold" style={{ fontSize: "1.0625rem", textDecoration: "none", color: "var(--text)" }}>
            ClinicLog MD
          </Link>
          <RecordNo page="/badge" />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6" style={{ paddingTop: "var(--sp-6)", paddingBottom: "var(--sp-8)" }}>
        <p className="dept-header">Embeddable badge</p>
        <h1 className="text-3xl font-bold" style={{ color: "var(--text)", marginBottom: "var(--sp-1)" }}>
          Put a badge on your site.
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-4)", maxWidth: 560 }}>
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
