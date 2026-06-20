import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "AI Career Helper Hub – CV Checker, Interview Prep & Salary Guide",
  description: "Get instant AI-powered CV feedback, interview questions, salary insights, and career guidance. Free tools for students and job seekers.",
  keywords: "CV checker, interview prep, salary guide, career quiz, AI career help, job seeker tools",
  openGraph: {
    title: "AI Career Helper Hub",
    description: "AI-powered career tools for students and job seekers",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google AdSense verification */}
        <meta name="google-adsense-account" content="ca-pub-3566663517868189" />
      </head>
      <body className="font-sans">
        <Navbar />
        <main>{children}</main>
        <footer className="bg-slate-900 text-slate-400 py-10 mt-20">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
            <div>
              <div className="text-white font-semibold mb-3">AI Career Hub</div>
              <p className="text-xs leading-relaxed">Free AI-powered career tools for students and job seekers worldwide.</p>
            </div>
            <div>
              <div className="text-white font-semibold mb-3">Tools</div>
              <ul className="space-y-2">
                <li><a href="/cv-checker" className="hover:text-white transition-colors">CV Checker</a></li>
                <li><a href="/interview-prep" className="hover:text-white transition-colors">Interview Prep</a></li>
                <li><a href="/salary-guide" className="hover:text-white transition-colors">Salary Guide</a></li>
                <li><a href="/career-quiz" className="hover:text-white transition-colors">Career Quiz</a></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold mb-3">Company</div>
              <ul className="space-y-2">
                <li><a href="/about" className="hover:text-white transition-colors">About</a></li>
                <li><a href="/blog" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <div className="text-white font-semibold mb-3">Legal</div>
              <ul className="space-y-2">
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-slate-800 text-xs text-center">
            © {new Date().getFullYear()} AI Career Helper Hub. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
