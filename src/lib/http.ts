import { NextResponse } from "next/server";
import { SITE_URL } from "./site";

/** 429 with a Retry-After header, as clients and proxies expect. */
export function tooManyRequests(message: string, retryAfterSecs = 3600) {
  return NextResponse.json(
    { error: message },
    { status: 429, headers: { "Retry-After": String(Math.max(1, Math.round(retryAfterSecs))) } }
  );
}

/** Seconds until the start of the next UTC day: the reset point of a daily quota. */
export function secondsUntilUtcMidnight(now = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.ceil((next - now.getTime()) / 1000);
}

/**
 * CSRF defence for JSON POST routes. Server Actions already compare Origin to
 * Host; route handlers do not, so they call this. A missing Origin is allowed
 * only for same-site navigations that browsers send without one.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return request.headers.get("sec-fetch-site") !== "cross-site";
  const allowed = new Set([SITE_URL, "https://cliniclogmd.com", "https://www.cliniclogmd.com"]);
  if (process.env.NODE_ENV !== "production") {
    allowed.add("http://localhost:3000");
    allowed.add("http://127.0.0.1:3000");
  }
  try {
    const host = request.headers.get("host");
    if (host && new URL(origin).host === host) return true;
  } catch {
    return false;
  }
  return allowed.has(origin);
}

export function forbiddenOrigin() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/** Generic failure for users; the detail goes to the server log only. */
export function serverError(tag: string, err: unknown, status = 500) {
  console.error(`[${tag}]`, err instanceof Error ? err.message : err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status });
}
