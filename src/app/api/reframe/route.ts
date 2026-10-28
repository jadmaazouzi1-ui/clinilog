import { GoogleGenerativeAI } from "@google/generative-ai";
import { cleanAiText, HUMAN_STYLE_RULES } from "@/lib/aiText";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";
import { forbiddenOrigin, isSameOrigin, secondsUntilUtcMidnight, serverError, tooManyRequests } from "@/lib/http";
import { UNTRUSTED_DATA_RULES, fence } from "@/lib/aiGuard";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return forbiddenOrigin();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI reframe is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkUserRateLimit(supabase, "reframe");
  if (!limit.allowed) {
    return tooManyRequests("Daily reframe limit reached (10/day). Come back tomorrow.", secondsUntilUtcMidnight());
  }

  let description = "";
  try {
    const body = await req.json();
    description = typeof body?.description === "string" ? body.description.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!description) {
    return NextResponse.json({ error: "No description provided." }, { status: 400 });
  }
  // Bounded: matches the description field's own cap, and stops one request
  // from sending an arbitrarily large prompt.
  if (description.length > 2000) {
    return NextResponse.json({ error: "Description is too long to reframe (2,000 characters max)." }, { status: 413 });
  }

  const prompt = `You are helping a pre-med student tighten one experience description for the AMCAS Work and Activities section.

Rewrite the description below so it is clear and specific. Rules:
- Stay faithful to what the student wrote. Keep their facts, and add none: no new duties, patients, numbers, outcomes, skills or accomplishments
- Lead with what they actually did, in first person, past or present tense to match the original
- Prefer concrete nouns and plain verbs over adjectives
- 2 to 4 sentences, of varied length
- If the original is too thin to say anything specific, keep it short rather than padding it

${HUMAN_STYLE_RULES}

${UNTRUSTED_DATA_RULES}

Original description:
${fence("description", description, 2000)}

Return only the reframed description text. No preamble, no quotes, no explanation.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const reframed = cleanAiText(result.response.text());

    if (!reframed) {
      return NextResponse.json({ error: "AI returned an empty response. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ reframed });
  } catch (err) {
    return serverError("api/reframe", err);
  }
}
