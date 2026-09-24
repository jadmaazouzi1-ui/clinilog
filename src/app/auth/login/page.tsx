import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkAuthRateLimit, clientIpFrom } from "@/lib/rateLimit";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; view?: string; sent?: string }>;
}) {
  // Already-authed users skip the login form.
  const supabaseInit = await createClient();
  const { data: { user: existingUser } } = await supabaseInit.auth.getUser();
  if (existingUser) redirect("/dashboard");

  const params = await searchParams;
  const pageError = params?.error;
  const view = params?.view;
  const sent = params?.sent;

  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();

    const ip = clientIpFrom(await headers());
    const limit = await checkAuthRateLimit(supabase, `ip:${ip}`, "login", 10, 3600);
    if (!limit.allowed) {
      redirect(`/auth/login?error=${encodeURIComponent("Too many login attempts. Please try again in an hour.")}`);
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    }
    redirect("/dashboard");
  }

  async function forgotPassword(formData: FormData) {
    "use server";
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();
    const supabase = await createClient();

    const emailLimit = await checkAuthRateLimit(supabase, `email:${email}`, "forgot_password", 3, 3600);
    if (!emailLimit.allowed) {
      redirect(`/auth/login?view=forgot&error=${encodeURIComponent("Password reset already sent. Check your email or try again later.")}`);
    }

    const headersList = await headers();
    const host = headersList.get("host") ?? "";
    const proto = headersList.get("x-forwarded-proto") ?? "https";
    const origin = `${proto}://${host}`;
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
    });
    redirect("/auth/login?view=forgot&sent=1");
  }

  const LogoMark = () => (
    <div className="inline-flex items-center mb-4">
      <span className="text-2xl" style={{ color: "var(--text-primary)", fontWeight: 900, letterSpacing: "-0.02em" }}>ClinicLog MD</span>
    </div>
  );

  if (view === "forgot") {
    return (
      <div className="min-h-screen dot-grid-bg flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-page)" }}>
        <div className="w-full max-w-md">
          <div className="mb-8">
            <LogoMark />
          </div>

          {sent === "1" ? (
            <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-strong)" }}
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                Check your email
              </h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                We sent a password reset link to your email address. It may take a minute to arrive.
              </p>
              <Link href="/auth/login" className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Reset your password</h1>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
                {pageError && (
                  <div
                    className="mb-5 text-sm"
                    style={{ padding: "10px var(--sp-2)", background: "rgba(193,18,31,0.06)", border: "1px solid rgba(193,18,31,0.28)", borderLeft: "2px solid var(--margin-rule)", borderRadius: "var(--radius)", color: "var(--margin-rule)" }}
                  >
                    {decodeURIComponent(pageError)}
                  </div>
                )}
                <form action={forgotPassword} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="field-label">
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="field-input"
                      placeholder="you@university.edu"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full teal-glow font-semibold text-sm focus:outline-none" style={{ padding: "11px 0" }}
                  >
                    Send Reset Email
                  </button>
                </form>
              </div>

              <p className="text-sm mt-6">
                <Link href="/auth/login" className="font-medium" style={{ color: "var(--text-primary)" }}>
                  ← Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dot-grid-bg flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="w-full max-w-md">
        <div className="mb-8">
          <LogoMark />
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Sign in to your account to continue
          </p>
        </div>

        <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
          {pageError && (
            <div
              className="mb-5 text-sm"
                    style={{ padding: "10px var(--sp-2)", background: "rgba(193,18,31,0.06)", border: "1px solid rgba(193,18,31,0.28)", borderLeft: "2px solid var(--margin-rule)", borderRadius: "var(--radius)", color: "var(--margin-rule)" }}
            >
              {decodeURIComponent(pageError)}
            </div>
          )}
          <form action={login} className="space-y-5">
            <div>
              <label htmlFor="email" className="field-label">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="field-input"
                placeholder="you@university.edu"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <Link href="/auth/login?view=forgot" className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="field-input"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full teal-glow font-semibold text-sm focus:outline-none" style={{ padding: "11px 0" }}
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium" style={{ color: "var(--text-primary)" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
