"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthFrame from "@/components/AuthFrame";
import { Notice } from "@/components/ui";

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

    if (password.length < 10) {
      setError("Password must be at least 10 characters.");
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
      // Password-policy errors are actionable; anything else is not shown raw.
      setError(/password/i.test(updateError.message)
        ? "That password is too weak or has appeared in a data breach. Choose a different one."
        : "This reset link has expired or was already used. Request a new one.");
      return;
    }

    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2500);
  }

  if (done) {
    return (
      <AuthFrame title="Password updated" intro="Taking you to your Overview…">
        <Link href="/dashboard" className="link text-sm">Go now</Link>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame
      title="Choose a new password"
      intro="At least 10 characters. A short sentence you will remember works well."
      footer={<Link href="/auth/login" className="link">Back to sign in</Link>}
    >
      {error && (
        <div style={{ marginBottom: "var(--sp-3)" }}>
          <Notice tone="danger">{error}</Notice>
        </div>
      )}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "var(--sp-3)" }} noValidate>
        <div>
          <label htmlFor="password" className="label">New password</label>
          <input
            id="password"
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            aria-invalid={!!error && password.length < 10}
          />
        </div>
        <div>
          <label htmlFor="confirm" className="label">Type it again</label>
          <input
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="field"
            aria-invalid={!!error && password !== confirm}
          />
        </div>
        <button type="submit" disabled={loading} aria-busy={loading} className="btn btn-primary btn-block">
          {loading ? "Saving…" : "Save new password"}
        </button>
      </form>
    </AuthFrame>
  );
}
