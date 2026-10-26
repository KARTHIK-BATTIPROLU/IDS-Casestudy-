import Link from "next/link";
import {
  BarChart3,
  UploadCloud,
  Clock,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Code2,
  Cpu,
  Layers,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 sm:pt-24 sm:pb-16 border-b border-spotify-border bg-gradient-to-b from-spotify-dark to-spotify-black">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 rounded-full border border-spotify-green/40 bg-spotify-green/10 px-3.5 py-1 text-xs font-mono text-spotify-green">
              <span className="h-2 w-2 rounded-full bg-spotify-green animate-pulse"></span>
              <span>Empirical Data Science in R 4.6</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white">
              Spotify Listener Behaviour &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-spotify-green to-emerald-400">
                Release-Window Advisor
              </span>
            </h1>

            <p className="text-base sm:text-lg text-spotify-subtext leading-relaxed">
              Moving beyond industry folklore. We analyze real timestamped listening distributions,
              chart density, and your historical catalog data to uncover optimal, data-backed release windows.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full sm:w-auto">
              <Link
                href="/upload"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-lg bg-spotify-green px-6 py-3.5 text-sm font-bold text-black hover:bg-spotify-lightgreen transition shadow-lg shadow-spotify-green/20"
              >
                <UploadCloud className="h-4 w-4" />
                <span>Analyze Your Catalog</span>
              </Link>
              <Link
                href="/research"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-lg bg-spotify-card border border-spotify-border px-6 py-3.5 text-sm font-semibold text-white hover:bg-spotify-cardhover transition"
              >
                <BarChart3 className="h-4 w-4 text-spotify-green" />
                <span>Explore Research Dashboard</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-spotify-subtext font-mono">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-spotify-green" />
                <span>500K+ Timestamped Events</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-spotify-green" />
                <span>ANOVA & Age-Adjusted OLS</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <ShieldCheck className="h-4 w-4 text-spotify-green" />
                <span>Zero-Storage In-Memory R API</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Insights / The Friday Paradox */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            The Empirical Findings: Challenging Industry Folklore
          </h2>
          <p className="text-xs sm:text-sm text-spotify-subtext mt-2">
            Descriptive statistics and regression modeling on real Spotify & Last.fm corpora.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4 hover:border-spotify-green/40 transition">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">The Friday Paradox</h3>
            <p className="text-xs text-spotify-subtext leading-relaxed">
              <strong>55.25%</strong> of all commercial tracks drop on Friday, driven by editorial playlist cycles like <em>New Music Friday</em>.
              However, our OLS regression reveals that once catalog age and playlist inclusions are controlled, the Friday coefficient is statistically insignificant (<em>p = 0.917</em>).
            </p>
            <div className="pt-2 border-t border-spotify-border/60 text-[11px] font-mono text-amber-400">
              Result: Intense Release Congestion
            </div>
          </div>

          <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4 hover:border-spotify-green/40 transition">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Real-Time Listening Velocity</h3>
            <p className="text-xs text-spotify-subtext leading-relaxed">
              Global listener activity peaks during <strong>mid-week afternoons (14:00 - 18:00 UTC)</strong>,
              where streaming volume is exceptionally high while new release competition drops by up to <strong>75%</strong> compared to Friday midnight.
            </p>
            <div className="pt-2 border-t border-spotify-border/60 text-[11px] font-mono text-emerald-400">
              Result: Uncongested Attention Windows
            </div>
          </div>

          <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4 hover:border-spotify-green/40 transition">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Code2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Honest Statistical Heuristics</h3>
            <p className="text-xs text-spotify-subtext leading-relaxed">
              No black-box promises or fabricated neural networks. When catalog sample sizes are small (<em>N &lt; 5</em>), statistical ranking is withheld to protect artists from specious inferences. 
              Parametric 95% CIs and ANOVA are applied only when <em>N &ge; 20</em>.
            </p>
            <div className="pt-2 border-t border-spotify-border/60 text-[11px] font-mono text-blue-400">
              Result: Transparent Decision Support
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-spotify-border bg-spotify-dark p-8 md:p-12 shadow-2xl">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-spotify-green font-semibold">
              End-to-End Analysis Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">
              How the Release Advisor Computes Recommendations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="space-y-3 p-4 rounded-xl bg-spotify-card border border-spotify-border">
              <div className="h-8 w-8 rounded-full bg-spotify-green text-black font-bold flex items-center justify-center text-xs">
                1
              </div>
              <h4 className="text-sm font-bold text-white">Upload Catalog CSV</h4>
              <p className="text-xs text-spotify-subtext leading-relaxed">
                Provide historical releases with dates and stream totals. Or test instantly with our pre-built 22-track template.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-spotify-card border border-spotify-border">
              <div className="h-8 w-8 rounded-full bg-spotify-green text-black font-bold flex items-center justify-center text-xs">
                2
              </div>
              <h4 className="text-sm font-bold text-white">In-Memory R Engine</h4>
              <p className="text-xs text-spotify-subtext leading-relaxed">
                R Plumber API parses dates across flexible formats, checks data hygiene, and enforces sample size gates.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-spotify-card border border-spotify-border">
              <div className="h-8 w-8 rounded-full bg-spotify-green text-black font-bold flex items-center justify-center text-xs">
                3
              </div>
              <h4 className="text-sm font-bold text-white">ANOVA & 95% CIs</h4>
              <p className="text-xs text-spotify-subtext leading-relaxed">
                Computes Student&apos;s t-distribution confidence intervals and Kruskal-Wallis variance tests across weekdays.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-spotify-card border border-spotify-border">
              <div className="h-8 w-8 rounded-full bg-spotify-green text-black font-bold flex items-center justify-center text-xs">
                4
              </div>
              <h4 className="text-sm font-bold text-white">Ranked Advice & Export</h4>
              <p className="text-xs text-spotify-subtext leading-relaxed">
                Delivers ranked candidate windows with transparent component scores and one-click CSV export.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/upload"
              className="inline-flex items-center space-x-2 text-sm font-bold text-spotify-green hover:text-spotify-lightgreen transition"
            >
              <span>Launch Custom Catalog Analysis</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Architecture & Engineering Standards */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-spotify-green font-semibold">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Strict Monorepo Engineering
            </h2>
            <p className="text-xs sm:text-sm text-spotify-subtext leading-relaxed">
              Designed according to modern data product standards. The user-facing website communicates exclusively
              via server-side proxies to a containerized R Plumber analytical microservice.
            </p>
            <div className="space-y-2.5 text-xs text-white/90">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-spotify-green shrink-0" />
                <span><strong>R Plumber Microservice:</strong> Packaged in Docker for Render deployment.</span>
              </div>
              <div className="flex items-center space-x-2">
                <Layers className="h-4 w-4 text-spotify-green shrink-0" />
                <span><strong>Next.js 14 App Router:</strong> Server components, TypeScript & Tailwind CSS for Vercel.</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-spotify-green shrink-0" />
                <span><strong>Zero Row Persistence:</strong> Uploaded CSV rows remain ephemeral in RAM.</span>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/methodology"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-spotify-subtext hover:text-white transition"
              >
                <span>Read Full Methodology & Mathematical Formulas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 font-mono text-xs text-spotify-subtext space-y-2 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-spotify-border text-white">
              <span>Repository Monorepo Layout</span>
              <span className="text-spotify-green text-[10px]">main branch</span>
            </div>
            <p className="text-emerald-400">├── apps/web/           # Next.js 14 App Router + TypeScript</p>
            <p className="text-emerald-400">├── services/r-api/     # R + Plumber API + Dockerfile</p>
            <p className="text-emerald-400">├── analysis/           # Reproducible R data science scripts</p>
            <p className="text-emerald-400">├── data/raw/           # Kaggle & Last.fm source datasets</p>
            <p className="text-emerald-400">├── data/processed/     # Reproducibly generated summaries</p>
            <p className="text-emerald-400">├── docs/               # Architecture, dictionary, plan</p>
            <p className="text-emerald-400">└── reports/            # Academic case study report & slides</p>
          </div>
        </div>
      </section>
    </div>
  );
}
