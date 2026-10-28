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
      <p className="dept-header">Your Data</p>
      <p className="text-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-2)" }}>
        Download everything ClinicLog MD stores about you as a JSON file: profile, experiences,
        applications, interviews, letters, trackers and referrals.
      </p>
      <a
        href="/api/account/export"
        className="btn-ghost inline-flex text-sm font-semibold"
        style={{ padding: "8px var(--sp-2)", textDecoration: "none" }}
      >
        Export my data
      </a>

      <hr className="tear-line" />

      <p className="dept-header" style={{ color: "var(--error)" }}>Delete Account</p>
      <p className="text-sm" style={{ color: "var(--text-secondary)", marginBottom: "var(--sp-2)" }}>
        Permanently deletes your account and every record linked to it. This cannot be undone,
        so export your data first if you want a copy.
      </p>
      <label htmlFor="delete-confirm" className="field-label">TYPE DELETE TO CONFIRM</label>
      <div className="flex items-end gap-2 flex-wrap">
        <input
          id="delete-confirm"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="off"
          className="field-input"
          style={{ maxWidth: 220 }}
        />
        <button
          type="button"
          onClick={deleteAccount}
          disabled={confirm !== "DELETE" || busy}
          className="text-sm font-semibold"
          style={{
            padding: "8px var(--sp-2)",
            color: confirm === "DELETE" ? "#FFFFFF" : "var(--text-tertiary)",
            background: confirm === "DELETE" ? "var(--error)" : "var(--bg-card)",
            border: "1px solid var(--error)",
            borderRadius: "var(--radius)",
            cursor: confirm === "DELETE" && !busy ? "pointer" : "not-allowed",
          }}
        >
          {busy ? "Deleting" : "Delete my account"}
        </button>
      </div>
      {error && (
        <p className="text-sm" style={{ color: "var(--error)", marginTop: "var(--sp-1)" }}>{error}</p>
      )}
    </>
  );
}
