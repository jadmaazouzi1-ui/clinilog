import { redirect } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkAuthRateLimit, clientIpFrom } from "@/lib/rateLimit";

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  // Already-authed users skip the signup form.
  const supabaseInit = await createClient();
  const { data: { user: existingUser } } = await supabaseInit.auth.getUser();
  if (existingUser) redirect("/dashboard");

  const params = await searchParams;
  const pageError = params?.error;

  async function signup(formData: FormData) {
    "use server";

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

    redirect("/auth/verify-email");
  }

  return (
    <div className="min-h-screen dot-grid-bg flex items-center justify-center px-4" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center mb-4">
            <span className="text-2xl" style={{ color: "#000000", fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.02em" }}>ClinicLog</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#000000" }}>Create your account</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(0,0,0,0.6)" }}>
            Start logging your clinical experiences today
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-lg p-8">
          {pageError && (
            <div
              className="mb-5 text-sm px-4 py-3"
              style={{ background: "#FFFFFF", border: "2px solid #000000", color: "#000000" }}
            >
              {decodeURIComponent(pageError)}
            </div>
          )}
          <form action={signup} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(0,0,0,0.85)" }}
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="input-dark w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                placeholder="Jane Smith"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(0,0,0,0.85)" }}
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="input-dark w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                placeholder="you@university.edu"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(0,0,0,0.85)" }}
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
                className="input-dark w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                placeholder="At least 8 characters"
              />
            </div>

            <button
              type="submit"
              className="w-full teal-glow py-2.5 rounded-lg font-semibold text-sm transition-colors focus:outline-none"
              style={{ backgroundColor: "#000000", color: "#FFFFFF" }}
            >
              Create Account
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "rgba(0,0,0,0.5)" }}>
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium"
            style={{ color: "#000000" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
