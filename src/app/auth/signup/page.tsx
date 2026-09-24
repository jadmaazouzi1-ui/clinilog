import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkAuthRateLimit, clientIpFrom } from "@/lib/rateLimit";
import { REFERRAL_COOKIE } from "@/lib/referral";

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
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

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
      redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`);
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
                placeholder="you@university.edu"
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
                minLength={8}
                autoComplete="new-password"
                className="field-input"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              className="w-full teal-glow font-semibold text-sm focus:outline-none" style={{ padding: "11px 0" }}
            >
              Create Account
            </button>
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
