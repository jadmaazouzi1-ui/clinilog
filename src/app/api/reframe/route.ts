import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI reframe is not configured." }, { status: 503 });
  }

  const { description } = await req.json();
  if (!description?.trim()) {
    return NextResponse.json({ error: "No description provided." }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert medical school application advisor helping a first-generation pre-med student craft their AMCAS application.

Reframe the following clinical experience description into polished, AMCAS-ready language. The reframed version must:
- Lead with the most clinically meaningful aspect of the experience
- Highlight direct patient interaction or clinical impact where present
- Showcase specific skills developed (clinical reasoning, communication, empathy, teamwork)
- Use active voice and precise, professional language
- Feel authentic and personal — not generic or corporate
- Be 2–4 concise, compelling sentences

Original description:
"""
${description.trim()}
"""

Return only the reframed description text. No preamble, no quotes, no explanation.`;

  const result = await model.generateContent(prompt);
  const reframed = result.response.text().trim();

  return NextResponse.json({ reframed });
}
