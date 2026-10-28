import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";
import { buildAiProfile } from "@/lib/aiProfile";
import { forbiddenOrigin, isSameOrigin, secondsUntilUtcMidnight, serverError, tooManyRequests } from "@/lib/http";
import { UNTRUSTED_DATA_RULES, fence } from "@/lib/aiGuard";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The outline generator is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = await checkUserRateLimit(supabase, "outline");
  if (!limit.allowed) {
    return tooManyRequests("Daily outline limit reached (10/day). Come back tomorrow.", secondsUntilUtcMidnight());
  }

  const { profileRow, experiences, summary } = await buildAiProfile(supabase, user.id);

  if (experiences.length < 3) {
    return NextResponse.json(
      { error: "Log at least three experiences first. An outline built on less than that would be generic." },
      { status: 400 }
    );
  }
  if (!profileRow?.archetype_id) {
    return NextResponse.json(
      { error: "Generate your archetype first. The outline builds on it." },
      { status: 400 }
    );
  }

  const prompt = `You are an experienced medical school admissions advisor helping a student outline their AMCAS personal statement.

Use ONLY the student's real logged data below. Never invent an experience, an organisation, or an hour count. If the data is thin in a place, say so plainly in the outline rather than padding it.

${UNTRUSTED_DATA_RULES}

${fence("student_record", summary, 8000)}

Return ONLY a valid JSON object (no markdown, no code fences, no extra text) with this exact shape:
{
  "hook": "<2-3 sentences describing a specific opening moment drawn from one of their actual logged experiences, named explicitly>",
  "themes": [
    { "title": "<short theme name>", "evidence": "<which of their specific experiences supports this, named>", "development": "<2-3 sentences on how to develop this theme>" }
  ],
  "closing": "<2-3 sentences on how to close, tying back to the hook>",
  "watch_out": "<one honest caution specific to this profile, e.g. an over-represented category or a gap a reader will notice>"
}

Rules:
- Provide 2 or 3 themes, no more
- Every theme must cite a real logged experience by name
- Write in second person, addressed to the student
- Never use em dashes. Use a comma, a colon, or a new sentence instead

Now produce the outline.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
    const outline = JSON.parse(text);
    return NextResponse.json({ outline });
  } catch (err) {
    return serverError("api/outline", err);
  }
}
