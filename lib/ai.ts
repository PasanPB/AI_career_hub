// AI service functions — server-side API routes (Gemini 2.0 Flash)

// ── Session storage helpers (client-side only) ─────────────────────────────

export function saveCvToSession(cvText: string, fileName?: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("cv_text", cvText);
    if (fileName) sessionStorage.setItem("cv_filename", fileName);
  } catch {}
}

export function getCvFromSession(): { text: string; fileName: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const text = sessionStorage.getItem("cv_text");
    const fileName = sessionStorage.getItem("cv_filename") || "Your CV";
    if (text && text.length > 100) return { text, fileName };
  } catch {}
  return null;
}

export function clearCvFromSession() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem("cv_text");
    sessionStorage.removeItem("cv_filename");
  } catch {}
}

// ── CV Analysis ────────────────────────────────────────────────────────────

export type CvResult = {
  score: number;
  subScores: { structure: number; content: number; ats: number; impact: number };
  detectedRole: string;
  detectedLevel: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  atsOptimization: string[];
  missingSkills: string[];
  topKeywords: string[];
  recommendedRoles: Array<{ role: string; match: string; reason: string }>;
};

export async function analyzeCv(cvText: string): Promise<CvResult> {
  const res = await fetch("/api/analyze-cv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cvText }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`CV analysis failed: ${res.status} ${errText}`);
  }
  return res.json();
}

// ── Interview Prep ─────────────────────────────────────────────────────────

export type TechQuestion = {
  topic: string;
  question: string;
  answer: string;
  tip: string;
  difficulty: "Easy" | "Medium" | "Hard";
};
export type HrQuestion = {
  question: string;
  answer: string;
  starExample: string;
};
export type InterviewResult = {
  technical: TechQuestion[];
  hr: HrQuestion[];
  interviewTips: string[];
  topicsToRevise: Array<{ topic: string; priority: "High" | "Medium" | "Low" }>;
};

export async function generateInterviewQuestions(
  role: string,
  level: string,
  companyType?: string
): Promise<InterviewResult> {
  const res = await fetch("/api/interview-prep", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, level, companyType }),
  });
  if (!res.ok) throw new Error(`Interview prep failed: ${res.status}`);
  return res.json();
}

// ── Salary Guide ───────────────────────────────────────────────────────────

export type SalaryResult = {
  currency: string;
  entry: { min: number; max: number };
  mid: { min: number; max: number };
  senior: { min: number; max: number };
  marketOutlook: { trend: "Growing" | "Stable" | "Declining"; reason: string };
  remoteMultiplier: number;
  requiredSkills: string[];
  careerTips: string[];
  topCompanies: string[];
  certifications: Array<{ name: string; salaryBump: string }>;
  careerPath: Array<{ title: string; yearsExp: string; avgSalary: string }>;
};

export async function getSalaryInsights(
  role: string,
  country: string
): Promise<SalaryResult> {
  const res = await fetch("/api/salary-guide", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, country }),
  });
  if (!res.ok) throw new Error(`Salary guide failed: ${res.status}`);
  return res.json();
}

// ── Career Quiz ────────────────────────────────────────────────────────────

export type CareerMatch = {
  rank: number;
  title: string;
  emoji: string;
  matchScore: number;
  whyItFits: string;
  gapAnalysis: string[];
  nextSteps: string[];
  salaryRange: string;
  color: string;
  href: string;
};
export type QuizResult = {
  matches: CareerMatch[];
  summary: string;
  topStrength: string;
};

export async function generateCareerRecommendation(
  answers: Record<number, number>,
  cvText?: string
): Promise<QuizResult> {
  const res = await fetch("/api/career-quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers, cvText }),
  });
  if (!res.ok) throw new Error(`Career quiz failed: ${res.status}`);
  return res.json();
}

export async function generateBlog(topic: string) {
  try {
    const res = await fetch("/api/generate-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    if (!res.ok) throw new Error("API error");
    return await res.json();
  } catch (err) {
    console.error("generateBlog error:", err);
    return null;
  }
}
