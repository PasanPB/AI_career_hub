"use client";
import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, ChevronDown, ChevronUp, Loader2, Sparkles,
  Brain, Lightbulb, BookOpen, CheckCircle, Printer
} from "lucide-react";
import { generateInterviewQuestions, InterviewResult } from "@/lib/ai";

const difficultyStyle: Record<string, string> = {
  Easy: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Medium: "bg-amber-100 text-amber-700 border border-amber-200",
  Hard: "bg-red-100 text-red-700 border border-red-200",
};
const priorityStyle: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};
const companyTypes = ["General", "Startup", "Corporate / MNC", "FAANG / Big Tech", "Government / Public Sector"];
const quickRoles = [
  "Software Engineer", "Data Scientist", "Data Analyst", "Business Analyst",
  "Product Manager", "ML Engineer", "DevOps Engineer", "Full Stack Developer",
  "Cloud Engineer", "UX Designer"
];
const levels = ["Fresher", "Junior", "Mid-level", "Senior", "Lead"];

function AccordionItem({ question, answer, tag, tip, starExample, index }:
  { question: string; answer: string; tag?: string; tip?: string; starExample?: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
      className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3 pr-4 flex-1 min-w-0">
          {tag && <span className={`tag flex-shrink-0 ${difficultyStyle[tag] || "bg-slate-100 text-slate-600"}`}>{tag}</span>}
          <span className="font-medium text-slate-900 text-sm leading-snug">{question}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden border-t border-slate-200">
            <div className="px-5 py-4 bg-slate-50 space-y-4">
              <p className="text-sm text-slate-700 leading-relaxed">{answer}</p>
              {tip && (
                <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-700 mb-0.5">Pro Tip</p>
                    <p className="text-xs text-amber-700 leading-relaxed">{tip}</p>
                  </div>
                </div>
              )}
              {starExample && (
                <div className="flex gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700 mb-0.5">STAR Example Answer</p>
                    <p className="text-xs text-blue-700 leading-relaxed">{starExample}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InterviewPrepInner() {
  const params = useSearchParams();
  const [role, setRole] = useState(params.get("role") || "Software Engineer");
  const [customRole, setCustomRole] = useState("");
  const [useCustomRole, setUseCustomRole] = useState(false);
  const [level, setLevel] = useState(params.get("level") || "Fresher");
  const [companyType, setCompanyType] = useState("General");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [error, setError] = useState("");

  const effectiveRole = useCustomRole && customRole.trim() ? customRole.trim() : role;
  const totalQuestions = (result?.technical.length || 0) + (result?.hr.length || 0);

  async function handleGenerate() {
    setError(""); setLoading(true); setResult(null);
    try {
      const data = await generateInterviewQuestions(effectiveRole, level, companyType);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate questions. Please try again.");
    } finally { setLoading(false); }
  }

  const topicGroups = result ? result.technical.reduce<Record<string, typeof result.technical>>((acc, q) => {
    const t = q.topic || "General"; if (!acc[t]) acc[t] = []; acc[t].push(q); return acc;
  }, {}) : {};

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="hero-gradient border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shadow-lg shadow-violet-200">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Interview Preparation</h1>
                <p className="text-slate-500 text-sm">Powered by Gemini 2.0 Flash</p>
              </div>
            </div>
            <p className="text-slate-600 max-w-2xl">
              Get deeply personalized technical + behavioral questions tailored to your exact role, level, and company type — with expert answers, pro tips, and STAR examples.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Config panel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Experience Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white">
                {levels.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Company Type</label>
              <select value={companyType} onChange={(e) => setCompanyType(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white">
                {companyTypes.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <label className="block text-sm font-semibold text-slate-700 mb-2">Job Role</label>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setUseCustomRole(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!useCustomRole ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
              Choose from list
            </button>
            <button onClick={() => setUseCustomRole(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${useCustomRole ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}>
              Custom role
            </button>
          </div>
          {useCustomRole ? (
            <input value={customRole} onChange={(e) => setCustomRole(e.target.value)}
              placeholder="e.g. React Native Engineer, Quant Analyst, Security Engineer..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-400" />
          ) : (
            <div className="flex flex-wrap gap-2">
              {quickRoles.map((r) => (
                <button key={r} onClick={() => setRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${role === r ? "bg-violet-100 text-violet-700 border-violet-300" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:bg-violet-50"}`}>
                  {r}
                </button>
              ))}
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button onClick={handleGenerate} disabled={loading || (useCustomRole && !customRole.trim())}
            className="mt-5 w-full py-3.5 bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-violet-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-violet-200">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating questions…</> : <><Sparkles className="w-4 h-4" />Generate Interview Questions</>}
          </button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="shimmer h-3 w-20 rounded mb-3" />
                <div className="shimmer h-4 w-3/4 rounded mb-2" />
                <div className="shimmer h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{effectiveRole} · {level} · {companyType}</h2>
                <p className="text-sm text-slate-500">{totalQuestions} questions generated</p>
              </div>
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-200 transition-colors no-print">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>

            {result.interviewTips?.length > 0 && (
              <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-200 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-5 h-5 text-violet-600" />
                  <h3 className="font-bold text-slate-900">Interview Strategy</h3>
                </div>
                <ul className="space-y-2">
                  {result.interviewTips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="text-violet-500 font-bold mt-0.5">✦</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.topicsToRevise?.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-slate-900">Topics to Revise</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.topicsToRevise.map((t, i) => (
                    <span key={i} className={`tag border border-transparent ${priorityStyle[t.priority] || "bg-slate-100 text-slate-600"}`}>
                      {t.topic} <span className="opacity-60 font-normal">· {t.priority}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center justify-center">T</span>
                <h2 className="text-lg font-bold text-slate-900">Technical Questions</h2>
                <span className="tag bg-violet-100 text-violet-700">{result.technical.length}</span>
              </div>
              <div className="space-y-8">
                {Object.entries(topicGroups).map(([topic, questions]) => (
                  <div key={topic}>
                    <div className="flex items-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-slate-400" />
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{topic}</h3>
                    </div>
                    <div className="space-y-3">
                      {questions.map((q, i) => (
                        <AccordionItem key={i} question={q.question} answer={q.answer} tag={q.difficulty} tip={q.tip} index={i} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center">H</span>
                <h2 className="text-lg font-bold text-slate-900">Behavioral / HR Questions</h2>
                <span className="tag bg-blue-100 text-blue-700">{result.hr.length}</span>
              </div>
              <div className="space-y-3">
                {result.hr.map((q, i) => (
                  <AccordionItem key={i} question={q.question} answer={q.answer} starExample={q.starExample} index={i} />
                ))}
              </div>
            </div>

            <button onClick={handleGenerate}
              className="w-full py-3 border-2 border-dashed border-violet-200 text-violet-600 font-semibold rounded-xl hover:bg-violet-50 hover:border-violet-400 transition-all flex items-center justify-center gap-2 text-sm">
              <Sparkles className="w-4 h-4" /> Generate New Set of Questions
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function InterviewPrep() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    }>
      <InterviewPrepInner />
    </Suspense>
  );
}
