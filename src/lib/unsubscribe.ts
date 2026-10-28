import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_URL } from "./site";

/**
 * Signed one-click unsubscribe links. The token is an HMAC of the user id with
 * a server secret, so a link cannot be forged for another account by guessing
 * or changing the id.
 */
function secret(): string | null {
  return process.env.UNSUBSCRIBE_SECRET || process.env.CRON_SECRET || null;
}

export function unsubscribeToken(userId: string): string | null {
  const s = secret();
  if (!s) return null;
  return createHmac("sha256", s).update(`unsub:${userId}`).digest("base64url");
}

export function verifyUnsubscribeToken(userId: string, token: string): boolean {
  const expected = unsubscribeToken(userId);
  if (!expected || !token) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function unsubscribeUrl(userId: string): string | null {
  const t = unsubscribeToken(userId);
  return t ? `${SITE_URL}/api/unsubscribe?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(t)}` : null;
}
