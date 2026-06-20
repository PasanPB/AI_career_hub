"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, ArrowRight, RotateCcw, CheckCircle, Upload, Sparkles,
  Loader2, FileText, X, TrendingUp, MessageSquare, Trophy
} from "lucide-react";
import Link from "next/link";
import { generateCareerRecommendation, getCvFromSession, QuizResult, CareerMatch } from "@/lib/ai";

const questions = [
  { id: 1, text: "Which activity would you enjoy most on a weekend?",
    options: ["Building a small app or website","Analyzing data trends in a spreadsheet","Reading about AI and experimenting with models","Writing a report on business performance"] },
  { id: 2, text: "Which subject did you enjoy most in school?",
    options: ["Mathematics / Statistics","Computer Science / Programming","Economics / Business Studies","Science / Physics"] },
  { id: 3, text: "How do you prefer to solve a problem?",
    options: ["Write code to automate it","Build a statistical model","Create dashboards and reports","Stakeholder meetings and process redesign"] },
  { id: 4, text: "Which tool would you most like to master?",
    options: ["Python / React / Docker","TensorFlow / PyTorch / Scikit-learn","Power BI / Tableau / SQL","Jira / Confluence / Excel"] },
  { id: 5, text: "Which best describes your communication style?",
    options: ["I prefer working independently on technical tasks","I like explaining complex findings simply","I enjoy running workshops and presentations","Mix of both technical and communication"] },
  { id: 6, text: "What type of project excites you most?",
    options: ["Building a real-time web application","Training an AI model to make predictions","Uncovering trends in customer behavior","Mapping out a company's digital transformation"] },
  { id: 7, text: "How comfortable are you with ambiguity?",
    options: ["Very comfortable — I figure things out as I go","I prefer clear specs and requirements","I define structure myself from raw data","I bridge ambiguity between teams"] },
  { id: 8, text: "Which outcome would give you most satisfaction?",
    options: ["Shipping a product used by millions","A model that accurately predicts outcomes","A dashboard that drives business decisions","A strategy that saves the company money"] },
];

const CONFETTI_COLORS = ["#2563eb","#7c3aed","#059669","#d97706","#e11d48","#0891b2","#ea580c"];

function launchConfetti() {
  const container = document.body;
  for (let i = 0; i < 80; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: ${-10 - Math.random() * 20}px;
      background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      animation-duration: ${2 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.5}s;
    `;
    container.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

function MatchCard({ match, index }: { match: CareerMatch; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);
  const rankColors = ["from-yellow-400 to-amber-500", "from-slate-400 to-slate-500", "from-orange-400 to-orange-500"];
  const rankLabels = ["🥇 Best Match", "🥈 Strong Match", "🥉 Good Match"];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.12 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${match.color || "from-blue-500 to-blue-700"} flex items-center justify-center text-2xl shadow-sm flex-shrink-0`}>
              {match.emoji}
            </div>
            <div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${rankColors[index]} text-white`}>
                {rankLabels[index]}
              </span>
              <h3 className="font-extrabold text-slate-900 text-xl mt-1">{match.title}</h3>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-black text-slate-900">{match.matchScore}<span className="text-lg text-slate-400">%</span></div>
            <p className="text-xs text-slate-500">match</p>
          </div>
        </div>

        {/* Match bar */}
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
          <motion.div className={`h-full bg-gradient-to-r ${match.color || "from-blue-500 to-blue-700"} rounded-full`}
            initial={{ width: 0 }} animate={{ width: `${match.matchScore}%` }} transition={{ delay: index * 0.12 + 0.3, duration: 0.8, ease: "easeOut" }} />
        </div>

        <p className="text-slate-600 text-sm leading-relaxed mb-4">{match.whyItFits}</p>

        <div className="text-sm font-semibold text-emerald-600 mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2">
          💰 {match.salaryRange}
        </div>

        <button onClick={() => setExpanded(!expanded)}
          className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1">
          {expanded ? "Hide details ↑" : "Show details ↓"}
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-slate-100">
            <div className="px-6 py-5 grid md:grid-cols-2 gap-5 bg-slate-50">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Skill Gaps to Address</h4>
                <ul className="space-y-1.5">
                  {match.gapAnalysis?.map((gap, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="text-amber-500 font-bold mt-0.5">△</span>{gap}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Next Steps</h4>
                <ul className="space-y-1.5">
                  {match.nextSteps?.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-slate-700">
                      <span className="text-emerald-500 font-bold mt-0.5">{i+1}.</span>{step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="px-6 py-4 flex gap-3 flex-wrap bg-slate-50 border-t border-slate-100">
              <Link href={`/interview-prep?role=${encodeURIComponent(match.title)}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors">
                <MessageSquare className="w-4 h-4" /> Interview Prep
              </Link>
              <Link href={`/salary-guide?role=${encodeURIComponent(match.title)}`}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                <TrendingUp className="w-4 h-4" /> Salary Guide
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CareerQuiz() {
  const [mode, setMode] = useState<"choose" | "cv" | "quiz">("choose");
  const [cvText, setCvText] = useState("");
  const [cvFileName, setCvFileName] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if CV available from session
  useEffect(() => {
    const saved = getCvFromSession();
    if (saved) {
      setCvText(saved.text);
      setCvFileName(saved.fileName);
    }
  }, []);

  async function extractPdf(file: File) {
    setFileLoading(true); setError("");
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
      setCvText(text); setCvFileName(file.name);
    } catch { setError("Failed to read PDF. Try another file."); }
    finally { setFileLoading(false); }
  }

  async function runCvAnalysis() {
    if (!cvText || cvText.length < 100) { setError("Please upload or paste your CV first."); return; }
    setLoading(true); setError("");
    try {
      const data = await generateCareerRecommendation({}, cvText);
      setResult(data);
      setTimeout(launchConfetti, 300);
    } catch (err: any) { setError(err.message || "Analysis failed. Please try again."); }
    finally { setLoading(false); }
  }

  async function runQuizAnalysis() {
    if (Object.keys(answers).length < questions.length) { setError("Please answer all questions first."); return; }
    setLoading(true); setError("");
    try {
      const data = await generateCareerRecommendation(answers);
      setResult(data);
      setTimeout(launchConfetti, 300);
    } catch (err: any) { setError(err.message || "Analysis failed. Please try again."); }
    finally { setLoading(false); }
  }

  function reset() { setResult(null); setAnswers({}); setError(""); setMode("choose"); }

  const answered = Object.keys(answers).length;
  const progress = (answered / questions.length) * 100;

  // ─── Results screen ────────────────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="hero-gradient border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 py-12 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Your Career Matches</h1>
              {result.summary && <p className="text-slate-600 max-w-xl mx-auto">{result.summary}</p>}
              {result.topStrength && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold text-amber-800">Top Strength: {result.topStrength}</span>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-10 space-y-5">
          {result.matches?.map((match, i) => <MatchCard key={i} match={match} index={i} />)}
          <div className="text-center pt-4">
            <button onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors">
              <RotateCcw className="w-4 h-4" /> Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Mode chooser ──────────────────────────────────────────────────────────
  if (mode === "choose") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="hero-gradient border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 py-12 text-center">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Career Discovery Quiz</h1>
              <p className="text-slate-600">Discover which tech career is your perfect fit.</p>
            </motion.div>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-6">
          {/* CV-based */}
          <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            onClick={() => setMode("cv")}
            className="group text-left bg-white rounded-2xl border-2 border-slate-200 hover:border-orange-400 p-7 transition-all hover:shadow-lg card-hover">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center mb-5 shadow-md shadow-orange-100 group-hover:shadow-orange-200 transition-all">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-extrabold text-slate-900">CV-Based Match</h2>
              <span className="tag bg-orange-100 text-orange-700">Recommended</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Upload your CV and let Gemini AI analyze your actual experience, skills, and background to find your best-fit careers.
            </p>
            {cvText && (
              <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                <CheckCircle className="w-3.5 h-3.5" /> CV loaded: {cvFileName}
              </div>
            )}
            <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold mt-5 group-hover:gap-2 transition-all">
              Get personalized match <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>

          {/* Quiz-based */}
          <motion.button initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            onClick={() => setMode("quiz")}
            className="group text-left bg-white rounded-2xl border-2 border-slate-200 hover:border-violet-400 p-7 transition-all hover:shadow-lg card-hover">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center mb-5 shadow-md shadow-violet-100 group-hover:shadow-violet-200 transition-all">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900 mb-2">Interest Quiz</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Answer 8 questions about your interests, work style, and preferences to discover careers that match your personality.
            </p>
            <div className="flex items-center gap-1 text-violet-500 text-sm font-semibold mt-5 group-hover:gap-2 transition-all">
              Take the quiz <ArrowRight className="w-4 h-4" />
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  // ─── CV mode ───────────────────────────────────────────────────────────────
  if (mode === "cv") {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="hero-gradient border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 py-10">
            <button onClick={() => setMode("choose")} className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1">← Back</button>
            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">CV-Based Career Match</h1>
            <p className="text-slate-600 text-sm">Upload your CV and get AI-powered career recommendations based on your actual experience.</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto px-4 py-8">
          {cvText ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-800">CV Loaded</p>
                  <p className="text-sm text-emerald-600">{cvFileName} · {cvText.length.toLocaleString()} characters</p>
                </div>
              </div>
              <button onClick={() => { setCvText(""); setCvFileName(""); }} className="text-emerald-500 hover:text-emerald-700">
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5 shadow-sm">
              <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                onChange={async (e) => { const f = e.target.files?.[0]; if (f) await extractPdf(f); }} />
              <button onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 hover:border-orange-400 rounded-xl p-8 text-center transition-all hover:bg-orange-50 group">
                <Upload className="w-8 h-8 text-slate-300 group-hover:text-orange-400 mx-auto mb-3 transition-colors" />
                {fileLoading ? <p className="text-slate-500"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Reading PDF…</p>
                  : <p className="font-semibold text-slate-600 group-hover:text-orange-600">Upload your CV (PDF)</p>}
              </button>
              <div className="mt-4 text-center text-sm text-slate-400">or paste text below</div>
              <textarea value={cvText} onChange={(e) => setCvText(e.target.value)}
                placeholder="Paste your CV text here..." rows={6}
                className="mt-3 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
            </div>
          )}
          {error && <p className="mb-4 text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2">{error}</p>}
          <button onClick={runCvAnalysis} disabled={loading || !cvText || cvText.length < 100}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-200">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing your CV…</> : <><Sparkles className="w-4 h-4" />Find My Career Matches</>}
          </button>
        </div>
      </div>
    );
  }

  // ─── Quiz mode ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="hero-gradient border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <button onClick={() => setMode("choose")} className="text-sm text-slate-500 hover:text-slate-700 mb-2 flex items-center gap-1">← Back</button>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-lg font-bold text-slate-900">Career Interest Quiz</h1>
            <span className="text-sm font-semibold text-slate-500">{answered}/{questions.length} answered</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <motion.div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"
              animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {questions.map((q, qi) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qi * 0.05 }}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start gap-3 mb-4">
              <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {qi + 1}
              </span>
              <h3 className="font-semibold text-slate-900 text-base leading-snug">{q.text}</h3>
            </div>
            <div className="space-y-2.5">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <button key={oi} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center gap-3 ${
                      selected ? "border-orange-400 bg-orange-50 text-orange-800" : "border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50/40"}`}>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selected ? "border-orange-500 bg-orange-500" : "border-slate-300"}`}>
                      {selected && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        <button onClick={runQuizAnalysis} disabled={answered < questions.length || loading}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-200 text-base">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Analyzing your answers…</>
            : answered < questions.length ? `Answer all questions (${questions.length - answered} remaining)`
            : <><Sparkles className="w-5 h-5" />See My Career Matches →</>}
        </button>
      </div>
    </div>
  );
}
