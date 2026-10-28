import { GoogleGenerativeAI } from "@google/generative-ai";
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

  const prompt = `You are an expert medical school application advisor helping a pre-med student craft their AMCAS application.

Reframe the following clinical experience description into polished, AMCAS-ready language. The reframed version must:
- Lead with the most clinically meaningful aspect of the experience
- Highlight direct patient interaction or clinical impact where present
- Showcase specific skills developed (clinical reasoning, communication, empathy, teamwork)
- Use active voice and precise, professional language
- Feel authentic and personal, not generic or corporate
- Be 2–4 concise, compelling sentences
- Never use em dashes. Use a comma, a colon, or a new sentence instead

${UNTRUSTED_DATA_RULES}

Original description:
${fence("description", description, 2000)}

Return only the reframed description text. No preamble, no quotes, no explanation.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const reframed = result.response.text().trim();

    if (!reframed) {
      return NextResponse.json({ error: "AI returned an empty response. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ reframed });
  } catch (err) {
    return serverError("api/reframe", err);
  }
}
