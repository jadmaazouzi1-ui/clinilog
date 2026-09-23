"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2500);
  }

  return (
    <div className="min-h-screen dot-grid-bg flex items-center justify-center px-4" style={{ backgroundColor: "var(--bg-page)" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-xl" style={{ color: "var(--text-primary)", fontWeight: 900, letterSpacing: "-0.02em" }}>ClinicLog MD</span>
          </div>
        </div>

        {done ? (
          <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ backgroundColor: "rgba(22,36,29,0.1)", border: "1px solid var(--border-strong)" }}
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>Password updated</h2>
            <p className="text-sm" style={{ color: "rgba(22,36,29,0.6)" }}>
              Redirecting you to your dashboard…
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Set a new password</h1>
              <p className="text-sm mt-1" style={{ color: "rgba(22,36,29,0.6)" }}>
                Choose a strong password for your account
              </p>
            </div>

            <div className="glass-card tick-corners" style={{ padding: "var(--sp-4) var(--sp-3)" }}>
              {error && (
                <div
                  className="mb-5 text-sm"
                  style={{ padding: "10px var(--sp-2)", borderRadius: "var(--radius)", background: "rgba(193,18,31,0.06)", border: "1px solid rgba(193,18,31,0.28)", borderLeft: "2px solid var(--margin-rule)", color: "var(--margin-rule)" }}
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="password" className="field-label">
                    New password
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field-input"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirm" className="field-label">
                    Confirm new password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="field-input"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full teal-glow font-semibold text-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed" style={{ padding: "11px 0" }}
                >
                  {loading ? "Updating…" : "Update Password"}
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
