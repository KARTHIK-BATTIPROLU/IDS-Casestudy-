import { HourlyHeatmap } from "@/components/HourlyHeatmap";
import { ReleaseWeekdayChart } from "@/components/ReleaseWeekdayChart";
import listeningData from "@/data/hourly_listening_summary.json";
import performanceData from "@/data/release_weekday_summary.json";
import auditData from "@/data/data_audit_summary.json";
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Database,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";

export default function ResearchDashboardPage() {
  const weekdayMetrics = performanceData.weekday_metrics;
  const hypothesis = performanceData.hypothesis_testing;
  const regression = performanceData.regression_analysis;
  const insights = listeningData.insights;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Page Header */}
      <div className="space-y-2 border-b border-spotify-border pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-spotify-green">
          <Activity className="h-4 w-4" />
          <span>Baseline Research Corpus</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Research Dashboard & Empirical Findings
        </h1>
        <p className="text-sm text-spotify-subtext max-w-3xl leading-relaxed">
          Comprehensive exploration of real timestamped listening logs and global Spotify track distributions.
          All metrics, confidence intervals, and hypothesis tests were calculated in R 4.6.1 via reproducible scripts.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rounded-xl border border-spotify-border bg-spotify-dark p-5 space-y-2">
          <div className="text-xs text-spotify-subtext flex items-center justify-between">
            <span>Listening Events</span>
            <Activity className="h-4 w-4 text-spotify-green" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {listeningData.total_events_analyzed.toLocaleString()}
          </div>
          <p className="text-[11px] text-spotify-subtext">Last.fm 1K user corpus (UTC timestamps)</p>
        </div>

        <div className="rounded-xl border border-spotify-border bg-spotify-dark p-5 space-y-2">
          <div className="text-xs text-spotify-subtext flex items-center justify-between">
            <span>Tracks Analyzed</span>
            <Database className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">
            {performanceData.total_sample_size.toLocaleString()}
          </div>
          <p className="text-[11px] text-spotify-subtext">Cleaned Spotify 2023 tracks catalog</p>
        </div>

        <div className="rounded-xl border border-spotify-border bg-spotify-dark p-5 space-y-2">
          <div className="text-xs text-spotify-subtext flex items-center justify-between">
            <span>Friday Release Share</span>
            <Calendar className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {performanceData.conclusions.friday_release_share_pct}%
          </div>
          <p className="text-[11px] text-spotify-subtext">526 of 952 tracks drop on Friday</p>
        </div>

        <div className="rounded-xl border border-spotify-border bg-spotify-dark p-5 space-y-2">
          <div className="text-xs text-spotify-subtext flex items-center justify-between">
            <span>Peak Listening Window</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400 truncate">
            {insights.peak_release_window.weekday} {insights.peak_release_window.hour}:00 UTC
          </div>
          <p className="text-[11px] text-spotify-subtext">
            Activity Index: {insights.peak_release_window.activity_index} (highest density)
          </p>
        </div>
      </div>

      {/* Hourly Heatmap Section */}
      <section className="space-y-4">
        <HourlyHeatmap data={listeningData.heatmap_grid as any} />
      </section>

      {/* Release Weekday Performance Chart */}
      <section className="space-y-4">
        <ReleaseWeekdayChart data={weekdayMetrics} />
      </section>

      {/* Statistical Hypothesis Testing Cards */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Statistical Significance & Hypothesis Testing (R Engine)
          </h2>
          <p className="text-xs text-spotify-subtext mt-1">
            Testing null hypothesis $H_0$: Release weekday has no independent effect on streaming outcome.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ANOVA Card */}
          <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-spotify-border pb-3">
              <span className="text-xs font-mono uppercase text-spotify-green font-semibold">
                Parametric Test
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-spotify-card text-white font-mono">
                p &lt; 0.001
              </span>
            </div>
            <h3 className="text-base font-bold text-white">One-Way Analysis of Variance (ANOVA)</h3>
            <p className="text-xs text-spotify-subtext font-mono bg-spotify-card p-2 rounded">
              Formula: {hypothesis.anova.formula}
            </p>
            <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="p-2.5 rounded bg-spotify-card">
                <span className="text-spotify-subtext block text-[10px]">F-Statistic</span>
                <span className="text-sm font-bold text-white">{hypothesis.anova.f_statistic}</span>
              </div>
              <div className="p-2.5 rounded bg-spotify-card">
                <span className="text-spotify-subtext block text-[10px]">DF (Between, Within)</span>
                <span className="text-sm font-bold text-white">
                  ({hypothesis.anova.df_between}, {hypothesis.anova.df_within})
                </span>
              </div>
              <div className="p-2.5 rounded bg-spotify-card">
                <span className="text-spotify-subtext block text-[10px]">p-value</span>
                <span className="text-sm font-bold text-spotify-green">
                  {hypothesis.anova.p_value}
                </span>
              </div>
            </div>
            <p className="text-xs text-spotify-subtext leading-relaxed">
              Unadjusted ANOVA indicates significant variation among weekday raw streams, largely driven by outliers and Tuesday/Sunday hit tracks.
            </p>
          </div>

          {/* Kruskal-Wallis Card */}
          <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-spotify-border pb-3">
              <span className="text-xs font-mono uppercase text-blue-400 font-semibold">
                Non-Parametric Test
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-spotify-card text-white font-mono">
                p = {hypothesis.kruskal_wallis.p_value}
              </span>
            </div>
            <h3 className="text-base font-bold text-white">Kruskal-Wallis Rank Sum Test</h3>
            <p className="text-xs text-spotify-subtext font-mono bg-spotify-card p-2 rounded">
              Formula: {hypothesis.kruskal_wallis.formula}
            </p>
            <div className="grid grid-cols-2 gap-3 text-center text-xs font-mono">
              <div className="p-2.5 rounded bg-spotify-card">
                <span className="text-spotify-subtext block text-[10px]">Chi-Squared (&chi;&sup2;)</span>
                <span className="text-sm font-bold text-white">{hypothesis.kruskal_wallis.chi_squared}</span>
              </div>
              <div className="p-2.5 rounded bg-spotify-card">
                <span className="text-spotify-subtext block text-[10px]">p-value</span>
                <span className="text-sm font-bold text-blue-400">
                  {hypothesis.kruskal_wallis.p_value}
                </span>
              </div>
            </div>
            <p className="text-xs text-spotify-subtext leading-relaxed">
              Robust against the heavy-tailed skewness of streaming counts. Confirms median ranks differ prior to controlling for playlisting.
            </p>
          </div>
        </div>
      </section>

      {/* Regression & Confounder Adjustment */}
      <section className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-mono text-spotify-green">
            <Layers className="h-4 w-4" />
            <span>Multiple OLS Regression Analysis</span>
          </div>
          <h2 className="text-xl font-bold text-white">
            Controlling for Track Age and Editorial Playlist Placement
          </h2>
          <p className="text-xs text-spotify-subtext">
            Model: <code className="text-white font-mono">{regression.formula}</code>
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-spotify-card border border-spotify-border">
            <span className="text-spotify-subtext block text-[11px]">R-Squared</span>
            <span className="text-base font-bold text-white">{regression.r_squared}</span>
          </div>
          <div className="p-3 rounded-lg bg-spotify-card border border-spotify-border">
            <span className="text-spotify-subtext block text-[11px]">Adjusted R-Squared</span>
            <span className="text-base font-bold text-white">{regression.adj_r_squared}</span>
          </div>
          <div className="p-3 rounded-lg bg-spotify-card border border-spotify-border">
            <span className="text-spotify-subtext block text-[11px]">Model F-Statistic</span>
            <span className="text-base font-bold text-white">{regression.f_statistic}</span>
          </div>
          <div className="p-3 rounded-lg bg-spotify-card border border-spotify-border">
            <span className="text-spotify-subtext block text-[11px]">Overall p-value</span>
            <span className="text-base font-bold text-spotify-green">4.64e-101</span>
          </div>
        </div>

        {/* Coefficients Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-spotify-border text-spotify-subtext font-mono uppercase text-[11px]">
                <th className="py-2.5 px-3">Predictor Term</th>
                <th className="py-2.5 px-3">Estimate (&beta;)</th>
                <th className="py-2.5 px-3">Std. Error</th>
                <th className="py-2.5 px-3">t-Statistic</th>
                <th className="py-2.5 px-3">p-value</th>
                <th className="py-2.5 px-3">Significance (0.05)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-spotify-border/40 font-mono">
              {regression.coefficients.map((c: any) => (
                <tr key={c.term} className="hover:bg-spotify-card/40">
                  <td className="py-2 px-3 text-white font-semibold">{c.term}</td>
                  <td className="py-2 px-3">{c.estimate}</td>
                  <td className="py-2 px-3 text-spotify-subtext">{c.std_error}</td>
                  <td className="py-2 px-3">{c.statistic}</td>
                  <td className="py-2 px-3 text-spotify-green">{c.p_value}</td>
                  <td className="py-2 px-3">
                    {c.p_value < 0.05 ? (
                      <span className="text-emerald-400 font-bold">Significant ***</span>
                    ) : (
                      <span className="text-spotify-subtext">Not Significant (p &gt; 0.05)</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 rounded-lg bg-spotify-card/80 border border-spotify-border text-xs text-spotify-subtext leading-relaxed">
          <strong className="text-white">Crucial Finding:</strong> The coefficient for <code className="text-amber-300">weekdayFriday</code> is <strong>0.0128</strong> with a p-value of <strong>0.9167</strong>.
          This confirms that Friday releases enjoy no intrinsic streaming premium over other days once editorial playlisting and track age are accounted for.
        </div>
      </section>

      {/* Dataset Audit Profile Table */}
      <section className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Database className="h-4 w-4 text-spotify-green" />
          <span>Dataset Schema & Missingness Audit</span>
        </h2>
        <p className="text-xs text-spotify-subtext">
          Audit performed automatically on raw source data by <code className="text-white">analysis/01_audit_data.R</code>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-lg bg-spotify-card border border-spotify-border space-y-2">
            <h4 className="font-bold text-white">Spotify Top Songs 2023</h4>
            <p className="text-spotify-subtext">Total Records: <strong>{auditData.datasets.spotify_2023.total_rows}</strong></p>
            <p className="text-spotify-subtext">Columns: <strong>{auditData.datasets.spotify_2023.total_columns}</strong></p>
            <p className="text-amber-400 text-[11px]">Note: Missing explicit genre & hourly fields.</p>
          </div>
          <div className="p-4 rounded-lg bg-spotify-card border border-spotify-border space-y-2">
            <h4 className="font-bold text-white">Spotify Historical Charts</h4>
            <p className="text-spotify-subtext">Sampled Records: <strong>{auditData.datasets.spotify_charts.total_rows.toLocaleString()}</strong></p>
            <p className="text-spotify-subtext">Columns: <strong>{auditData.datasets.spotify_charts.total_columns}</strong></p>
            <p className="text-spotify-green text-[11px]">Covers multi-country daily chart positions.</p>
          </div>
          <div className="p-4 rounded-lg bg-spotify-card border border-spotify-border space-y-2">
            <h4 className="font-bold text-white">Last.fm 1K Listening Corpus</h4>
            <p className="text-spotify-subtext">Sampled Events: <strong>{auditData.datasets.lastfm_listening.total_rows.toLocaleString()}</strong></p>
            <p className="text-spotify-subtext">Columns: <strong>{auditData.datasets.lastfm_listening.total_columns}</strong></p>
            <p className="text-spotify-green text-[11px]">Microsecond UTC timestamped events.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
