"use client";

import { useState } from "react";
import Papa from "papaparse";
import { submitForAnalysis } from "@/lib/api-client";
import { AnalyzeResponse, ColumnMapping, AnalysisWeights } from "@/types";
import { CandidateWindowsTable } from "@/components/CandidateWindowsTable";
import {
  UploadCloud,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Sparkles,
  Download,
  Loader2,
  RotateCcw,
} from "lucide-react";

export default function UploadPage() {
  const [csvText, setCsvText] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  
  // Column Mappings
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: "",
    metric: "",
    title: "",
    time: "",
    genre: "",
    market: "",
  });

  // Weights
  const [weights, setWeights] = useState<AnalysisWeights>({
    activity: 0.45,
    performance: 0.35,
    congestion: 0.20,
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);

  const handleFileUpload = (file: File) => {
    setFileName(file.name);
    setError(null);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvText(text);

      Papa.parse(text, {
        header: true,
        preview: 5,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields && results.meta.fields.length > 0) {
            setHeaders(results.meta.fields);
            setPreviewRows(results.data);

            // Auto-detect columns
            const cols = results.meta.fields;
            const detectedDate = cols.find((c) => /date|day/i.test(c)) || cols[0] || "";
            const detectedMetric = cols.find((c) => /stream|play|listen/i.test(c)) || cols[1] || "";
            const detectedTitle = cols.find((c) => /title|track|song/i.test(c)) || "";
            const detectedTime = cols.find((c) => /time|hour/i.test(c)) || "";
            const detectedGenre = cols.find((c) => /genre/i.test(c)) || "";
            const detectedMarket = cols.find((c) => /market|country/i.test(c)) || "";

            setMapping({
              date: detectedDate,
              metric: detectedMetric,
              title: detectedTitle,
              time: detectedTime,
              genre: detectedGenre,
              market: detectedMarket,
            });
          }
        },
      });
    };
    reader.readAsText(file);
  };

  const loadSampleCatalog = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/templates/sample_artist_releases.csv");
      const text = await res.text();
      setFileName("sample_artist_releases.csv (22 tracks)");
      setCsvText(text);

      Papa.parse(text, {
        header: true,
        preview: 5,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.meta.fields) {
            setHeaders(results.meta.fields);
            setPreviewRows(results.data);
            setMapping({
              date: "release_date",
              metric: "streams_first_28d",
              title: "track_title",
              time: "release_time",
              genre: "genre",
              market: "target_market",
            });
          }
        },
      });
    } catch (e: any) {
      setError("Failed to load sample dataset: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!csvText) {
      setError("Please upload a CSV file or load the sample catalog first.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await submitForAnalysis(csvText, mapping, weights);
      setAnalysisResult(result);
    } catch (err: any) {
      setError(err.message || "An error occurred during R analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2 border-b border-spotify-border pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-spotify-green">
          <UploadCloud className="h-4 w-4" />
          <span>R-Powered Release Timing Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Analyze Your Historical Catalog
        </h1>
        <p className="text-sm text-spotify-subtext max-w-3xl leading-relaxed">
          Upload your past song releases to identify your strongest release days, measure statistical variance,
          and receive personalized candidate release windows computed in R.
        </p>
      </div>

      {/* Privacy Guarantee Banner */}
      <div className="rounded-xl border border-spotify-green/30 bg-spotify-green/10 p-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3 text-spotify-green">
          <ShieldCheck className="h-5 w-5 shrink-0" />
          <span>
            <strong>Zero-Storage Guarantee:</strong> Your catalog data is processed purely in-memory in R.
            No rows are saved to disk, databases, or logs.
          </span>
        </div>
        <a
          href="/templates/sample_artist_releases.csv"
          download
          className="hidden sm:inline-flex items-center space-x-1.5 text-xs text-white hover:text-spotify-green transition"
        >
          <Download className="h-4 w-4" />
          <span>Download Template (.csv)</span>
        </a>
      </div>

      {/* Upload Zone & Quick Sample Load */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-xl border-2 border-dashed border-spotify-border bg-spotify-dark p-8 text-center flex flex-col items-center justify-center space-y-4 hover:border-spotify-green/50 transition">
          <div className="h-12 w-12 rounded-full bg-spotify-card border border-spotify-border flex items-center justify-center text-spotify-green">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {fileName ? `Loaded: ${fileName}` : "Drag and drop your release CSV file here"}
            </p>
            <p className="text-xs text-spotify-subtext mt-1">
              Supports CSV with standard dates (YYYY-MM-DD, DD/MM/YYYY) and stream totals.
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center space-x-2 bg-spotify-card hover:bg-spotify-cardhover text-white px-4 py-2 rounded-lg border border-spotify-border text-xs font-semibold transition">
            <span>Browse Computer</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </label>
        </div>

        {/* Quick Sample Load Card */}
        <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-spotify-green">
              <Sparkles className="h-4 w-4" />
              <span>Instant Test</span>
            </div>
            <h3 className="text-base font-bold text-white">Sample Artist Catalog</h3>
            <p className="text-xs text-spotify-subtext leading-relaxed">
              Don’t have a CSV handy? Test the complete R analytical pipeline with our verified 22-track indie artist catalog.
            </p>
          </div>

          <button
            onClick={loadSampleCatalog}
            disabled={loading}
            className="w-full inline-flex items-center justify-center space-x-2 bg-spotify-card hover:bg-spotify-cardhover text-white px-4 py-2.5 rounded-lg border border-spotify-green/40 text-xs font-semibold transition text-spotify-green"
          >
            <Sparkles className="h-4 w-4" />
            <span>Load 22-Track Sample</span>
          </button>
        </div>
      </div>

      {/* CSV Table Preview & Column Mapper */}
      {previewRows.length > 0 && (
        <div className="space-y-6 rounded-xl border border-spotify-border bg-spotify-dark p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-spotify-border pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Catalog Preview & Column Mapping</h3>
              <p className="text-xs text-spotify-subtext">First 5 rows detected from your uploaded file.</p>
            </div>
            <span className="text-xs font-mono text-spotify-green">{headers.length} Columns Detected</span>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-spotify-border text-spotify-subtext font-mono">
                  {headers.map((h) => (
                    <th key={h} className="py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-spotify-border/40 font-mono">
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-spotify-card/40">
                    {headers.map((h) => (
                      <td key={h} className="py-2 px-3 text-white truncate max-w-[150px]">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Column Mapping Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-spotify-border/60 text-xs">
            <div>
              <label className="block text-spotify-subtext mb-1 font-semibold">
                Release Date <span className="text-red-400">*</span>
              </label>
              <select
                value={mapping.date}
                onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                className="w-full bg-spotify-card border border-spotify-border text-white rounded p-2 focus:border-spotify-green focus:outline-none"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-spotify-subtext mb-1 font-semibold">
                Streams / Metric <span className="text-red-400">*</span>
              </label>
              <select
                value={mapping.metric}
                onChange={(e) => setMapping({ ...mapping, metric: e.target.value })}
                className="w-full bg-spotify-card border border-spotify-border text-white rounded p-2 focus:border-spotify-green focus:outline-none"
              >
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-spotify-subtext mb-1">Track Title</label>
              <select
                value={mapping.title || ""}
                onChange={(e) => setMapping({ ...mapping, title: e.target.value })}
                className="w-full bg-spotify-card border border-spotify-border text-white rounded p-2 focus:border-spotify-green focus:outline-none"
              >
                <option value="">(None)</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-spotify-subtext mb-1">Release Time</label>
              <select
                value={mapping.time || ""}
                onChange={(e) => setMapping({ ...mapping, time: e.target.value })}
                className="w-full bg-spotify-card border border-spotify-border text-white rounded p-2 focus:border-spotify-green focus:outline-none"
              >
                <option value="">(None)</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-spotify-subtext mb-1">Genre</label>
              <select
                value={mapping.genre || ""}
                onChange={(e) => setMapping({ ...mapping, genre: e.target.value })}
                className="w-full bg-spotify-card border border-spotify-border text-white rounded p-2 focus:border-spotify-green focus:outline-none"
              >
                <option value="">(None)</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-spotify-subtext mb-1">Target Market</label>
              <select
                value={mapping.market || ""}
                onChange={(e) => setMapping({ ...mapping, market: e.target.value })}
                className="w-full bg-spotify-card border border-spotify-border text-white rounded p-2 focus:border-spotify-green focus:outline-none"
              >
                <option value="">(None)</option>
                {headers.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Heuristic Weighting Sliders */}
          <div className="pt-4 border-t border-spotify-border/60 space-y-4">
            <div className="flex items-center space-x-2 text-xs font-semibold text-white">
              <Sliders className="h-4 w-4 text-spotify-green" />
              <span>Heuristic Scoring Weights</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div>
                <div className="flex justify-between text-spotify-subtext mb-1">
                  <span>Listening Activity Share:</span>
                  <span className="font-mono text-white">{Math.round(weights.activity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={weights.activity}
                  onChange={(e) => setWeights({ ...weights, activity: parseFloat(e.target.value) })}
                  className="w-full accent-spotify-green"
                />
              </div>

              <div>
                <div className="flex justify-between text-spotify-subtext mb-1">
                  <span>Your Historical Performance:</span>
                  <span className="font-mono text-white">{Math.round(weights.performance * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={weights.performance}
                  onChange={(e) => setWeights({ ...weights, performance: parseFloat(e.target.value) })}
                  className="w-full accent-blue-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-spotify-subtext mb-1">
                  <span>Congestion Penalty (Friday drop):</span>
                  <span className="font-mono text-white">{Math.round(weights.congestion * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="0.5"
                  step="0.05"
                  value={weights.congestion}
                  onChange={(e) => setWeights({ ...weights, congestion: parseFloat(e.target.value) })}
                  className="w-full accent-red-400"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleRunAnalysis}
              disabled={loading}
              className="inline-flex items-center space-x-2 bg-spotify-green hover:bg-spotify-lightgreen text-black font-bold px-6 py-3 rounded-lg text-sm transition shadow-lg shadow-spotify-green/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Computing in R Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Analyze in R Analytical Engine</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold text-white block">Analysis Error</strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Dynamic Results Section (Computed by R) */}
      {analysisResult && analysisResult.success && (
        <div className="space-y-8 pt-6 border-t border-spotify-border">
          {/* Sample Size Warning / Tier Banner */}
          {analysisResult.advisory?.warning_banner ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-white block">Statistical Sample Size Notice</strong>
                <span>{analysisResult.advisory.warning_banner}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-spotify-card border border-spotify-green/40 text-xs flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <CheckCircle2 className="h-4 w-4 text-spotify-green" />
                <span>
                  Analyzed <strong>{analysisResult.validation?.valid_analyzed_rows} valid releases</strong> in R.
                  Confidence Tier: <strong className="text-spotify-green">{analysisResult.advisory?.confidence_tier}</strong>
                </span>
              </div>
              <span className="font-mono text-spotify-subtext text-[11px]">
                {analysisResult.caveats?.sample_size_reminder}
              </span>
            </div>
          )}

          {/* Weekday Breakdown Table */}
          {analysisResult.statistics && (
            <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4">
              <h3 className="text-base font-bold text-white">
                Your Catalog Performance Across Weekdays (Parametric &amp; Non-Parametric)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-spotify-border text-spotify-subtext font-mono uppercase text-[11px]">
                      <th className="py-2.5 px-3">Weekday</th>
                      <th className="py-2.5 px-3">Releases (N)</th>
                      <th className="py-2.5 px-3">Median Streams</th>
                      <th className="py-2.5 px-3">Mean Streams</th>
                      <th className="py-2.5 px-3">Std. Dev</th>
                      <th className="py-2.5 px-3">95% CI (Mean)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-spotify-border/40 font-mono">
                    {analysisResult.statistics.weekday_summary.map((row) => (
                      <tr key={row.weekday} className="hover:bg-spotify-card/40">
                        <td className="py-2 px-3 font-semibold text-white">{row.weekday}</td>
                        <td className="py-2 px-3">{row.count}</td>
                        <td className="py-2 px-3 text-blue-400 font-bold">
                          {row.median_val > 0 ? row.median_val.toLocaleString() : "-"}
                        </td>
                        <td className="py-2 px-3 text-spotify-green">
                          {row.mean_val > 0 ? row.mean_val.toLocaleString() : "-"}
                        </td>
                        <td className="py-2 px-3 text-spotify-subtext">
                          {row.sd_val > 0 ? row.sd_val.toLocaleString() : "-"}
                        </td>
                        <td className="py-2 px-3 text-spotify-subtext">
                          {row.count > 1 ? `[${row.ci_lower_95.toLocaleString()} - ${row.ci_upper_95.toLocaleString()}]` : "N/A (N=1)"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ranked Advice Table */}
          {analysisResult.advisory?.top_recommendations && analysisResult.advisory.top_recommendations.length > 0 && (
            <CandidateWindowsTable
              windows={analysisResult.advisory.top_recommendations}
              title="Personalized Release-Window Recommendations"
              subtitle="Optimized specifically for your historical streaming patterns using the R Plumber scoring algorithm."
              confidenceTier={analysisResult.advisory.confidence_tier}
              uncertaintyNote={analysisResult.advisory.uncertainty_note}
            />
          )}
        </div>
      )}
    </div>
  );
}

