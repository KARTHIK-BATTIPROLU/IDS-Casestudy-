import Link from "next/link";
import { ShieldCheck, Database, Award } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-spotify-border bg-spotify-dark py-12 text-sm text-spotify-subtext">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-base font-semibold text-white">
              Spotify Listener Behaviour Analysis & Optimal Release-Window Advisor
            </h3>
            <p className="text-xs leading-relaxed max-w-md">
              A reproducible data science application investigating empirical streaming distributions,
              industry release congestion, and optimal release timing. Computational models, ANOVA,
              hypothesis tests, and confidence intervals are computed using R.
            </p>
            <div className="flex items-center space-x-2 text-xs text-spotify-green">
              <ShieldCheck className="h-4 w-4" />
              <span>Zero-Storage Guarantee: Uploaded catalog data is processed in-memory and never stored.</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/research" className="hover:text-white transition">Research Dashboard</Link></li>
              <li><Link href="/genre" className="hover:text-white transition">Genre Explorer</Link></li>
              <li><Link href="/upload" className="hover:text-white transition">Analyze Your Data</Link></li>
              <li><Link href="/advisor" className="hover:text-white transition">Release Advisor</Link></li>
              <li><Link href="/methodology" className="hover:text-white transition">Methodology & Formulas</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Academic Context</h4>
            <p className="text-xs mb-2">
              Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad
            </p>
            <p className="text-xs text-spotify-subtext mb-2">
              Dept of Artificial Intelligence & Data Science
            </p>
            <p className="text-xs text-spotify-subtext">
              Lead: Karthik Battiprolu (ugs24304_aid.battiprolu@cbit.org.in)
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-spotify-border/50 flex flex-col sm:flex-row items-center justify-between text-xs">
          <p>© 2026 Spotify Release Advisor. Open-source under MIT License.</p>
          <p className="mt-2 sm:mt-0 font-mono">
            R 4.6.1 | Next.js 14 App Router | Plumber REST API
          </p>
        </div>
      </div>
    </footer>
  );
}
