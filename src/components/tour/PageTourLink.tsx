"use client";

import { usePathname } from "next/navigation";
import { modulesForPage } from "@/lib/tour/modules";
import { startTour } from "./store";

/** Small "Page tour" link in the page header; replays only this page's module. */
export default function PageTourLink() {
  const pathname = usePathname();
  const mod = modulesForPage(pathname)[0];
  if (!mod) return null;
  return (
    <button
      type="button"
      onClick={() => startTour(mod.id, 0)}
      className="text-xs font-semibold"
      style={{ color: "var(--text-secondary)", textDecoration: "underline", background: "transparent", border: 0, padding: "6px 2px", cursor: "pointer" }}
    >
      Page tour
    </button>
  );
}
