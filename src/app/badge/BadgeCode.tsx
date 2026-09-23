"use client";

import { useState } from "react";

/** Copy-to-clipboard for the embed snippets. */
export default function BadgeCode({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; the code is visible and selectable anyway.
      setCopied(false);
    }
  }

  return (
    <div style={{ marginBottom: "var(--sp-4)" }}>
      <div className="flex items-center justify-between gap-3" style={{ marginBottom: 6 }}>
        <span className="exp-id">{label}</span>
        <button onClick={copy} className="btn-ghost text-xs font-semibold" style={{ padding: "5px var(--sp-1)" }}>
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          padding: "var(--sp-2)",
          background: "var(--bg-soft)",
          border: "1px solid var(--border-strong)",
          borderRadius: "var(--radius)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          lineHeight: 1.6,
          overflowX: "auto",
          color: "var(--text-primary)",
          whiteSpace: "pre",
        }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}
