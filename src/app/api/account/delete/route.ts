import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { forbiddenOrigin, isSameOrigin, serverError } from "@/lib/http";

const Body = z.object({ confirm: z.literal("DELETE") });

/**
 * Delete My Account. Calls delete_my_account(), which deletes the caller's
 * auth.users row; every table with user data references auth.users with
 * ON DELETE CASCADE, so all of the user's rows go with it. Page visits are
 * kept but anonymised (SET NULL), since they hold no personal content.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Type DELETE to confirm.' }, { status: 400 });
  }

  try {
    const { error } = await supabase.rpc("delete_my_account");
    if (error) throw new Error(error.message);
    await supabase.auth.signOut();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return serverError("api/account/delete", err);
  }
}
