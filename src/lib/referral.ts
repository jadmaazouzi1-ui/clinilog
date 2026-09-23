import "server-only";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const REFERRAL_COOKIE = "cliniclog_ref";

/** Unambiguous alphabet: no O/0, I/1, so a code read aloud is unambiguous. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(len = 7): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/**
 * Return this user's referral code, generating one on first use.
 * The column has a unique index, so a collision surfaces as an insert error
 * and is retried rather than silently overwriting another user's code.
 */
export async function ensureReferralCode(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .single();

  if (data?.referral_code) return data.referral_code;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await supabase
      .from("profiles")
      .update({ referral_code: code, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (!error) return code;
  }
  return null;
}

/**
 * Redeem a referral cookie once the referred user actually exists.
 *
 * Deliberately run after sign-in rather than at sign-up: with email
 * confirmation the new account is not authenticated at submit time, so there
 * is no session under which the row could be inserted. The unique constraint
 * on referred_user_id makes a repeat call a no-op.
 */
export async function claimPendingReferral(userId: string): Promise<void> {
  const jar = await cookies();
  const code = jar.get(REFERRAL_COOKIE)?.value;
  if (!code) return;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("referrals")
    .select("id")
    .eq("referred_user_id", userId)
    .maybeSingle();
  if (existing) return;

  const { data: referrer } = await supabase
    .from("profiles")
    .select("id")
    .eq("referral_code", code.toUpperCase())
    .maybeSingle();

  // Self-referral is meaningless and would inflate a user's own count.
  if (!referrer || referrer.id === userId) return;

  await supabase.from("referrals").insert({
    referrer_id: referrer.id,
    referred_user_id: userId,
  });
}

export async function referralCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", userId);
  return count ?? 0;
}
