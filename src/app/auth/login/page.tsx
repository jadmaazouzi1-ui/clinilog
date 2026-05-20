import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; view?: string; sent?: string }>;
}) {
  const params = await searchParams;
  const pageError = params?.error;
  const view = params?.view;
  const sent = params?.sent;

  async function login(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    }
    redirect("/dashboard");
  }

  async function forgotPassword(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const supabase = await createClient();
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
    <div className="inline-flex items-center gap-2 mb-4">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00D4FF" }}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 12 6 9 9 13 12 7 15 11 18 8 21 12" />
        </svg>
      </div>
      <span className="font-semibold text-xl" style={{ color: "#F8FAFC" }}>CliniLog</span>
    </div>
  );

  if (view === "forgot") {
    return (
      <div className="min-h-screen dot-grid-bg flex items-center justify-center px-4" style={{ backgroundColor: "#0A1628" }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <LogoMark />
          </div>

          {sent === "1" ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ backgroundColor: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)" }}
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="text-lg font-bold mb-2" style={{ color: "#F8FAFC" }}>
                Check your email
              </h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(248,250,252,0.6)" }}>
                We sent a password reset link to your email address. It may take a minute to arrive.
              </p>
              <Link href="/auth/login" className="text-sm font-medium" style={{ color: "#00D4FF" }}>
                ← Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold" style={{ color: "#F8FAFC" }}>Reset your password</h1>
                <p className="text-sm mt-1" style={{ color: "rgba(248,250,252,0.6)" }}>
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <div className="glass-card rounded-2xl p-8">
                {pageError && (
                  <div
                    className="mb-5 text-sm rounded-lg px-4 py-3"
                    style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", color: "#FF4757" }}
                  >
                    {decodeURIComponent(pageError)}
                  </div>
                )}
                <form action={forgotPassword} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
                      Email address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className="input-dark w-full px-3.5 py-2.5 rounded-lg text-sm"
                      placeholder="you@university.edu"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full teal-glow py-2.5 rounded-lg font-semibold text-sm focus:outline-none"
                    style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
                  >
                    Send Reset Email
                  </button>
                </form>
              </div>

              <p className="text-center text-sm mt-6">
                <Link href="/auth/login" className="font-medium" style={{ color: "#00D4FF" }}>
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
    <div className="min-h-screen dot-grid-bg flex items-center justify-center px-4" style={{ backgroundColor: "#0A1628" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <LogoMark />
          <h1 className="text-2xl font-bold" style={{ color: "#F8FAFC" }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(248,250,252,0.6)" }}>
            Sign in to your account to continue
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {pageError && (
            <div
              className="mb-5 text-sm rounded-lg px-4 py-3"
              style={{ background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", color: "#FF4757" }}
            >
              {decodeURIComponent(pageError)}
            </div>
          )}
          <form action={login} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: "rgba(248,250,252,0.85)" }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input-dark w-full px-3.5 py-2.5 rounded-lg text-sm"
                placeholder="you@university.edu"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: "rgba(248,250,252,0.85)" }}>
                  Password
                </label>
                <Link href="/auth/login?view=forgot" className="text-xs font-medium" style={{ color: "#00D4FF" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input-dark w-full px-3.5 py-2.5 rounded-lg text-sm"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full teal-glow py-2.5 rounded-lg font-semibold text-sm focus:outline-none"
              style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "rgba(248,250,252,0.5)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium" style={{ color: "#00D4FF" }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
