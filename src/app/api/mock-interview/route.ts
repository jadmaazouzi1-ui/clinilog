import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";
import { buildAiProfile } from "@/lib/aiProfile";

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "The question generator is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = await checkUserRateLimit(supabase, "mock_interview");
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Daily regenerate limit reached (3/day). Come back tomorrow." },
      { status: 429 }
    );
  }

  const { experiences, summary } = await buildAiProfile(supabase, user.id);
  if (experiences.length < 1) {
    return NextResponse.json(
      { error: "Log at least one experience first so the questions can be about your own record." },
      { status: 400 }
    );
  }

  const prompt = `You are a medical school interviewer preparing questions for a specific applicant.

Use the applicant's real logged data below. Traditional questions should reference their actual experiences by name. MMI scenarios should be ethical or situational prompts of the kind used in a multiple mini interview, and should not reference their file directly.

${summary}

Return ONLY a valid JSON object (no markdown, no code fences) with this exact shape:
{
  "traditional": [ { "question": "<question text>", "why": "<one sentence on what the interviewer is really probing>" } ],
  "mmi": [ { "question": "<scenario text>", "why": "<one sentence on what is being assessed>" } ]
}

Rules:
- Exactly 5 traditional questions and exactly 5 MMI scenarios
- At least 3 traditional questions must name a specific logged experience
- Include at least one traditional question that probes a visible weakness or gap in their record, asked fairly
- Never use em dashes. Use a comma, a colon, or a new sentence instead

Now produce the questions.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim();
    const questions = JSON.parse(text);
    return NextResponse.json({ questions, remaining: limit.remaining });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Could not generate questions: ${msg}` }, { status: 502 });
  }
}
