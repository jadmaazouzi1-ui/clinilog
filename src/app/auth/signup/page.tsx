import { redirect } from "next/navigation";
import AuthFrame from "@/components/AuthFrame";
import { LEGAL_VERSION } from "@/lib/legal";
import { Notice } from "@/components/ui";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkAuthRateLimit, clientIpFrom } from "@/lib/rateLimit";
import { REFERRAL_COOKIE } from "@/lib/referral";
import { isAllowedSignupEmail } from "@/lib/allowedEmail";

export const metadata = {
  description: "Create a ClinicLog MD account with your @wfu.edu email.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; ref?: string }>;
}) {
  // Already-authed users skip the signup form.
  const supabaseInit = await createClient();
  const { data: { user: existingUser } } = await supabaseInit.auth.getUser();
  if (existingUser) redirect("/dashboard");

  const params = await searchParams;
  const pageError = params?.error;
  // Only A-Z and 2-9 are ever issued, so anything else is discarded rather
  // than stored and echoed back.
  const refCode = (params?.ref ?? "").toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 12);

  async function signup(formData: FormData) {
    "use server";

    const referral = String(formData.get("referral_code") ?? "")
      .toUpperCase()
      .replace(/[^A-Z2-9]/g, "")
      .slice(0, 12);
    const name = String(formData.get("name") ?? "").trim().slice(0, 100);
    const email = String(formData.get("email") ?? "").trim().toLowerCase().slice(0, 320);
    const password = String(formData.get("password") ?? "");

    if (!isAllowedSignupEmail(email)) {
      redirect(`/auth/signup?error=${encodeURIComponent("Sign up with your Wake Forest email address (@wfu.edu).")}`);
    }

    // Enforced here, not only by the input's minLength, which a client can
    // remove. Supabase applies its own minimum too, set to the same value.
    if (password.length < 10 || password.length > 128) {
      redirect(`/auth/signup?error=${encodeURIComponent("Use a password of at least 10 characters.")}`);
    }

    // Checked on the server too: the checkbox's required attribute can be
    // removed in the browser.
    if (formData.get("agree") !== "on") {
      redirect(`/auth/signup?error=${encodeURIComponent("Confirm you are 18 or older and agree to the Terms and Privacy Policy.")}`);
    }

    const supabase = await createClient();

    const ip = clientIpFrom(await headers());
    const limit = await checkAuthRateLimit(supabase, `ip:${ip}`, "signup", 5, 3600);
    if (!limit.allowed) {
      redirect(`/auth/signup?error=${encodeURIComponent("Too many signup attempts. Please try again later.")}`);
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          // Copied to profiles.legal_version, with the time, by the
          // handle_new_user() trigger when the account is created.
          legal_version: LEGAL_VERSION,
        },
      },
    });

    if (error) {
      console.error("[signup]", error.message);
      // Only password-policy failures are shown, because the user can act on
      // them. Anything else, including "already registered", takes the same
      // path as a successful signup so the form cannot reveal which emails
      // have accounts.
      if (/password/i.test(error.message)) {
        redirect(`/auth/signup?error=${encodeURIComponent("That password is too weak or has appeared in a data breach. Choose a different one.")}`);
      }
      redirect("/auth/verify-email");
    }

    // Held until the new account first signs in: with email confirmation there
    // is no session yet, so the referral row cannot be written here.
    if (referral) {
      const jar = await cookies();
      jar.set(REFERRAL_COOKIE, referral, {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }

    redirect("/auth/verify-email");
  }

  return (
    <AuthFrame
      title="Create an account"
      intro="Use your @wfu.edu email. We will send a link to confirm it before you can sign in."
      footer={<>Already have an account? <Link href="/auth/login" className="link">Sign in</Link></>}
    >
      {pageError && (
        <div style={{ marginBottom: "var(--sp-3)" }}>
          <Notice tone="danger">{decodeURIComponent(pageError)}</Notice>
        </div>
      )}
      <form action={signup} style={{ display: "grid", gap: "var(--sp-3)" }}>
        <input type="hidden" name="referral_code" value={refCode} />
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <input id="name" name="name" type="text" required autoComplete="name" className="field" />
        </div>
        <div>
          <label htmlFor="email" className="label">Wake Forest email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
            placeholder="you@wfu.edu"
            pattern=".+@[Ww][Ff][Uu]\.[Ee][Dd][Uu]"
            title="Use your @wfu.edu email address"
          />
        </div>
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            className="field"
            aria-describedby="password-hint"
          />
          <p className="hint" id="password-hint">At least 10 characters.</p>
        </div>
        <label className="text-sm flex items-start gap-3" style={{ cursor: "pointer" }}>
          <input type="checkbox" name="agree" required style={{ marginTop: 3 }} />
          <span>
            I am 18 or older, and I agree to the <Link href="/terms" className="link" target="_blank">Terms of Service</Link> and
            the <Link href="/privacy" className="link" target="_blank">Privacy Policy</Link>.
          </span>
        </label>
        <button type="submit" className="btn btn-primary btn-block">Create account</button>
      </form>
    </AuthFrame>
  );
}
