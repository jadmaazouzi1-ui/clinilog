"use client";

import { openHelp } from "./store";

/** Opens the Help Center. Rendered in the header, sidebar, Tools and Profile. */
export default function HelpButton({ className = "", tourId, block = false }: { className?: string; tourId?: string; block?: boolean }) {
  return (
    <button
      type="button"
      onClick={openHelp}
      className={`help-trigger ${className}`}
      style={block ? { width: "100%", justifyContent: "flex-start", minHeight: 44, fontSize: 15 } : undefined}
      aria-haspopup="dialog"
      data-tour={tourId}
    >
      <span className="help-trigger-mark" aria-hidden="true">?</span>
      Help
    </button>
  );
}
