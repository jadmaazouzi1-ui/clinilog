"use client";

import { useState } from "react";

export default function ReferralPanel({ code, count }: { code: string | null; count: number }) {
  const [copied, setCopied] = useState(false);
  if (!code) return null;

  const link = `https://www.cliniclogmd.com/auth/signup?ref=${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-2" style={{ gap: "var(--sp-2)", marginBottom: "var(--sp-2)" }}>
        <div className="data-field">
          <span className="data-field-label">Your code</span>
          <span className="data-field-value mono">{code}</span>
        </div>
        <div className="data-field">
          <span className="data-field-label">Signups referred</span>
          <span className="data-field-value mono">{String(count).padStart(2, "0")}</span>
        </div>
      </div>

      <div className="flex items-end gap-2 flex-wrap" style={{ marginBottom: "var(--sp-2)" }}>
        <div className="flex-1" style={{ minWidth: 220 }}>
          <label htmlFor="referral-link" className="field-label">SHARE LINK</label>
          <input id="referral-link" readOnly value={link} className="field-input mono" style={{ fontSize: 12 }} />
        </div>
        <button type="button" onClick={copy} className="btn-ghost text-xs font-semibold" style={{ padding: "7px var(--sp-2)" }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </>
  );
}
