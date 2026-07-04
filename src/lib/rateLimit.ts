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
} as const;

export type UserLimitAction = keyof typeof USER_LIMITS;

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
    // Fail open: a rate-limiter outage should not take the feature down.
    console.error(`[rateLimit] rpc failed for ${action}:`, error?.message);
    return { allowed: true, remaining: max };
  }
  return { allowed: !!data.allowed, remaining: Number(data.remaining ?? 0) };
}

// Pre-auth limits keyed by IP or email (signup / login / forgot-password).
export async function checkAuthRateLimit(
  supabase: SupabaseClient,
  key: string,
  action: "signup" | "login" | "forgot_password",
  max: number,
  windowSecs: number
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc("check_auth_rate_limit", {
    p_key: key,
    p_action: action,
    p_max: max,
    p_window_secs: windowSecs,
  });
  if (error || !data) {
    console.error(`[rateLimit] auth rpc failed for ${action}:`, error?.message);
    return { allowed: true, remaining: max };
  }
  return { allowed: !!data.allowed, remaining: Number(data.remaining ?? 0) };
}

// Best-effort client IP from proxy headers (Netlify/Vercel set x-forwarded-for).
export function clientIpFrom(headersList: Headers): string {
  const fwd = headersList.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headersList.get("x-real-ip") ?? "unknown";
}
