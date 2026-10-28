import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";
import { forbiddenOrigin, isSameOrigin, secondsUntilUtcMidnight, serverError, tooManyRequests } from "@/lib/http";
import { sanitizeText } from "@/lib/sanitize";

const Body = z.object({
  kind: z.enum(["problem", "idea"]),
  message: z.string().min(1).max(1000),
  page: z.string().max(200).optional(),
});

/** Help Center: report a problem or suggest a feature. */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbiddenOrigin();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Write between 1 and 1,000 characters." }, { status: 400 });
  }

  const message = sanitizeText(body.message, 1000);
  if (!message) return NextResponse.json({ error: "Write between 1 and 1,000 characters." }, { status: 400 });
  // Only an app path, never a query string that could carry identifiers.
  const page = body.page && body.page.startsWith("/") ? sanitizeText(body.page.split("?")[0], 200) : null;

  const limit = await checkUserRateLimit(supabase, "feedback");
  if (!limit.allowed) {
    return tooManyRequests("You can send 3 reports a day. Thank you for the ones you sent.", secondsUntilUtcMidnight());
  }

  const { error } = await supabase.from("feedback").insert({ user_id: user.id, kind: body.kind, message, page });
  if (error) return serverError("api/feedback", error.message);
  return NextResponse.json({ ok: true });
}
