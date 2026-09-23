import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Record a page view for the owner-only analytics page. */
export async function POST(request: Request) {
  let path = "";
  try {
    const body = await request.json();
    path = String(body?.path ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Only same-origin app routes, and never a query string: those can carry
  // referral codes and other identifiers that have no place in analytics.
  if (!path.startsWith("/") || path.startsWith("//") || path.length > 120) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }
  path = path.split("?")[0].split("#")[0];

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from("page_visits").insert({
    user_id: user?.id ?? null,
    path,
  });

  return NextResponse.json({ ok: true });
}
