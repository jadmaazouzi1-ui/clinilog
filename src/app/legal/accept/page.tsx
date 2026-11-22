import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/safeRedirect";
import AuthFrame from "@/components/AuthFrame";
import { Notice } from "@/components/ui";
import { LEGAL_CHANGES, LEGAL_EFFECTIVE, LEGAL_VERSION } from "@/lib/legal";

export const metadata = {
  description: "Review and accept the updated Terms of Service and Privacy Policy.",
};

export default async function AcceptLegalPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNextPath(rawNext ?? null, "/dashboard");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  if (user.user_metadata?.legal_version === LEGAL_VERSION) redirect(next);

  const firstTime = !user.user_metadata?.legal_version;

  async function accept(formData: FormData) {
    "use server";
    const target = safeNextPath(String(formData.get("next") ?? ""), "/dashboard");
    if (formData.get("agree") !== "on") {
      redirect(`/legal/accept?next=${encodeURIComponent(target)}&error=${encodeURIComponent("Tick the box to continue.")}`);
    }
    const sb = await createClient();
    const { error: rpcError } = await sb.rpc("accept_legal", { p_version: LEGAL_VERSION });
    if (rpcError) {
      console.error("[accept_legal]", rpcError.message);
      redirect(`/legal/accept?next=${encodeURIComponent(target)}&error=${encodeURIComponent("That did not save. Please try again.")}`);
    }
    // Pick up the new metadata in this session's token.
    await sb.auth.refreshSession();
    redirect(target);
  }

  return (
    <AuthFrame
      title={firstTime ? "Before you continue" : "We updated our terms"}
      intro={
        firstTime
          ? `ClinicLog MD has a Terms of Service and a Privacy Policy, in effect from ${LEGAL_EFFECTIVE}. Please read and accept them to keep using the app.`
          : `New versions of the Terms of Service and Privacy Policy take effect on ${LEGAL_EFFECTIVE}. Here is what changed.`
      }
    >
      {error && (
        <div style={{ marginBottom: "var(--sp-3)" }}>
          <Notice tone="danger">{error}</Notice>
        </div>
      )}
      <ul className="text-sm" style={{ display: "grid", gap: "var(--sp-1)", color: "var(--text-muted)", marginBottom: "var(--sp-3)", paddingLeft: "1.1rem", listStyle: "disc" }}>
        {LEGAL_CHANGES.map((c) => <li key={c}>{c}</li>)}
      </ul>
      <p className="text-sm" style={{ marginBottom: "var(--sp-3)" }}>
        Read the full <Link href="/terms" className="link" target="_blank">Terms of Service</Link> and{" "}
        <Link href="/privacy" className="link" target="_blank">Privacy Policy</Link> (each opens in a new tab).
      </p>
      <form action={accept} style={{ display: "grid", gap: "var(--sp-3)" }}>
        <input type="hidden" name="next" value={next} />
        <label className="text-sm flex items-start gap-3" style={{ cursor: "pointer" }}>
          <input type="checkbox" name="agree" required style={{ marginTop: 3 }} />
          <span>I am 18 or older, and I agree to the Terms of Service and the Privacy Policy.</span>
        </label>
        <button type="submit" className="btn btn-primary btn-block">Accept and continue</button>
      </form>
      <form action="/auth/signout" method="POST" style={{ marginTop: "var(--sp-2)" }}>
        <button type="submit" className="btn btn-sm btn-ghost">Sign out instead</button>
      </form>
    </AuthFrame>
  );
}
