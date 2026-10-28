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
 * Redeem a referral cookie once the referred user has a session.
 *
 * All the rules live in the claim_referral() database function rather than
 * here, because the referrals table used to accept direct inserts: any
 * signed-in account, however old, could credit any referrer by writing the
 * row itself with the public anon key. The function only credits an account
 * that is newly created, has a confirmed email, has never been credited
 * before, and is not the referrer.
 */
export async function claimPendingReferral(userId: string): Promise<void> {
  const jar = await cookies();
  const code = jar.get(REFERRAL_COOKIE)?.value;
  if (!code || !userId) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("claim_referral", { p_code: code.toUpperCase().slice(0, 12) });
  if (error) console.error("[referral] claim failed:", error.message);
}

export async function referralCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("referrals")
    .select("id", { count: "exact", head: true })
    .eq("referrer_id", userId);
  return count ?? 0;
}
