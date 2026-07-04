import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI advisor is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limit = await checkUserRateLimit(supabase, "advisor");
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Daily AI limit reached. Come back tomorrow.", remaining: 0 },
      { status: 429 }
    );
  }

  const { messages, userContext } = await req.json();

  const systemPrompt = `You are an expert pre-medical advisor at ClinicLog, an all-in-one platform for pre-med students. You are warm, encouraging, and deeply knowledgeable about the medical school application process.

Here is the student's current profile and logged activity:
${userContext}

Your role:
- Give personalized, actionable advice based on the student's actual hours and profile above
- Be encouraging but honest — students need real guidance, not just cheerleading
- Reference their specific data when relevant (e.g., "With your X shadowing hours, you're in good shape for...")
- Cover any med school topic: MCAT, GPA, clinical hours, research, letters of rec, personal statement, school selection, interview prep, gap years, etc.
- Keep responses concise but complete — 2-4 paragraphs max unless a detailed breakdown is needed
- Never fabricate medical school statistics; if unsure, say so and suggest they verify on MSAR

Always address the student directly and warmly. You are their advocate.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
    });

    // Gemini requires history to start with a user message — drop any
    // leading assistant messages (e.g. our greeting).
    const priorMessages = messages.slice(0, -1) as { role: string; content: string }[];
    const firstUserIdx = priorMessages.findIndex((m) => m.role === "user");
    const trimmed = firstUserIdx === -1 ? [] : priorMessages.slice(firstUserIdx);
    const history = trimmed.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1].content;

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage);
    const text = result.response.text();

    return NextResponse.json({ reply: text, remaining: limit.remaining });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/advisor] Gemini call failed:", message);
    return NextResponse.json(
      { error: `Advisor failed: ${message}` },
      { status: 500 }
    );
  }
}
