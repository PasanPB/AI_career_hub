import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

function cleanJson(text: string) {
  return text.replace(/```json|```/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const { role, level, companyType = "General" } = await req.json();

    const prompt = `You are a senior technical interviewer and career coach specializing in ${role} roles.
Generate a comprehensive, high-quality interview preparation guide for a ${level} ${role} at a ${companyType} company.
Return ONLY valid JSON — no markdown, no extra text.

{
  "technical": [
    {
      "topic": "<topic area e.g. 'Machine Learning', 'System Design', 'SQL'>",
      "question": "<specific, real technical interview question>",
      "answer": "<thorough, expert-level answer with code snippets or examples where relevant>",
      "tip": "<insider tip on how to impress the interviewer on this question>",
      "difficulty": "<Easy|Medium|Hard>"
    }
  ],
  "hr": [
    {
      "question": "<behavioral/HR question>",
      "answer": "<detailed answer framework using STAR method where appropriate>",
      "starExample": "<a concrete example answer using Situation-Task-Action-Result>"
    }
  ],
  "interviewTips": [
    "<specific, actionable interview tip for a ${level} ${role} at ${companyType}>"
  ],
  "topicsToRevise": [
    { "topic": "<topic name>", "priority": "<High|Medium|Low>" }
  ]
}

Requirements:
- Generate exactly 8 technical questions covering different topics, mix of difficulties
- Generate exactly 5 HR/behavioral questions
- Generate exactly 5 interviewTips specific to this role/level/company type
- Generate exactly 6 topicsToRevise
- Questions must be specific and realistic — not generic
- Answers must be detailed, at least 3-4 sentences
- For ${level} level: ${
      level === "Fresher" ? "focus on fundamentals, theory, and learning attitude" :
      level === "Junior" ? "focus on practical coding and basic architecture" :
      level === "Mid-level" ? "focus on design patterns, system thinking, and ownership" :
      "focus on system design, leadership, tradeoffs, and strategic thinking"
    }`;

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const text = cleanJson(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    console.error("interview-prep route error:", err);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}