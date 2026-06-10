import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  // Already-authed users skip the signup form.
  const supabaseInit = await createClient();
  const { data: { user: existingUser } } = await supabaseInit.auth.getUser();
  if (existingUser) redirect("/dashboard");

  async function signup(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = await createClient();

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
    <div className="min-h-screen dot-grid-bg flex items-center justify-center px-4" style={{ backgroundColor: "#1A1A2E" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#E8A020" }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#1A1A2E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2,12 7,12 8,9 10,12 12,3 13,21 14,12 16,9 18,12 22,12" />
              </svg>
            </div>
            <span className="font-semibold text-xl" style={{ color: "#FFFFFF" }}>CliniLog</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>Create your account</h1>
          <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            Start logging your clinical experiences today
          </p>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <form action={signup} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1.5"
                style={{ color: "rgba(255,255,255,0.85)" }}
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
                style={{ color: "rgba(255,255,255,0.85)" }}
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
                style={{ color: "rgba(255,255,255,0.85)" }}
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
              style={{ backgroundColor: "#E8A020", color: "#FFFFFF" }}
            >
              Create Account
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "rgba(255,255,255,0.5)" }}>
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-medium"
            style={{ color: "#E8A020" }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
