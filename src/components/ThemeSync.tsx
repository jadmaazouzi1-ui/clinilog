"use client";

import { useLayoutEffect } from "react";

/** Re-applies the theme after hydration. The inline script in the layout sets
 *  data-theme before first paint, but if React has to rebuild <html> (for
 *  example when the host injects a comment into <head>, which Netlify does),
 *  the attribute is lost. This puts it back before the browser paints. */
export default function ThemeSync() {
  useLayoutEffect(() => {
    const el = document.documentElement;
    if (el.getAttribute("data-theme")) return;
    let t: string | null = null;
    try {
      t = localStorage.getItem("cliniclog-theme");
    } catch {}
    if (t !== "dark" && t !== "light") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    el.setAttribute("data-theme", t);
  }, []);
  return null;
}
