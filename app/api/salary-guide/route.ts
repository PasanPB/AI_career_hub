import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

function cleanJson(text: string) {
  return text.replace(/```json|```/g, "").trim();
}

export async function POST(req: NextRequest) {
  try {
    const { role, country } = await req.json();

    const prompt = `You are a compensation expert and labor market analyst with deep knowledge of ${country}'s tech job market.
Provide accurate, up-to-date salary data and career insights for a ${role} in ${country}.
Return ONLY valid JSON — no markdown, no extra text.

{
  "currency": "<currency code e.g. USD, LKR, GBP, AUD, EUR>",
  "entry": { "min": <annual salary number>, "max": <annual salary number> },
  "mid": { "min": <annual salary number>, "max": <annual salary number> },
  "senior": { "min": <annual salary number>, "max": <annual salary number> },
  "marketOutlook": {
    "trend": "<Growing|Stable|Declining>",
    "reason": "<1-2 sentence explanation of the market trend for this role in ${country}>"
  },
  "remoteMultiplier": <decimal e.g. 1.3 means remote adds 30% to base, 1.0 means no change>,
  "requiredSkills": ["<skill 1>", "<skill 2>", "<skill 3>", "<skill 4>", "<skill 5>", "<skill 6>"],
  "careerTips": [
    "<actionable career growth tip 1 specific to ${role} in ${country}>",
    "<actionable career growth tip 2>",
    "<actionable career growth tip 3>"
  ],
  "topCompanies": ["<company 1>", "<company 2>", "<company 3>", "<company 4>", "<company 5>"],
  "certifications": [
    { "name": "<certification name>", "salaryBump": "<e.g. +15% or +$10K/year>" },
    { "name": "<certification name>", "salaryBump": "<e.g. +12%>" },
    { "name": "<certification name>", "salaryBump": "<e.g. +8%>" }
  ],
  "careerPath": [
    { "title": "<entry title e.g. Junior ${role}>", "yearsExp": "0-2 years", "avgSalary": "<formatted salary>" },
    { "title": "<mid title>", "yearsExp": "2-5 years", "avgSalary": "<formatted salary>" },
    { "title": "<senior title>", "yearsExp": "5-8 years", "avgSalary": "<formatted salary>" },
    { "title": "<lead/principal title>", "yearsExp": "8+ years", "avgSalary": "<formatted salary>" }
  ]
}

Use realistic current market rates for ${country}. For Sri Lanka, use LKR. For US/Canada/Australia use their respective currencies.`;

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const text = cleanJson(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    console.error("salary-guide route error:", err);
    return NextResponse.json({ error: "Failed to fetch salary data" }, { status: 500 });
  }
}