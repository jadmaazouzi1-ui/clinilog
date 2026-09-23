import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Persist the viewer's theme preference so it follows them across devices. */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Signed-out visitors keep the preference in localStorage only.
  if (!user) return NextResponse.json({ ok: true, persisted: false });

  let theme = "light";
  try {
    const body = await request.json();
    if (body?.theme === "dark" || body?.theme === "light") theme = body.theme;
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    theme,
    updated_at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, persisted: true });
}
