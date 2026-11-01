import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Single-purpose unsubscribe tokens: an HMAC of the purpose and the user id.
 * A digest link cannot unsubscribe from reminders, and no link works for any
 * other user or any other action. Kept free of server-only imports so tests
 * can load it.
 */
export type UnsubPurpose = "digest" | "reminders";

function message(purpose: UnsubPurpose, userId: string): string {
  // Digest links already in inboxes were signed as "unsub:<id>"; keep them valid.
  return purpose === "digest" ? `unsub:${userId}` : `unsub:${purpose}:${userId}`;
}

export function signUnsub(secret: string, purpose: UnsubPurpose, userId: string): string {
  return createHmac("sha256", secret).update(message(purpose, userId)).digest("base64url");
}

export function verifyUnsub(secret: string | null, purpose: UnsubPurpose, userId: string, token: string): boolean {
  if (!secret || !token) return false;
  const a = Buffer.from(signUnsub(secret, purpose, userId));
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
