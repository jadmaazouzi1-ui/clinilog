import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkUserRateLimit } from "@/lib/rateLimit";
import { ARCHETYPES, ArchetypeAnalysis } from "@/lib/archetypes";
import { formatHours } from "@/lib/types";

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const limit = await checkUserRateLimit(supabase, "archetype");
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Daily archetype limit reached (3/day). Come back tomorrow." },
      { status: 429 }
    );
  }

  // Pull profile + experiences
  const [profileRes, expRes] = await Promise.all([
    supabase.from("profiles").select("full_name, undergraduate_school, graduation_year, intended_specialty").eq("id", user.id).single(),
    supabase.from("experiences").select("title, organization, type, hours, description, reflection, start_date, end_date").order("start_date", { ascending: false }),
  ]);

  const profile: {
    full_name?: string | null;
    undergraduate_school?: string | null;
    graduation_year?: number | string | null;
    intended_specialty?: string | null;
  } = profileRes.data ?? {};
  const exps = expRes.data ?? [];

  if (exps.length < 3) {
    return NextResponse.json({ error: "Log at least 3 experiences to generate your archetype." }, { status: 400 });
  }

  // Build context string
  const hoursByType: Record<string, number> = {};
  let totalHours = 0;
  for (const e of exps) {
    hoursByType[e.type] = (hoursByType[e.type] ?? 0) + (e.hours ?? 0);
    totalHours += e.hours ?? 0;
  }

  const expList = exps
    .map(
      (e, i) =>
        `${i + 1}. "${e.title}" at ${e.organization} — ${e.type.replace("_", " ")}, ${formatHours(e.hours ?? 0)} hrs\n   Description: ${e.description ?? "(none)"}${e.reflection ? `\n   Reflection: ${e.reflection}` : ""}`
    )
    .join("\n\n");

  const archetypeList = ARCHETYPES.map((a) => `- ${a.id}: ${a.name} — ${a.description}`).join("\n");

  const systemPrompt = `You are an expert pre-medical advisor analyzing a student's full clinical and academic profile to identify their dominant pre-med archetype.

You will receive a student's profile and a list of their logged experiences. Based on the patterns, themes, hours distribution, and language they use to describe their work, assign them ONE of these 15 archetypes:

${archetypeList}

Return ONLY a valid JSON object (no markdown, no code blocks, no extra text) with this exact shape:
{
  "archetype_id": "<one of the archetype ids above>",
  "why_paragraph": "<2-4 sentences explaining why this archetype fits THEIR specific profile — MUST reference actual organization names from their experiences and actual hour counts>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "statement_angle": "<2-3 sentence suggested narrative direction for their personal statement>",
  "experiences_to_add": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3 (optional)>"]
}

Be warm and specific. Reference real details from their profile. Strengths should be 1 sentence each, written in second person ("You bring...").`;

  const userPrompt = `Student profile:
Name: ${profile.full_name ?? "(not provided)"}
Undergraduate school: ${profile.undergraduate_school ?? "(not provided)"}
Graduation year: ${profile.graduation_year ?? "(not provided)"}
Intended specialty: ${profile.intended_specialty ?? "(undecided)"}

Total logged hours: ${formatHours(totalHours)}
Hours by category: ${Object.entries(hoursByType).map(([k, v]) => `${k.replace("_", " ")}=${formatHours(v)}`).join(", ")}

Experiences (${exps.length}):

${expList}

Now analyze and return the JSON.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    let parsed: ArchetypeAnalysis;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: "AI returned malformed response. Please regenerate." }, { status: 502 });
    }

    // Validate archetype_id
    if (!ARCHETYPES.find((a) => a.id === parsed.archetype_id)) {
      return NextResponse.json({ error: `AI returned unknown archetype: ${parsed.archetype_id}` }, { status: 502 });
    }

    // Persist
    await supabase
      .from("profiles")
      .update({
        archetype_id: parsed.archetype_id,
        archetype_data: parsed,
        archetype_generated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    return NextResponse.json({ analysis: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/archetype] Gemini call failed:", message);
    return NextResponse.json({ error: `Archetype analysis failed: ${message}` }, { status: 500 });
  }
}
