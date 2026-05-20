import { NextResponse } from "next/server";
import { Experience } from "@/lib/types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
  }

  const { experiences }: { experiences: Experience[] } = await request.json();

  if (!experiences || experiences.length === 0) {
    return NextResponse.json({ error: "No experiences to analyze." }, { status: 400 });
  }

  const experienceSummary = experiences
    .map(
      (e) =>
        `- Title: ${e.title}\n  Organization: ${e.organization}\n  Type: ${e.type}\n  Hours: ${e.hours}\n  Dates: ${e.start_date}${e.end_date ? ` to ${e.end_date}` : " – Present"}\n  Description: ${e.description}${e.reflection ? `\n  Reflection: ${e.reflection}` : ""}`
    )
    .join("\n\n");

  const prompt = `You are an expert medical school application advisor helping a first-generation pre-med student craft their application narrative.

Here are their logged clinical experiences:

${experienceSummary}

Based on these experiences, generate the following in valid JSON format with exactly this structure:

{
  "theme": "A compelling 2-3 sentence personal statement theme that weaves these experiences into a single coherent narrative arc. Make it specific to what you observe in their work.",
  "whoIAm": "A 150-200 word paragraph written in first person that captures their journey, motivations, and the kind of physician they are becoming. Ground it in specific details from their experiences.",
  "descriptions": [
    {
      "id": "<copy the exact experience id>",
      "title": "<copy the exact experience title>",
      "description": "<AMCAS-ready description under 700 characters. First person. What they did, what they observed, what they learned, and why it matters. Professional and authentic.>"
    }
  ]
}

Rules:
- Every description MUST be under 700 characters (count carefully)
- Write in first person throughout
- Be specific — reference real details from their experiences
- Return only valid JSON, no markdown, no commentary outside the JSON`;

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error("Gemini error:", body);
    return NextResponse.json({ error: "Gemini API request failed." }, { status: 502 });
  }

  const geminiData = await res.json();
  const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    return NextResponse.json({ error: "Empty response from Gemini." }, { status: 502 });
  }

  try {
    const parsed = JSON.parse(rawText);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({ error: "Failed to parse Gemini response as JSON." }, { status: 502 });
  }
}
