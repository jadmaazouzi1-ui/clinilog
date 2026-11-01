import "server-only";
import { SITE_URL } from "./site";
import { signUnsub, verifyUnsub, type UnsubPurpose } from "./unsubscribeToken";

/** Signed one-click unsubscribe links. See unsubscribeToken.ts. */
function secret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || null;
}

export function unsubscribeToken(userId: string, purpose: UnsubPurpose = "digest"): string | null {
  const s = secret();
  return s ? signUnsub(s, purpose, userId) : null;
}

export function verifyUnsubscribeToken(userId: string, token: string, purpose: UnsubPurpose = "digest"): boolean {
  return verifyUnsub(secret(), purpose, userId, token);
}

export function unsubscribeUrl(userId: string, purpose: UnsubPurpose = "digest"): string | null {
  const t = unsubscribeToken(userId, purpose);
  if (!t) return null;
  const k = purpose === "digest" ? "" : `&k=${purpose}`;
  return `${SITE_URL}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(t)}${k}`;
}
