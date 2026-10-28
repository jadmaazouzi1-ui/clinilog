/**
 * Redirect targets taken from a request (`next`, `redirect`, `returnTo`) must
 * be same-origin relative paths. Anything else falls back to `fallback`.
 *
 * Rejected:
 *   "//evil.com", "/\\evil.com"  protocol-relative, browsers treat as external
 *   "https://evil.com"           absolute URL
 *   ".evil.com", "@evil.com"     would be glued onto the origin by callers that
 *                                concatenate, producing an attacker host
 *   anything containing control characters or a backslash
 *
 * No imports, so the security test suite can load it directly.
 */
export function safeNextPath(input: string | null | undefined, fallback = "/dashboard"): string {
  if (typeof input !== "string" || input.length === 0 || input.length > 512) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback;
  if (input.includes("\\")) return fallback;
  if (/[\x00-\x1F\x7F]/.test(input)) return fallback;
  try {
    // Resolve against a sentinel origin: if the result lands anywhere else, the
    // path was not really relative.
    const u = new URL(input, "https://sentinel.invalid");
    if (u.origin !== "https://sentinel.invalid") return fallback;
    return u.pathname + u.search + u.hash;
  } catch {
    return fallback;
  }
}
