import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  async function login(formData: FormData) {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    }

    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen dot-grid-bg flex items-center justify-center px-4" style={{ backgroundColor: "#0A1628" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#00D4FF" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#0A1628" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 12 6 9 9 13 12 7 15 11 18 8 21 12" />
              </svg>
            </div>
            <span className="font-semibold text-xl" style={{ color: "#F8FAFC" }}>CliniLog</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#F8FAFC" }}>Welcome back</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(248,250,252,0.6)" }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <form action={login} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(248,250,252,0.85)" }}
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
                style={{ color: "rgba(248,250,252,0.85)" }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="input-dark w-full px-3.5 py-2.5 rounded-lg text-sm transition"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full teal-glow py-2.5 rounded-lg font-semibold text-sm transition-colors focus:outline-none"
              style={{ backgroundColor: "#00D4FF", color: "#0A1628" }}
            >
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "rgba(248,250,252,0.5)" }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="font-medium"
            style={{ color: "#00D4FF" }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
