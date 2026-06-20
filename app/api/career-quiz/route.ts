import { NextRequest, NextResponse } from "next/server";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

function cleanJson(text: string) {
  return text.replace(/```json|```/g, "").trim();
}

const QUIZ_SCORE_MAP: Record<number, Record<number, Record<string, number>>> = {
  1: { 0: { se:3,ds:1,da:0,ba:0 }, 1: { se:0,ds:2,da:3,ba:1 }, 2: { se:1,ds:3,da:1,ba:0 }, 3: { se:0,ds:0,da:1,ba:3 } },
  2: { 0: { se:1,ds:3,da:2,ba:1 }, 1: { se:3,ds:2,da:0,ba:0 }, 2: { se:0,ds:0,da:1,ba:3 }, 3: { se:2,ds:2,da:1,ba:0 } },
  3: { 0: { se:3,ds:1,da:0,ba:0 }, 1: { se:0,ds:3,da:1,ba:0 }, 2: { se:0,ds:1,da:3,ba:1 }, 3: { se:0,ds:0,da:0,ba:3 } },
  4: { 0: { se:3,ds:1,da:0,ba:0 }, 1: { se:0,ds:3,da:0,ba:0 }, 2: { se:0,ds:1,da:3,ba:1 }, 3: { se:0,ds:0,da:1,ba:3 } },
  5: { 0: { se:2,ds:2,da:0,ba:0 }, 1: { se:0,ds:1,da:2,ba:2 }, 2: { se:0,ds:0,da:1,ba:3 }, 3: { se:1,ds:2,da:2,ba:1 } },
  6: { 0: { se:3,ds:0,da:0,ba:0 }, 1: { se:0,ds:3,da:0,ba:0 }, 2: { se:0,ds:1,da:3,ba:1 }, 3: { se:0,ds:0,da:0,ba:3 } },
  7: { 0: { se:1,ds:3,da:1,ba:1 }, 1: { se:3,ds:0,da:1,ba:1 }, 2: { se:0,ds:2,da:3,ba:0 }, 3: { se:0,ds:0,da:0,ba:3 } },
  8: { 0: { se:3,ds:0,da:0,ba:0 }, 1: { se:0,ds:3,da:0,ba:0 }, 2: { se:0,ds:1,da:3,ba:1 }, 3: { se:0,ds:0,da:0,ba:3 } },
};

export async function POST(req: NextRequest) {
  try {
    const { answers, cvText } = await req.json();

    let prompt: string;

    if (cvText && cvText.length > 100) {
      // CV-aware mode: deep analysis of the actual CV
      prompt = `You are an expert career counselor with 20 years of experience in tech recruiting.
Analyze this CV/resume and identify the top career paths that best match this person's background, skills, and experience.
Return ONLY valid JSON — no markdown, no extra text.

CV Content:
${cvText.slice(0, 6000)}

Return this JSON structure with the top 3 career matches:
{
  "matches": [
    {
      "rank": 1,
      "title": "<job title>",
      "emoji": "<relevant emoji>",
      "matchScore": <number 70-99 — how well CV matches>,
      "whyItFits": "<2-3 sentences explaining why this CV is perfect for this role, citing specific CV evidence>",
      "gapAnalysis": ["<specific skill or experience gap 1>", "<gap 2>", "<gap 3>"],
      "nextSteps": ["<actionable next step 1>", "<next step 2>", "<next step 3>"],
      "salaryRange": "<e.g. $70K-$120K USD or LKR 120K-250K/month>",
      "color": "<tailwind gradient string e.g. from-blue-500 to-blue-700>",
      "href": "/salary-guide"
    },
    { "rank": 2, ... },
    { "rank": 3, ... }
  ],
  "summary": "<2-sentence overall profile summary based on the CV>",
  "topStrength": "<the single most impressive thing about this candidate's CV>"
}

Career options to consider: Software Engineer, Data Scientist, Data Analyst, Business Analyst, Product Manager, ML Engineer, DevOps Engineer, Full Stack Developer, Cloud Engineer, UX Designer.
Pick the 3 best fits based on the actual CV content. Rank 1 = best fit.`;
    } else {
      // Quiz-based mode: use answers to compute scores
      const scores = { se: 0, ds: 0, da: 0, ba: 0 };
      if (answers && typeof answers === "object") {
        Object.entries(answers).forEach(([qId, optIdx]) => {
          const qMap = QUIZ_SCORE_MAP[Number(qId)];
          if (qMap) {
            const opts = qMap[Number(optIdx)];
            if (opts) {
              Object.entries(opts).forEach(([k, v]) => {
                scores[k as keyof typeof scores] += v as number;
              });
            }
          }
        });
      }

      // Sort by score descending
      const sorted = (Object.entries(scores) as [string, number][]).sort((a, b) => b[1] - a[1]);
      const total = sorted.reduce((s, [, v]) => s + v, 0) || 1;

      const careerMap: Record<string, { title: string; emoji: string; color: string }> = {
        se: { title: "Software Engineer", emoji: "💻", color: "from-blue-500 to-blue-700" },
        ds: { title: "Data Scientist", emoji: "🔬", color: "from-violet-500 to-violet-700" },
        da: { title: "Data Analyst", emoji: "📊", color: "from-emerald-500 to-emerald-700" },
        ba: { title: "Business Analyst", emoji: "📈", color: "from-orange-500 to-orange-700" },
      };

      const rankedCareers = sorted.map(([key, score], i) => ({
        key,
        score,
        pct: Math.round((score / total) * 100),
        ...careerMap[key],
        rank: i + 1,
      }));

      prompt = `You are a career counselor. A user completed a career quiz. Based on their quiz score profile, generate personalized career match recommendations.

Score profile (higher = stronger fit):
${rankedCareers.map(c => `${c.title}: ${c.score} points (${c.pct}%)`).join("\n")}

Return ONLY valid JSON:
{
  "matches": [
    {
      "rank": 1,
      "title": "${rankedCareers[0]?.title}",
      "emoji": "${rankedCareers[0]?.emoji}",
      "matchScore": ${Math.min(95, 60 + rankedCareers[0]?.score)},
      "whyItFits": "<2-3 sentences explaining why their quiz answers show aptitude for this role>",
      "gapAnalysis": ["<gap 1>", "<gap 2>", "<gap 3>"],
      "nextSteps": ["<action 1>", "<action 2>", "<action 3>"],
      "salaryRange": "<realistic global salary range>",
      "color": "${rankedCareers[0]?.color}",
      "href": "/salary-guide"
    },
    {
      "rank": 2,
      "title": "${rankedCareers[1]?.title}",
      "emoji": "${rankedCareers[1]?.emoji}",
      "matchScore": ${Math.min(88, 50 + rankedCareers[1]?.score)},
      "whyItFits": "<explanation>",
      "gapAnalysis": ["<gap 1>", "<gap 2>"],
      "nextSteps": ["<action 1>", "<action 2>"],
      "salaryRange": "<salary range>",
      "color": "${rankedCareers[1]?.color}",
      "href": "/salary-guide"
    },
    {
      "rank": 3,
      "title": "${rankedCareers[2]?.title}",
      "emoji": "${rankedCareers[2]?.emoji}",
      "matchScore": ${Math.min(78, 40 + rankedCareers[2]?.score)},
      "whyItFits": "<explanation>",
      "gapAnalysis": ["<gap 1>", "<gap 2>"],
      "nextSteps": ["<action 1>", "<action 2>"],
      "salaryRange": "<salary range>",
      "color": "${rankedCareers[2]?.color}",
      "href": "/salary-guide"
    }
  ],
  "summary": "<2-sentence summary of the user's career profile based on quiz>",
  "topStrength": "<the user's standout trait revealed by their quiz answers>"
}`;
    }

    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 2048 },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ error: "AI service unavailable" }, { status: 502 });
    }

    const data = await res.json();
    const text = cleanJson(data.candidates?.[0]?.content?.parts?.[0]?.text || "");
    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    console.error("career-quiz route error:", err);
    return NextResponse.json({ error: "Quiz analysis failed" }, { status: 500 });
  }
}
