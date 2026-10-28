// Sign-up is limited to Wake Forest addresses. The database enforces the same
// rule with a trigger on auth.users, so calling the Supabase API directly
// with the public anon key cannot get around it.
export const ALLOWED_EMAIL_DOMAIN = "wfu.edu";

export function isAllowedSignupEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}
