import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkAuthRateLimit, clientIpFrom } from "@/lib/rateLimit";
import { REFERRAL_COOKIE } from "@/lib/referral";
import { isAllowedSignupEmail } from "@/lib/allowedEmail";

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
    <div className="min-h-screen dot-grid-bg flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center mb-4">
            <span className="text-2xl" style={{ color: "var(--text-primary)", fontWeight: 900, letterSpacing: "-0.02em" }}>ClinicLog MD</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Create your account</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Start logging your clinical experiences today
          </p>
        </div>

        {/* Card */}
        <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
          {pageError && (
            <div
              className="mb-5 text-sm px-4 py-3"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-strong)", color: "var(--text-primary)" }}
            >
              {decodeURIComponent(pageError)}
            </div>
          )}
          <form action={signup} className="space-y-5">
            <input type="hidden" name="referral_code" value={refCode} />
            <div>
              <label
                htmlFor="name"
                className="field-label"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="field-input"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="field-label"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="field-input"
                placeholder="you@wfu.edu"
                pattern=".+@[Ww][Ff][Uu]\.[Ee][Dd][Uu]"
                title="Use your @wfu.edu email address"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="field-label"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                className="field-input"
                placeholder="At least 10 characters"
              />
            </div>

            <button
              type="submit"
              className="w-full teal-glow font-semibold text-sm focus:outline-none" style={{ padding: "11px 0" }}
            >
              Create Account
            </button>
            <p className="text-xs text-center" style={{ color: "var(--text-tertiary)", marginTop: "var(--sp-2)" }}>
              By creating an account you agree to the{" "}
              <Link href="/terms" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Terms</Link> and{" "}
              <Link href="/privacy" style={{ color: "var(--text-secondary)", textDecoration: "underline" }}>Privacy Policy</Link>.
            </p>
          </form>
        </div>

        <p className="text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium"
            style={{ color: "var(--text-primary)" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
