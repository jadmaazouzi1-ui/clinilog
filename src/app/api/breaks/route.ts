import { NextResponse } from "next/server";
import { z } from "zod";
import { serverError } from "@/lib/http";
import { settingsRequest } from "@/lib/settingsGuard";

const ISO = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const Add = z
  .object({ start_date: ISO, end_date: ISO })
  .strict()
  .refine((b) => !Number.isNaN(Date.parse(b.start_date)) && !Number.isNaN(Date.parse(b.end_date)), "invalid date")
  .refine((b) => b.end_date >= b.start_date, "end before start")
  .refine((b) => b.start_date >= "2015-01-01" && b.end_date <= "2100-01-01", "out of range")
  .refine((b) => (Date.parse(b.end_date) - Date.parse(b.start_date)) / 86_400_000 <= 400, "too long");

const MAX_BREAKS = 20;

/** Save a break. No reason is asked for or stored. */
export async function POST(request: Request) {
  const g = await settingsRequest(request);
  if (!g.ok) return g.response;
  const { supabase, user } = g;

  let body: z.infer<typeof Add>;
  try {
    body = Add.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Use a start and end date, end on or after start, up to about a year long." }, { status: 400 });
  }

  const { count } = await supabase.from("user_breaks").select("id", { count: "exact", head: true }).eq("user_id", user.id);
  if ((count ?? 0) >= MAX_BREAKS) {
    return NextResponse.json({ error: `You can save up to ${MAX_BREAKS} breaks. Remove one to add another.` }, { status: 400 });
  }
  const { data, error } = await supabase.from("user_breaks").insert({ user_id: user.id, ...body }).select("id, start_date, end_date").single();
  if (error) return serverError("api/breaks POST", error.message);
  return NextResponse.json({ break: data });
}

export async function DELETE(request: Request) {
  const g = await settingsRequest(request);
  if (!g.ok) return g.response;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  const { error } = await g.supabase.from("user_breaks").delete().eq("id", id).eq("user_id", g.user.id);
  if (error) return serverError("api/breaks DELETE", error.message);
  return NextResponse.json({ ok: true });
}
