import type { SupabaseClient } from "@supabase/supabase-js";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

// Per-user daily quotas. Counters live in Supabase (user_rate_limits) and are
// incremented atomically by a SECURITY DEFINER function, so clients cannot
// reset or spoof them. Window is seconds.
export const USER_LIMITS = {
  advisor:    { max: 20, window: 86400 },
  reframe:    { max: 10, window: 86400 },
  archetype:  { max: 3,  window: 86400 },
  csv_import: { max: 3,  window: 86400 },
  pdf_export: { max: 10, window: 86400 },
  outline:    { max: 10, window: 86400 },
  mock_interview: { max: 10, window: 86400 },
  data_export: { max: 5, window: 86400 },
  feedback:   { max: 3,  window: 86400 },
} as const;

export type UserLimitAction = keyof typeof USER_LIMITS;

/**
 * Actions that cost real money per call. If the limiter itself fails these
 * deny rather than allow: an outage turning into unmetered paid API calls is
 * a worse failure than the feature being briefly unavailable.
 */
const FAIL_CLOSED: ReadonlySet<string> = new Set([
  "advisor",
  "archetype",
  "reframe",
  "outline",
  "mock_interview",
]);

export async function checkUserRateLimit(
  supabase: SupabaseClient,
  action: UserLimitAction
): Promise<RateLimitResult> {
  const { max, window } = USER_LIMITS[action];
  const { data, error } = await supabase.rpc("check_user_rate_limit", {
    p_action: action,
    p_max: max,
    p_window_secs: window,
  });
  if (error || !data) {
    console.error(`[rateLimit] rpc failed for ${action}:`, error?.message);
    // Cheap actions fail open so an outage does not take them down; paid
    // ones fail closed so an outage cannot be used to bypass the quota.
    if (FAIL_CLOSED.has(action)) return { allowed: false, remaining: 0 };
    return { allowed: true, remaining: max };
  }
  return { allowed: !!data.allowed, remaining: Number(data.remaining ?? 0) };
}

// Pre-auth limits keyed by IP or email (signup / login / forgot-password /
// anonymous story submission).
export type AuthLimitAction =
  | "signup"
  | "login"
  | "forgot_password"
  | "forgot_password_ip"
  | "story_submit";

/**
 * The database function is callable with the public anon key, because these
 * checks run before anyone is signed in. Without a server-held secret, anyone
 * could call it directly with someone else's key ("email:victim@x.com") and
 * exhaust that person's password-reset quota, or an IP's login quota. The
 * secret proves the call came from this server.
 *
 * If the secret is missing or the function rejects it, the limiter fails open
 * so sign-in keeps working, and logs loudly so the misconfiguration is seen.
 */
export async function checkAuthRateLimit(
  supabase: SupabaseClient,
  key: string,
  action: AuthLimitAction,
  max: number,
  windowSecs: number
): Promise<RateLimitResult> {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret) {
    console.error("[rateLimit] RATE_LIMIT_SECRET is not set; auth rate limits are disabled");
    return { allowed: true, remaining: max };
  }
  const { data, error } = await supabase.rpc("check_auth_rate_limit", {
    p_key: key,
    p_action: action,
    p_max: max,
    p_window_secs: windowSecs,
    p_secret: secret,
  });
  if (error || !data) {
    console.error(`[rateLimit] auth rpc failed for ${action}:`, error?.message);
    return { allowed: true, remaining: max };
  }
  return { allowed: !!data.allowed, remaining: Number(data.remaining ?? 0) };
}

// Client IP for per-IP limits. Vercel sets x-vercel-forwarded-for and x-real-ip
// itself; a client can prepend arbitrary values to x-forwarded-for, so that
// header is only a last resort and only its last hop is trusted.
export function clientIpFrom(headersList: Headers): string {
  const vercel = headersList.get("x-vercel-forwarded-for");
  if (vercel) return vercel.split(",")[0].trim().slice(0, 64);
  const real = headersList.get("x-real-ip");
  if (real) return real.trim().slice(0, 64);
  const fwd = headersList.get("x-forwarded-for");
  if (fwd) {
    const hops = fwd.split(",").map((h) => h.trim()).filter(Boolean);
    return (hops[hops.length - 1] ?? "unknown").slice(0, 64);
  }
  return "unknown";
}
