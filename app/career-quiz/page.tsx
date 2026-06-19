"use client";
import { useState } from "react";
import { Brain, ArrowRight, RotateCcw, CheckCircle } from "lucide-react";
import Link from "next/link";
import { generateCareerRecommendation } from "@/lib/ai";

const questions = [
  {
    id: 1,
    text: "Which activity would you enjoy most on a weekend?",
    options: [
      { text: "Building a small app or website", scores: { se: 3, ds: 1, da: 0, ba: 0 } },
      { text: "Analyzing data trends in a spreadsheet", scores: { se: 0, ds: 2, da: 3, ba: 1 } },
      { text: "Reading about AI and experimenting with models", scores: { se: 1, ds: 3, da: 1, ba: 0 } },
      { text: "Writing a report on business performance", scores: { se: 0, ds: 0, da: 1, ba: 3 } },
    ],
  },
  {
    id: 2,
    text: "Which subject did you enjoy most in school?",
    options: [
      { text: "Mathematics / Statistics", scores: { se: 1, ds: 3, da: 2, ba: 1 } },
      { text: "Computer Science / Programming", scores: { se: 3, ds: 2, da: 0, ba: 0 } },
      { text: "Economics / Business Studies", scores: { se: 0, ds: 0, da: 1, ba: 3 } },
      { text: "Science / Physics", scores: { se: 2, ds: 2, da: 1, ba: 0 } },
    ],
  },
  {
    id: 3,
    text: "How do you prefer to solve a problem?",
    options: [
      { text: "Write code to automate it", scores: { se: 3, ds: 1, da: 0, ba: 0 } },
      { text: "Build a statistical model", scores: { se: 0, ds: 3, da: 1, ba: 0 } },
      { text: "Create dashboards and reports", scores: { se: 0, ds: 1, da: 3, ba: 1 } },
      { text: "Stakeholder meetings and process redesign", scores: { se: 0, ds: 0, da: 0, ba: 3 } },
    ],
  },
  {
    id: 4,
    text: "Which tool would you most like to master?",
    options: [
      { text: "Python / React / Docker", scores: { se: 3, ds: 1, da: 0, ba: 0 } },
      { text: "TensorFlow / PyTorch / Scikit-learn", scores: { se: 0, ds: 3, da: 0, ba: 0 } },
      { text: "Power BI / Tableau / SQL", scores: { se: 0, ds: 1, da: 3, ba: 1 } },
      { text: "Jira / Confluence / Excel", scores: { se: 0, ds: 0, da: 1, ba: 3 } },
    ],
  },
  {
    id: 5,
    text: "Which best describes your communication style?",
    options: [
      { text: "I prefer working independently on technical tasks", scores: { se: 2, ds: 2, da: 0, ba: 0 } },
      { text: "I like explaining complex findings simply", scores: { se: 0, ds: 1, da: 2, ba: 2 } },
      { text: "I enjoy running workshops and presentations", scores: { se: 0, ds: 0, da: 1, ba: 3 } },
      { text: "Mix of both technical and communication", scores: { se: 1, ds: 2, da: 2, ba: 1 } },
    ],
  },
  {
    id: 6,
    text: "What type of project excites you most?",
    options: [
      { text: "Building a real-time web application", scores: { se: 3, ds: 0, da: 0, ba: 0 } },
      { text: "Training an AI model to make predictions", scores: { se: 0, ds: 3, da: 0, ba: 0 } },
      { text: "Uncovering trends in customer behavior", scores: { se: 0, ds: 1, da: 3, ba: 1 } },
      { text: "Mapping out a company's digital transformation", scores: { se: 0, ds: 0, da: 0, ba: 3 } },
    ],
  },
  {
    id: 7,
    text: "How comfortable are you with ambiguity?",
    options: [
      { text: "Very comfortable — I figure things out as I go", scores: { se: 1, ds: 3, da: 1, ba: 1 } },
      { text: "I prefer clear specs and requirements", scores: { se: 3, ds: 0, da: 1, ba: 1 } },
      { text: "I define structure myself from raw data", scores: { se: 0, ds: 2, da: 3, ba: 0 } },
      { text: "I bridge ambiguity between teams", scores: { se: 0, ds: 0, da: 0, ba: 3 } },
    ],
  },
  {
    id: 8,
    text: "Which outcome would give you most satisfaction?",
    options: [
      { text: "Shipping a product used by millions", scores: { se: 3, ds: 0, da: 0, ba: 0 } },
      { text: "A model that accurately predicts outcomes", scores: { se: 0, ds: 3, da: 0, ba: 0 } },
      { text: "A dashboard that drives business decisions", scores: { se: 0, ds: 1, da: 3, ba: 1 } },
      { text: "A strategy that saves the company money", scores: { se: 0, ds: 0, da: 0, ba: 3 } },
    ],
  },
];

const careers = {
  se: {
    title: "Software Engineer",
    emoji: "💻",
    color: "from-blue-500 to-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    desc: "You love building things and solving technical problems through code. Software engineering is the perfect fit — you'll design systems, write clean code, and ship products that scale.",
    skills: ["Python / JavaScript", "System Design", "Data Structures", "APIs", "Cloud Platforms"],
    href: "/salary-guide",
  },
  ds: {
    title: "Data Scientist",
    emoji: "🔬",
    color: "from-violet-500 to-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    desc: "You thrive at the intersection of math, statistics, and programming. Data Science lets you build predictive models, uncover hidden patterns, and drive decisions with AI.",
    skills: ["Python / R", "Machine Learning", "Statistics", "SQL", "TensorFlow"],
    href: "/salary-guide",
  },
  da: {
    title: "Data Analyst",
    emoji: "📊",
    color: "from-emerald-500 to-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    desc: "You excel at turning raw data into clear insights. Data Analytics suits you perfectly — you'll query databases, build dashboards, and help organizations make evidence-based decisions.",
    skills: ["SQL", "Excel / Python", "Power BI / Tableau", "Statistics", "Communication"],
    href: "/salary-guide",
  },
  ba: {
    title: "Business Analyst",
    emoji: "📈",
    color: "from-orange-500 to-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    desc: "You have a talent for bridging the gap between business needs and technical solutions. Business Analysis leverages your communication, critical thinking, and process-design skills.",
    skills: ["Requirements Gathering", "Process Modeling", "Stakeholder Management", "SQL", "Agile"],
    href: "/salary-guide",
  },
};

export default function CareerQuiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverResult, setServerResult] = useState<null | typeof careers[keyof typeof careers]>(null);

  function pickOption(qId: number, oIdx: number) {
    setAnswers((prev) => ({ ...prev, [qId]: oIdx }));
  }

  function getResult() {
    const scores = { se: 0, ds: 0, da: 0, ba: 0 };
    questions.forEach((q) => {
      const idx = answers[q.id];
      if (idx !== undefined) {
        const s = q.options[idx].scores;
        (Object.keys(s) as (keyof typeof scores)[]).forEach((k) => {
          scores[k] += s[k];
        });
      }
    });
    return (Object.keys(scores) as (keyof typeof scores)[]).reduce((a, b) => (scores[a] >= scores[b] ? a : b));
  }

  const answered = Object.keys(answers).length;
  const progress = (answered / questions.length) * 100;
  const localResult = submitted ? careers[getResult()] : null;
  const result = serverResult ?? localResult;

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-6">{result.emoji}</div>
        <div className={`inline-block px-4 py-1 rounded-full text-sm font-semibold mb-4 ${result.bg} ${result.border} border text-slate-700`}>
          Your best-fit career
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">{result.title}</h2>
        <p className="text-slate-600 text-lg leading-relaxed mb-8">{result.desc}</p>
        <div className={`${result.bg} ${result.border} border rounded-2xl p-6 mb-8`}>
          <h3 className="font-bold text-slate-900 mb-4">Key Skills to Develop</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {result.skills.map((s: string) => (
              <span key={s} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700">{s}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={result.href} className={`px-6 py-3 bg-gradient-to-r ${result.color || "from-blue-500 to-blue-700"} text-white font-semibold rounded-xl flex items-center gap-2 justify-center`}>
            View Salary Data <ArrowRight className="w-4 h-4" />
          </Link>
          <button onClick={() => { setSubmitted(false); setAnswers({}); setServerResult(null); }}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl flex items-center gap-2 justify-center hover:bg-slate-50 transition-colors">
            <RotateCcw className="w-4 h-4" /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center mx-auto mb-4">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Career Discovery Quiz</h1>
        <p className="text-slate-600">Answer 8 questions to discover which tech career suits you best.</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>{answered} of {questions.length} answered</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-orange-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-8">
        {questions.map((q, qi) => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-start gap-3 mb-5">
              <span className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {qi + 1}
              </span>
              <h3 className="font-semibold text-slate-900 text-lg leading-snug">{q.text}</h3>
            </div>
            <div className="space-y-3">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => pickOption(q.id, oi)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      selected
                        ? "border-orange-400 bg-orange-50 text-orange-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/50"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      selected ? "border-orange-500 bg-orange-500" : "border-slate-300"
                    }`}>
                      {selected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    {opt.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={async () => {
          if (answered < questions.length) return;
          setLoading(true);
          setSubmitted(true);
          try {
            const res = await generateCareerRecommendation(answers as Record<number, number>);
            if (res) setServerResult(res);
          } catch (err) {
            console.error(err);
          } finally {
            setLoading(false);
          }
        }}
        disabled={answered < questions.length || loading}
        className="mt-8 w-full py-4 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? "Finding best match…" : answered < questions.length ? `Answer all questions (${questions.length - answered} left)` : "See My Career Match →"}
      </button>
    </div>
  );
}
