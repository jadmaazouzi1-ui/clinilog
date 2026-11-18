import { redirect } from "next/navigation";
import AuthFrame from "@/components/AuthFrame";
import { Notice } from "@/components/ui";
import Link from "next/link";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { checkAuthRateLimit, clientIpFrom } from "@/lib/rateLimit";
import { SITE_URL } from "@/lib/site";

export const metadata = {
  description: "Sign in to ClinicLog MD.",
};

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
      console.error("[login]", error.message);
      redirect(`/auth/login?error=${encodeURIComponent("Incorrect email or password, or the email is not yet confirmed.")}`);
    }
    redirect("/dashboard");
  }

  async function forgotPassword(formData: FormData) {
    "use server";
    const email = ((formData.get("email") as string) || "").trim().toLowerCase().slice(0, 320);
    const supabase = await createClient();

    // Limited per IP as well as per email: the per-email limit alone let one
    // client walk through many addresses.
    const ip = clientIpFrom(await headers());
    const ipLimit = await checkAuthRateLimit(supabase, `ip:${ip}`, "forgot_password_ip", 3, 3600);
    const emailLimit = await checkAuthRateLimit(supabase, `email:${email}`, "forgot_password", 3, 3600);

    // The reset link points at the canonical origin, never at the request's
    // Host header, which the client controls and could aim at another domain.
    if (ipLimit.allowed && emailLimit.allowed && email) {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${SITE_URL}/auth/callback?next=/auth/reset-password`,
      });
    }

    // Identical response whether or not the account exists, and whether or not
    // a limit was hit, so the form cannot be used to discover registered emails.
    redirect("/auth/login?view=forgot&sent=1");
  }

  const errorNotice = pageError ? (
    <div style={{ marginBottom: "var(--sp-3)" }}>
      <Notice tone="danger">{decodeURIComponent(pageError)}</Notice>
    </div>
  ) : null;

  if (view === "forgot") {
    if (sent === "1") {
      return (
        <AuthFrame
          title="Check your email"
          intro="If an account uses that address, a reset link is on its way. It can take a minute or two to arrive."
          footer={<Link href="/auth/login" className="link">Back to sign in</Link>}
        >
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Nothing after five minutes? Check your spam folder, then try again from the sign-in page.
          </p>
        </AuthFrame>
      );
    }
    return (
      <AuthFrame
        title="Reset your password"
        intro="Enter the email you signed up with and we will send a link to choose a new password."
        footer={<Link href="/auth/login" className="link">Back to sign in</Link>}
      >
        {errorNotice}
        <form action={forgotPassword} style={{ display: "grid", gap: "var(--sp-3)" }}>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" name="email" type="email" required autoComplete="email" className="field" placeholder="you@wfu.edu" />
          </div>
          <button type="submit" className="btn btn-primary btn-block">Email me a reset link</button>
        </form>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title="Sign in"
      footer={<>New to ClinicLog MD? <Link href="/auth/signup" className="link">Create an account</Link></>}
    >
      {errorNotice}
      <form action={login} style={{ display: "grid", gap: "var(--sp-3)" }}>
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" placeholder="you@wfu.edu" />
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="password" className="label">Password</label>
            <Link href="/auth/login?view=forgot" className="link text-xs">Forgot your password?</Link>
          </div>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
        </div>
        <button type="submit" className="btn btn-primary btn-block">Sign in</button>
      </form>
    </AuthFrame>
  );
}
