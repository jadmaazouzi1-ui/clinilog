import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanAiText, HUMAN_STYLE_RULES } from "@/lib/aiText";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";
import { buildAiProfile } from "@/lib/aiProfile";
import { UNTRUSTED_DATA_RULES, fence } from "@/lib/aiGuard";
import { forbiddenOrigin, isSameOrigin, secondsUntilUtcMidnight, serverError, tooManyRequests } from "@/lib/http";

// Bounded so one request cannot run up an unbounded token bill.
const Body = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "model"]),
        content: z.string().min(1).max(2000),
      })
    )
    .min(1)
    .max(30),
});

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return forbiddenOrigin();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI advisor is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { messages } = parsed;
  if (messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const limit = await checkUserRateLimit(supabase, "advisor");
  if (!limit.allowed) {
    return tooManyRequests("Daily AI limit reached. Come back tomorrow.", secondsUntilUtcMidnight());
  }

  // The student's context is built here from their own rows. It used to be
  // accepted from the browser and pasted into the system prompt, which let a
  // client rewrite the advisor's instructions.
  const { summary } = await buildAiProfile(supabase, user.id);

  const systemPrompt = `You are the AI Advisor in ClinicLog MD, a hours tracker used by pre-med students. You give general guidance about applying to medical school. You are not an admissions officer, you cannot predict admission, and you do not give medical advice.

${UNTRUSTED_DATA_RULES}

Here is the student's current profile and logged activity:
${fence("student_profile", summary, 6000)}

Your role:
- Give personalized, actionable advice based on the student's actual hours and profile above
- Be direct and honest. Say plainly when something is a weakness and what would help
- Reference their specific data when relevant
- Cover any med school topic: MCAT, GPA, clinical hours, research, letters of rec, personal statement, school selection, interview prep, gap years
- Keep responses concise but complete. 2-4 paragraphs max unless a detailed breakdown is needed
- Never fabricate medical school statistics; if unsure, say so and suggest they verify on MSAR
- Hour figures you mention are common benchmarks, never requirements
- If the question needs official or current information (deadlines, fees, a school's policy), say it may have changed and point to the AAMC or the school's site
- If you are not sure, say so

${HUMAN_STYLE_RULES}`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: systemPrompt });

    // Gemini requires history to start with a user turn. Each prior message is
    // fenced as data, so a forged "assistant" turn carries no authority.
    const prior = messages.slice(0, -1);
    const firstUserIdx = prior.findIndex((m) => m.role === "user");
    const trimmed = firstUserIdx === -1 ? [] : prior.slice(firstUserIdx);
    const history = trimmed.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.role === "user" ? fence("student_message", m.content, 2000) : m.content.slice(0, 2000) }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(fence("student_message", messages[messages.length - 1].content, 2000));
    return NextResponse.json({ reply: cleanAiText(result.response.text()), remaining: limit.remaining });
  } catch (err) {
    return serverError("api/advisor", err);
  }
}
