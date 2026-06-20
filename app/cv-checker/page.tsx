"use client";
import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Upload, CheckCircle, AlertCircle, TrendingUp, Zap,
  BookOpen, Loader2, X, Sparkles, Target, ChevronRight, Brain
} from "lucide-react";
import { analyzeCv, saveCvToSession, CvResult } from "@/lib/ai";
import Link from "next/link";

const difficultyColors: Record<string, string> = {
  High: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-100 text-amber-700 border-amber-200",
};

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const r = 28; const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 72 72" className="w-16 h-16 -rotate-90">
          <circle cx="36" cy="36" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
          <circle cx="36" cy="36" r={r} fill="none" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`} className={`${color} score-ring-animate`} />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-slate-800">{score}</span>
        </div>
      </div>
      <span className="text-xs text-slate-500 font-medium">{label}</span>
    </div>
  );
}

export default function CvChecker() {
  const [cvText, setCvText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CvResult | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scoreColor = (s: number) =>
    s >= 80 ? "stroke-emerald-500" : s >= 60 ? "stroke-amber-500" : "stroke-red-500";
  const scoreTextColor = (s: number) =>
    s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-red-500";
  const scoreBg = (s: number) =>
    s >= 80 ? "from-emerald-500 to-teal-600" : s >= 60 ? "from-amber-500 to-orange-500" : "from-red-500 to-rose-600";

  async function extractAndAnalyzePdf(file: File) {
    setError(""); setFileName(file.name); setFileLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      let pdfjsLib: any = (window as any).pdfjsLib;
      if (!pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/pdfjs-dist@3.8.162/build/pdf.min.js";
          s.onload = () => resolve(); s.onerror = reject;
          document.head.appendChild(s);
        });
        pdfjsLib = (window as any).pdfjsLib;
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://unpkg.com/pdfjs-dist@3.8.162/build/pdf.worker.min.js";
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((it: any) => it.str || "").join(" ") + "\n\n";
      }
      setCvText(text);
      if (text.length >= 100) await runAnalysis(text);
    } catch {
      setError("Failed to extract text from PDF. Try another file or paste text directly.");
    } finally {
      setFileLoading(false);
    }
  }

  async function runAnalysis(text: string) {
    const t = text || cvText;
    if (!t.trim() || t.length < 100) { setError("Please provide at least 100 characters of CV content."); return; }
    setError(""); setLoading(true);
    try {
      const data = await analyzeCv(t);
      setResult(data);
      saveCvToSession(t, fileName || "Pasted CV");
    } catch (err: any) {
      setError(err.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type === "application/pdf") await extractAndAnalyzePdf(file);
    else setError("Please drop a PDF file.");
  }, []);

  const score = result?.score ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="hero-gradient border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">AI CV Analyzer</h1>
                <p className="text-slate-500 text-sm">Powered by Gemini 2.0 Flash</p>
              </div>
            </div>
            <p className="text-slate-600 max-w-2xl">
              Upload your CV for an instant, personalized AI analysis — score breakdown, ATS tips, skill gaps, and role recommendations tailored to <em>your specific experience</em>.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Upload Zone */}
        {!result && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div
              className={`drop-zone p-8 text-center cursor-pointer mb-6 ${dragging ? "dragging" : ""} ${fileName ? "has-file" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) await extractAndAnalyzePdf(f); }} />
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto mb-4">
                {fileLoading ? <Loader2 className="w-7 h-7 text-blue-500 animate-spin" /> : <Upload className="w-7 h-7 text-blue-500" />}
              </div>
              {fileName ? (
                <div>
                  <p className="font-semibold text-emerald-700 mb-1">✓ {fileName}</p>
                  <p className="text-sm text-slate-500">Click to change file</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-slate-700 mb-1">Drag & drop your PDF CV here</p>
                  <p className="text-sm text-slate-500">or click to browse files</p>
                </div>
              )}
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-50 px-3 text-sm text-slate-400">or paste CV text below</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <label className="block text-sm font-semibold text-slate-700 mb-3">CV / Resume Text</label>
              <textarea
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your full CV here — work experience, education, skills, projects..."
                rows={10}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">{cvText.length} characters · Min 100</span>
                {cvText.length > 0 && (
                  <button onClick={() => { setCvText(""); setFileName(""); }} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
              {error && <p className="mt-2 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button
                onClick={() => runAnalysis(cvText)}
                disabled={loading || cvText.length < 100}
                className="mt-4 w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing your CV…</> : <><Sparkles className="w-4 h-4" /> Analyze My CV</>}
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-4 mt-4">
            {["Score", "Strengths", "Improvements"].map((l) => (
              <div key={l} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="shimmer h-4 w-32 rounded mb-4" />
                <div className="space-y-2">
                  {[1,2,3].map(i => <div key={i} className="shimmer h-3 rounded" style={{ width: `${90-i*15}%` }} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Reset button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Analysis complete for {fileName || "your CV"}
                </div>
                <button
                  onClick={() => { setResult(null); setCvText(""); setFileName(""); setError(""); }}
                  className="text-sm text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <X className="w-3.5 h-3.5" /> Analyze Another CV
                </button>
              </div>

              {/* Detected Role + Level */}
              <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.05 }}
                className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-48">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Detected Profile</p>
                  <h2 className="text-2xl font-extrabold">{result.detectedRole}</h2>
                  <span className="inline-flex items-center gap-1 mt-2 px-3 py-0.5 rounded-full bg-white/10 text-sm font-medium">
                    {result.detectedLevel}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Overall Score</p>
                  <span className={`text-5xl font-black ${score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400"}`}>
                    {score}
                  </span>
                  <span className="text-slate-400 text-lg">/100</span>
                </div>
              </motion.div>

              {/* Summary */}
              <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.1 }}
                className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <p className="text-slate-700 leading-relaxed text-sm">{result.summary}</p>
              </motion.div>

              {/* Sub-scores */}
              {result.subScores && (
                <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.15 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-5">Score Breakdown</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <ScoreRing score={result.subScores.structure} label="Structure" color="stroke-blue-500" />
                    <ScoreRing score={result.subScores.content} label="Content" color="stroke-violet-500" />
                    <ScoreRing score={result.subScores.ats} label="ATS" color="stroke-emerald-500" />
                    <ScoreRing score={result.subScores.impact} label="Impact" color="stroke-amber-500" />
                  </div>
                </motion.div>
              )}

              {/* Strengths + Weaknesses */}
              <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2 }}
                className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-900">Strengths</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">{i+1}</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-900">Areas to Improve</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">!</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Action Plan */}
              <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.25 }}
                className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-slate-900">Action Plan</h3>
                </div>
                <div className="space-y-3">
                  {result.improvements.map((imp, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
                      <p className="text-sm text-slate-700">{imp}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* ATS + Missing skills */}
              <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3 }}
                className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-5 h-5 text-violet-500" />
                    <h3 className="font-bold text-slate-900">ATS Optimization</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.atsOptimization.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-violet-500 font-bold mt-0.5">→</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-orange-500" />
                    <h3 className="font-bold text-slate-900">Skills to Add</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-200">{skill}</span>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Keyword cloud */}
              {result.topKeywords?.length > 0 && (
                <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.35 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-4">Keywords Detected in Your CV</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.topKeywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-700 text-sm rounded-full border border-slate-200 font-medium">{kw}</span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Recommended Roles */}
              {result.recommendedRoles?.length > 0 && (
                <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.4 }}>
                  <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-violet-500" /> Roles You're Suited For
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {result.recommendedRoles.map((r, i) => (
                      <Link key={i} href={`/interview-prep?role=${encodeURIComponent(r.role)}`}
                        className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-violet-300 hover:shadow-md transition-all group card-hover">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`tag border ${difficultyColors[r.match] || "bg-slate-100 text-slate-600 border-slate-200"}`}>{r.match} Match</span>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 transition-colors" />
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-1">{r.role}</h4>
                        <p className="text-xs text-slate-500">{r.reason}</p>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.45 }}
                className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Ready to prepare for your interview?</p>
                  <p className="text-slate-400 text-sm">Use your CV analysis to get role-specific questions.</p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Link href={`/interview-prep?role=${encodeURIComponent(result.detectedRole)}&level=${encodeURIComponent(result.detectedLevel)}`}
                    className="px-5 py-2.5 bg-white text-slate-900 font-semibold rounded-xl hover:bg-slate-100 transition-colors flex items-center gap-2 text-sm">
                    Interview Prep <ChevronRight className="w-4 h-4" />
                  </Link>
                  <Link href="/career-quiz"
                    className="px-5 py-2.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors flex items-center gap-2 text-sm">
                    Career Quiz <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
