"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp, Loader2, CheckCircle, Lightbulb, Sparkles,
  Building2, Award, MapPin, ArrowRight, Globe
} from "lucide-react";
import { getSalaryInsights, SalaryResult } from "@/lib/ai";

const roles = [
  "Software Engineer", "Data Scientist", "Data Analyst", "Business Analyst",
  "Product Manager", "ML Engineer", "DevOps Engineer", "Full Stack Developer",
  "Cloud Engineer", "UX Designer", "Cybersecurity Engineer", "Mobile Developer"
];
const countries = [
  "Sri Lanka", "United States", "United Kingdom", "Australia",
  "Germany", "Canada", "India", "Singapore", "UAE", "Netherlands", "Sweden"
];

type ViewMode = "annual" | "monthly" | "daily";

function formatSalary(n: number, currency: string, mode: ViewMode = "annual"): string {
  const divisors = { annual: 1, monthly: 12, daily: 260 };
  const val = n / divisors[mode];
  const suffix = { annual: "/yr", monthly: "/mo", daily: "/day" };
  if (currency === "LKR") {
    return val >= 1_000_000 ? `LKR ${(val/1_000_000).toFixed(1)}M${suffix[mode]}`
      : `LKR ${(val/1_000).toFixed(0)}K${suffix[mode]}`;
  }
  return val >= 1_000 ? `${currency === "USD" ? "$" : currency + " "}${(val/1_000).toFixed(0)}K${suffix[mode]}`
    : `${currency === "USD" ? "$" : currency + " "}${val.toFixed(0)}${suffix[mode]}`;
}

const outlookConfig = {
  Growing: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", icon: "🟢" },
  Stable: { color: "bg-amber-100 text-amber-700 border-amber-200", dot: "bg-amber-500", icon: "🟡" },
  Declining: { color: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500", icon: "🔴" },
};

const levelConfig = [
  { key: "entry", label: "Entry Level", bar: "bg-blue-500", pct: 35, color: "border-blue-300 bg-blue-50" },
  { key: "mid", label: "Mid Level", bar: "bg-violet-500", pct: 65, color: "border-violet-300 bg-violet-50" },
  { key: "senior", label: "Senior Level", bar: "bg-emerald-500", pct: 100, color: "border-emerald-300 bg-emerald-50" },
];

export default function SalaryGuide() {
  const [role, setRole] = useState("Data Scientist");
  const [country, setCountry] = useState("Sri Lanka");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SalaryResult | null>(null);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("annual");

  async function handleSearch() {
    setError(""); setLoading(true);
    try {
      const data = await getSalaryInsights(role, country);
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch salary data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const outlook = result?.marketOutlook?.trend
    ? outlookConfig[result.marketOutlook.trend] || outlookConfig.Stable
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="hero-gradient border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900">Salary Guide</h1>
                <p className="text-slate-500 text-sm">Powered by Gemini 2.0 Flash · Real market data</p>
              </div>
            </div>
            <p className="text-slate-600 max-w-2xl">
              Discover accurate salary ranges, market trends, career progression timelines, and the certifications that unlock higher pay — tailored to your role and country.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Config */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> Job Role
              </label>
              <select value={role} onChange={(e) => setRole(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4" /> Country
              </label>
              <select value={country} onChange={(e) => setCountry(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
                {countries.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="mb-3 text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button onClick={handleSearch} disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-200">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Fetching data…</> : <><Sparkles className="w-4 h-4" />Get Salary Insights</>}
          </button>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6">
                <div className="shimmer h-4 w-40 rounded mb-4" />
                <div className="space-y-2">{[1,2,3].map(j => <div key={j} className="shimmer h-3 rounded" style={{width:`${90-j*15}%`}} />)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {/* Header + Market Outlook */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-extrabold mb-1">{role}</h2>
                    <p className="text-slate-400 flex items-center gap-1.5"><Globe className="w-4 h-4" />{country}</p>
                  </div>
                  {outlook && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold ${outlook.color}`}>
                      <span className={`w-2 h-2 rounded-full ${outlook.dot}`} />
                      Market: {result.marketOutlook.trend}
                    </div>
                  )}
                </div>
                {result.marketOutlook?.reason && (
                  <p className="mt-4 text-slate-300 text-sm leading-relaxed border-t border-slate-700 pt-4">{result.marketOutlook.reason}</p>
                )}
              </motion.div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 w-fit">
                {(["annual", "monthly", "daily"] as ViewMode[]).map((m) => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${viewMode === m ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"}`}>
                    {m}
                  </button>
                ))}
              </div>

              {/* Salary bars */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">Salary Ranges</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {levelConfig.map((lv, idx) => {
                    const range = result[lv.key as keyof SalaryResult] as { min: number; max: number } | undefined;
                    const maxSalary = result.senior?.max || 1;
                    const minPct = range ? (range.min / maxSalary) * 100 : 0;
                    const maxPct = range ? (range.max / maxSalary) * 100 : lv.pct;
                    return (
                      <motion.div key={lv.key} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + idx * 0.08 }}
                        className={`px-6 py-5 border-l-4 ${lv.color}`}>
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-slate-800 text-sm">{lv.label}</span>
                          <span className="font-bold text-slate-900 text-base">
                            {range ? `${formatSalary(range.min, result.currency, viewMode)} – ${formatSalary(range.max, result.currency, viewMode)}` : "—"}
                          </span>
                        </div>
                        <div className="h-2.5 bg-white rounded-full overflow-hidden border border-slate-200">
                          <motion.div className={`h-full ${lv.bar} rounded-full bar-animate`}
                            style={{ width: `${maxPct}%` }} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Remote premium */}
              {result.remoteMultiplier && result.remoteMultiplier > 1 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 rounded-2xl p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Remote Work Premium</p>
                    <p className="text-slate-600 text-sm">Working remotely for international companies can increase your salary by <strong className="text-blue-700">{Math.round((result.remoteMultiplier - 1) * 100)}%</strong> compared to local market rates.</p>
                  </div>
                </motion.div>
              )}

              {/* Career progression timeline */}
              {result.careerPath?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6">
                  <h3 className="font-bold text-slate-900 mb-6">Career Progression</h3>
                  <div className="relative">
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200" />
                    <div className="grid grid-cols-4 gap-2">
                      {result.careerPath.map((stage, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
                          className="relative text-center">
                          <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm z-10 relative ${
                            i === 0 ? "bg-blue-500" : i === 1 ? "bg-violet-500" : i === 2 ? "bg-emerald-500" : "bg-amber-500"
                          }`}>{i + 1}</div>
                          <p className="text-xs font-bold text-slate-900 leading-tight mb-1">{stage.title}</p>
                          <p className="text-xs text-slate-500 mb-1">{stage.yearsExp}</p>
                          <p className="text-xs font-semibold text-emerald-600">{stage.avgSalary}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Skills + Tips */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="grid md:grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-bold text-slate-900">Required Skills</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.requiredSkills.map((s, i) => (
                      <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-200">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <h3 className="font-bold text-slate-900">Career Growth Tips</h3>
                  </div>
                  <ul className="space-y-2">
                    {result.careerTips.map((tip, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-amber-500 font-bold mt-0.5">→</span>{tip}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>

              {/* Top companies */}
              {result.topCompanies?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-blue-500" />
                    <h3 className="font-bold text-slate-900">Top Hiring Companies in {country}</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.topCompanies.map((c, i) => (
                      <span key={i} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm rounded-xl border border-slate-200 font-medium">{c}</span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Certifications */}
              {result.certifications?.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-violet-500" />
                    <h3 className="font-bold text-slate-900">High-Value Certifications</h3>
                  </div>
                  <div className="space-y-2">
                    {result.certifications.map((cert, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                        <span className="text-sm font-medium text-slate-800">{cert.name}</span>
                        <span className="text-sm font-bold text-emerald-600">{cert.salaryBump}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* CTA */}
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-6 flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Ready to land that {role} role?</p>
                  <p className="text-emerald-300 text-sm">Practice with AI-generated interview questions.</p>
                </div>
                <a href={`/interview-prep?role=${encodeURIComponent(role)}`}
                  className="px-5 py-2.5 bg-white text-emerald-900 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2 text-sm">
                  Prepare for Interview <ArrowRight className="w-4 h-4" />
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
