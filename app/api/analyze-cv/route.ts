import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

function cleanJson(text: string) {
  return text.replace(/```json|```/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const { cvText } = await req.json();
    if (!cvText || cvText.length < 100) {
      return NextResponse.json({ error: "CV text too short" }, { status: 400 });
    }

    const prompt = `You are a world-class HR consultant and career coach with 20 years of experience.
Analyze the following CV/resume in detail and return ONLY a valid JSON object — no markdown, no extra text.

Required JSON structure:
{
  "score": <overall score 0-100 based on quality>,
  "subScores": {
    "structure": <0-100, layout, formatting, readability>,
    "content": <0-100, depth of experience descriptions, achievements>,
    "ats": <0-100, ATS keyword optimization, section headings>,
    "impact": <0-100, quantified achievements, measurable results>
  },
  "detectedRole": "<primary job title/role this CV targets>",
  "detectedLevel": "<one of: Fresher | Junior | Mid-level | Senior | Lead | Executive>",
  "summary": "<2-sentence personalized executive summary of this candidate's profile>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>", "<specific strength 4>"],
  "weaknesses": ["<specific weakness 1>", "<specific weakness 2>", "<specific weakness 3>"],
  "improvements": [
    "<specific actionable improvement 1 with example>",
    "<specific actionable improvement 2 with example>",
    "<specific actionable improvement 3 with example>",
    "<specific actionable improvement 4 with example>"
  ],
  "atsOptimization": [
    "<ATS tip 1 specific to this CV>",
    "<ATS tip 2 specific to this CV>",
    "<ATS tip 3 specific to this CV>"
  ],
  "missingSkills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>"],
  "topKeywords": ["<keyword found in CV 1>", "...", "<up to 12 keywords>"],
  "recommendedRoles": [
    { "role": "<role title>", "match": "<High|Medium>", "reason": "<1 sentence why>" },
    { "role": "<role title>", "match": "<High|Medium>", "reason": "<1 sentence why>" },
    { "role": "<role title>", "match": "<High|Medium>", "reason": "<1 sentence why>" }
  ]
}

CV to analyze:
${cvText.slice(0, 8000)}`;

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Gemini API error:", err);
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const text = cleanJson(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    console.error("analyze-cv route error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}