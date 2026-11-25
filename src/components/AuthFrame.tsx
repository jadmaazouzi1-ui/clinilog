import Link from "next/link";
import Logo from "@/components/brand/Logo";

/** Sign in, create account, reset and confirm pages. The form sits on the
 *  paper side; on wide screens a black band on the left carries the name and
 *  one sentence, the same band the home page opens with. */
export default function AuthFrame({
  title,
  intro,
  children,
  footer,
}: {
  title: string;
  intro?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-12" style={{ background: "var(--background)" }}>
      <aside
        className="hidden lg:flex lg:col-span-5 flex-col"
        style={{ background: "var(--surface-inverse)", color: "var(--text-inverse)", padding: "var(--sp-4) var(--sp-6)" }}
      >
        <Link href="/" className="inline-flex items-center gap-3 font-semibold" style={{ color: "var(--text-inverse)", textDecoration: "none", minHeight: 44 }}>
          <Logo size={28} />
          ClinicLog MD
        </Link>
        <p className="display text-3xl" style={{ maxWidth: "12ch", lineHeight: 1.1, fontWeight: 500, marginBlock: "auto" }}>
          Keep every hour ready for AMCAS.
        </p>
      </aside>

      <main className="lg:col-span-7 flex flex-col justify-center" style={{ padding: "var(--sp-6) var(--sp-3)" }}>
        <div className="w-full" style={{ maxWidth: 400, marginInline: "auto" }}>
          <Link href="/" className="lg:hidden inline-flex items-center gap-3 font-semibold" style={{ color: "var(--text)", textDecoration: "none", minHeight: 44, marginBottom: "var(--sp-4)" }}>
            <Logo size={28} />
            ClinicLog MD
          </Link>
          <h1 className="text-2xl">{title}</h1>
          {intro ? <div className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--sp-1)" }}>{intro}</div> : null}
          <div style={{ marginTop: "var(--sp-4)" }}>{children}</div>
          {footer ? <div className="text-sm" style={{ color: "var(--text-muted)", marginTop: "var(--sp-4)", paddingTop: "var(--sp-2)", borderTop: "1px solid var(--border)" }}>{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
