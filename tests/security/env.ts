import { readFileSync, existsSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Page } from "@playwright/test";

// Load .env.local (public Supabase URL and anon key) and .env.test.local
// (throwaway test accounts) without adding a dotenv dependency. Both files
// are gitignored by the ".env*" rule.
function load(file: string) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
load(".env.local");
load(".env.test.local");

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const USER_A = { email: process.env.TEST_USER_A_EMAIL ?? "", password: process.env.TEST_USER_A_PASSWORD ?? "" };
export const USER_B = { email: process.env.TEST_USER_B_EMAIL ?? "", password: process.env.TEST_USER_B_PASSWORD ?? "" };
export const HAVE_USERS = !!(USER_A.email && USER_A.password && USER_B.email && USER_B.password);
export const NO_USERS_MSG = "Set TEST_USER_A_EMAIL/PASSWORD and TEST_USER_B_EMAIL/PASSWORD in .env.test.local";

// Guard: the suite must never sign in as the owner's real account.
const OWNER = "jadmaazouzi1@gmail.com";
if ([USER_A.email, USER_B.email].some((e) => e.toLowerCase() === OWNER)) {
  throw new Error("Test accounts must be throwaway accounts, not the owner's real account.");
}

/** A Supabase client signed in as a test user, talking to the REST API directly
 *  with only the public anon key: exactly what an attacker has. */
export async function clientAs(u: { email: string; password: string }): Promise<{ db: SupabaseClient; id: string }> {
  const db = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  const { data, error } = await db.auth.signInWithPassword(u);
  if (error || !data.user) throw new Error(`sign-in failed for test user: ${error?.message}`);
  return { db, id: data.user.id };
}

export function anonClient(): SupabaseClient {
  return createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
}

/** Sign in through the real login form so the page context holds the session cookie. */
export async function uiLogin(page: Page, u: { email: string; password: string }) {
  await page.goto("/auth/login");
  await page.locator("form input[name='password']").locator("xpath=ancestor::form").locator("input[name='email']").fill(u.email);
  await page.locator("input[name='password']").fill(u.password);
  await page.locator("input[name='password']").press("Enter");
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30_000 });
}
