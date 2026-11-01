import { NextResponse } from "next/server";
import { z } from "zod";
import { serverError } from "@/lib/http";
import { settingsRequest } from "@/lib/settingsGuard";
import { FINDING_KEY } from "@/lib/checks";

const Body = z
  .object({
    key: z.string().regex(FINDING_KEY),
    // 7 days is only for the logging-gap banner; findings use 30 or permanent.
    mode: z.enum(["7d", "30d", "permanent"]),
  })
  .strict()
  .refine((b) => b.mode !== "7d" || b.key === "banner:gap", "7d is only for the banner");

export async function POST(request: Request) {
  const g = await settingsRequest(request);
  if (!g.ok) return g.response;

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const days = body.mode === "7d" ? 7 : body.mode === "30d" ? 30 : null;
  const { error } = await g.supabase.from("finding_dismissals").upsert(
    {
      user_id: g.user.id,
      finding_key: body.key,
      permanent: days === null,
      dismissed_until: days === null ? null : new Date(Date.now() + days * 86_400_000).toISOString(),
    },
    { onConflict: "user_id,finding_key" }
  );
  if (error) return serverError("api/findings/dismiss", error.message);
  return NextResponse.json({ ok: true });
}
