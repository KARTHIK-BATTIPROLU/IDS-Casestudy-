import { BookOpen, Layers, ShieldCheck, Database, Award, ExternalLink } from "lucide-react";

export default function MethodologyPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-spotify-border pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-spotify-green">
          <BookOpen className="h-4 w-4" />
          <span>Scientific Documentation & Mathematical Formulations</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Methodology & Statistical Foundations
        </h1>
        <p className="text-sm text-spotify-subtext max-w-3xl leading-relaxed">
          Detailed breakdown of our research hypotheses, data science pipeline, statistical formulas,
          sample size gating policies, and academic citations.
        </p>
      </div>

      {/* 1. Problem Statement & Hypotheses */}
      <section className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">1. Problem Statement & Core Hypotheses</h2>
        <div className="space-y-3 text-xs text-spotify-subtext leading-relaxed">
          <p>
            In the global music recording industry, releasing tracks on Friday at 00:00 UTC has become the dominant universal standard.
            This schedule was established in 2015 by the International Federation of the Phonographic Industry (IFPI) primarily to coordinate
            global sales charts (e.g., Billboard, Official Charts Company) and weekly editorial playlist schedules (such as Spotify&apos;s <em>New Music Friday</em>).
          </p>
          <p>
            However, this collective behavior causes extreme release congestion: over <strong>55% of all new releases drop concurrently</strong> on Friday.
            For emerging and independent artists without guaranteed editorial pitching or algorithmic priority, this congestion leads to rapid chart displacement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-spotify-card border border-spotify-border space-y-2 text-xs">
            <h4 className="font-bold text-white">Hypothesis 1 (Listening Activity vs. Release Drop)</h4>
            <p className="text-spotify-subtext">
              Real-time listener consumption is not concentrated exclusively on Friday; listener streaming activity peaks during mid-week daytime hours across major timezones.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-spotify-card border border-spotify-border space-y-2 text-xs">
            <h4 className="font-bold text-white">Hypothesis 2 (Editorial Confounding)</h4>
            <p className="text-spotify-subtext">
              The apparent historical stream superiority of Friday releases is mediated by editorial playlist inclusion and catalog age, rather than an inherent day-of-week demand advantage.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Mathematical Formulation */}
      <section className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-6">
        <h2 className="text-xl font-bold text-white">2. Mathematical Formulation</h2>

        {/* Heuristic Candidate Score */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-spotify-green uppercase tracking-wider font-mono">
            Release-Window Heuristic Score
          </h3>
          <div className="p-4 rounded-lg bg-spotify-card font-mono text-xs text-white overflow-x-auto">
            Score(h, d) = [ w_activity &middot; S_activity(h, d) + w_perf &middot; S_perf(d) - w_congestion &middot; C(h, d) ] &middot; &theta;(N)
          </div>
          <div className="text-xs text-spotify-subtext space-y-1.5 leading-relaxed">
            <p>Where:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>S_activity(h, d):</strong> Normalized empirical listening share (0-100) observed in hour <em>h</em> of weekday <em>d</em>.</li>
              <li><strong>S_perf(d):</strong> Normalized historical median streams (0-100) achieved on weekday <em>d</em>.</li>
              <li><strong>C(h, d):</strong> Release congestion penalty (0-100), reaching 100 at Friday 00:00-05:00 UTC and scaling down to 15 for off-peak days.</li>
              <li><strong>&theta;(N):</strong> Sample size uncertainty discount factor (&theta; = 1.0 for N &ge; 20; &theta; = 0.85 for 5 &le; N &lt; 20).</li>
            </ul>
          </div>
        </div>

        {/* Parametric Confidence Intervals */}
        <div className="space-y-3 pt-4 border-t border-spotify-border/60">
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider font-mono">
            Parametric 95% Confidence Intervals (Student&apos;s t-distribution)
          </h3>
          <div className="p-4 rounded-lg bg-spotify-card font-mono text-xs text-white overflow-x-auto">
            CI_95% = x&#772; &plusmn; t_(0.975, n-1) &middot; ( s / &radic;n )
          </div>
          <p className="text-xs text-spotify-subtext">
            For each release weekday with sample size n &ge; 2, confidence intervals are constructed around the sample mean x&#772; using sample standard deviation s and degrees of freedom df = n - 1.
          </p>
        </div>

        {/* Multiple OLS Regression */}
        <div className="space-y-3 pt-4 border-t border-spotify-border/60">
          <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider font-mono">
            Confounder-Adjusted Multiple OLS Regression
          </h3>
          <div className="p-4 rounded-lg bg-spotify-card font-mono text-xs text-white overflow-x-auto">
            log(streams_i) = &beta;_0 + &sum;_(k) &beta;_k &middot; &#x1D7D9;(weekday_i = k) + &gamma;_1 &middot; track_age_days_i + &gamma;_2 &middot; playlists_i + &epsilon;_i
          </div>
          <p className="text-xs text-spotify-subtext">
            Log-transforming cumulative streams normalizes the heavy right skew. Controlling for track catalog age in days and playlist inclusion allows evaluating the true independent marginal effect &beta;_k of each release day.
          </p>
        </div>
      </section>

      {/* 3. Sample Size Gating Policy */}
      <section className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5 text-spotify-green" />
          <span>3. Sample Size Gating Policy (Scientific Honesty)</span>
        </h2>
        <p className="text-xs text-spotify-subtext leading-relaxed">
          To prevent misleading recommendations from sparse data, the R analytical engine enforces strict sample tier thresholds:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-lg bg-spotify-card border border-red-500/30 space-y-2">
            <span className="text-red-400 font-bold block">Tier 1: N &lt; 5 (Insufficient)</span>
            <p className="text-spotify-subtext font-sans leading-relaxed">
              Statistical ranking is strictly refused. The engine returns only descriptive catalog summaries with an explicit sample size caveat.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-spotify-card border border-amber-500/30 space-y-2">
            <span className="text-amber-400 font-bold block">Tier 2: 5 &le; N &lt; 20 (Moderate / Small)</span>
            <p className="text-spotify-subtext font-sans leading-relaxed">
              Computes robust non-parametric medians and IQRs. Applies a 15% uncertainty discount to ranking scores and displays a small-sample banner.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-spotify-card border border-emerald-500/30 space-y-2">
            <span className="text-emerald-400 font-bold block">Tier 3: N &ge; 20 (Robust)</span>
            <p className="text-spotify-subtext font-sans leading-relaxed">
              Full parametric analysis: Student&apos;s t 95% confidence intervals, Kruskal-Wallis tests, and One-Way ANOVA across weekdays.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Data Provenance & Academic Context */}
      <section className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4">
        <h2 className="text-xl font-bold text-white">4. Academic Context & References</h2>
        <div className="space-y-3 text-xs text-spotify-subtext leading-relaxed">
          <p>
            <strong>Institution:</strong> Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad<br />
            <strong>Department:</strong> Department of Artificial Intelligence & Data Science<br />
            <strong>Project Lead:</strong> Karthik Battiprolu (Roll No: ugs24304_aid.battiprolu@cbit.org.in)<br />
            <strong>Target Repository:</strong>{" "}
            <a
              href="https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-.git"
              target="_blank"
              rel="noopener noreferrer"
              className="text-spotify-green hover:underline inline-flex items-center space-x-1"
            >
              <span>https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-.git</span>
              <ExternalLink className="h-3 w-3 inline" />
            </a>
          </p>

          <div className="pt-2">
            <h4 className="font-semibold text-white mb-1">Key References:</h4>
            <ol className="list-decimal list-inside space-y-1 text-spotify-subtext">
              <li>International Federation of the Phonographic Industry (IFPI). &ldquo;New Music Fridays: Global Release Day Initiative.&rdquo; (2015).</li>
              <li>Celma, &Ograve;. &ldquo;Music Recommendation and Discovery in the Long Tail.&rdquo; Springer (Last.fm 1K Dataset).</li>
              <li>Nelgiriyewithana, N. &ldquo;Top Spotify Songs 2023.&rdquo; Kaggle Open Datasets.</li>
              <li>Freyberg, J. &ldquo;Spotify Daily Worldwide Chart Data.&rdquo; Kaggle Datasets.</li>
            </ol>
          </div>
        </div>
      </section>
    </div>
  );
}

