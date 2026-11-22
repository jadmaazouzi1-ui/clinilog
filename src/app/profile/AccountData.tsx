"use client";

import { useState } from "react";

/** Export My Data and Delete My Account. */
export default function AccountData() {
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function deleteAccount() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not delete the account. Please try again.");
        return;
      }
      window.location.assign("/");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-2)" }}>
        Download what you have saved in ClinicLog MD as a JSON file: profile, experiences, schools,
        interviews, letters, trackers, reminder settings, breaks and referrals.
      </p>
      <a
        href="/api/account/export"
        className="btn btn-secondary"
      >
        Export my data
      </a>

      <hr className="rule" />

      <h3 className="text-base" style={{ color: "var(--danger)", marginBottom: "var(--sp-1)" }}>Delete account</h3>
      <p className="text-sm" style={{ color: "var(--text-muted)", marginBottom: "var(--sp-2)" }}>
        Permanently deletes your account, every entry and tracker, your feedback and your page view
        history, right away. This cannot be undone, so export your data first if you want a copy.
        Database backups can hold a copy for a limited time after that. A first-generation story you
        submitted is not linked to your account, so ask through the Help Center to remove it.
      </p>
      <label htmlFor="delete-confirm" className="label">Type DELETE to confirm</label>
      <div className="flex items-end gap-2 flex-wrap">
        <input
          id="delete-confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="off"
          className="field"
          style={{ maxWidth: 220 }}
        />
        <button
          type="button"
          onClick={deleteAccount}
          disabled={confirm !== "DELETE" || busy}
          className="text-sm font-semibold"
          style={{
            padding: "8px var(--sp-2)",
            color: confirm === "DELETE" ? "var(--surface)" : "var(--text-muted)",
            background: confirm === "DELETE" ? "var(--danger)" : "var(--surface)",
            border: "1px solid var(--danger)",
            borderRadius: "var(--radius)",
            cursor: confirm === "DELETE" && !busy ? "pointer" : "not-allowed",
          }}
        >
          {busy ? "Deleting" : "Delete my account"}
        </button>
      </div>
      {error && (
        <p className="text-sm" style={{ color: "var(--danger)", marginTop: "var(--sp-1)" }}>{error}</p>
      )}
    </>
  );
}
