"use client";

import { CandidateWindow } from "@/types";
import { Download, Award, AlertCircle, TrendingUp, Users, ShieldAlert } from "lucide-react";

interface CandidateWindowsTableProps {
  windows: CandidateWindow[];
  title?: string;
  subtitle?: string;
  confidenceTier?: string;
  uncertaintyNote?: string;
}

export function CandidateWindowsTable({
  windows,
  title = "Ranked Release-Window Advice",
  subtitle = "Computed by R combining empirical listener activity, release performance, and editorial congestion penalties.",
  confidenceTier,
  uncertaintyNote,
}: CandidateWindowsTableProps) {
  const exportToCSV = () => {
    if (!windows || windows.length === 0) return;
    const headers = [
      "Rank",
      "Window",
      "Weekday",
      "Hour_UTC",
      "Composite_Score",
      "Tier",
      "Activity_Score",
      "Performance_Score",
      "Congestion_Score",
      "Rationale",
    ];
    const rows = windows.map((w) => [
      w.rank,
      `"${w.window_label}"`,
      w.weekday,
      w.hour,
      w.composite_score,
      `"${w.tier || w.recommendation_tier || ""}"`,
      w.activity_score,
      w.user_perf_score ?? w.perf_score ?? 0,
      w.congestion_score,
      `"${w.caveat || w.rationale || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `spotify_release_window_advice_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTierBadge = (tier?: string) => {
    if (!tier) return null;
    if (tier.includes("Top") || tier.includes("Optimal")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Award className="h-3 w-3 mr-1" />
          {tier}
        </span>
      );
    }
    if (tier.includes("Strong") || tier.includes("Contender")) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
          {tier}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-700 text-zinc-300">
        {tier}
      </span>
    );
  };

  return (
    <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-spotify-border/60 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {confidenceTier && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-spotify-card border border-spotify-green text-spotify-green">
                Confidence: {confidenceTier}
              </span>
            )}
          </div>
          <p className="text-xs text-spotify-subtext mt-1">{subtitle}</p>
        </div>

        <button
          onClick={exportToCSV}
          className="inline-flex items-center space-x-2 bg-spotify-card hover:bg-spotify-cardhover text-white px-3.5 py-2 rounded-lg border border-spotify-border text-xs font-medium transition shadow-sm"
        >
          <Download className="h-3.5 w-3.5 text-spotify-green" />
          <span>Export Ranked Advice (.csv)</span>
        </button>
      </div>

      {uncertaintyNote && (
        <div className="p-3 rounded-lg bg-spotify-card/80 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <span>{uncertaintyNote}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-spotify-border text-spotify-subtext font-mono uppercase text-[11px]">
              <th className="py-3 px-3">Rank</th>
              <th className="py-3 px-3">Release Window</th>
              <th className="py-3 px-3">Composite Score</th>
              <th className="py-3 px-3">Classification</th>
              <th className="py-3 px-3">Activity</th>
              <th className="py-3 px-3">Perf Score</th>
              <th className="py-3 px-3">Congestion</th>
              <th className="py-3 px-3">Evidence Rationale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-spotify-border/40">
            {windows.map((w) => (
              <tr key={w.rank} className="hover:bg-spotify-card/60 transition-colors">
                <td className="py-3 px-3 font-mono font-bold text-white">
                  #{w.rank}
                </td>
                <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">
                  {w.window_label}
                </td>
                <td className="py-3 px-3 font-mono">
                  <span className="text-sm font-bold text-spotify-green">
                    {w.composite_score}
                  </span>
                  <span className="text-[10px] text-spotify-subtext">/100</span>
                </td>
                <td className="py-3 px-3">
                  {getTierBadge(w.tier || w.recommendation_tier)}
                </td>
                <td className="py-3 px-3 font-mono text-emerald-400">
                  {w.activity_score}
                </td>
                <td className="py-3 px-3 font-mono text-blue-400">
                  {w.user_perf_score ?? w.perf_score ?? "N/A"}
                </td>
                <td className="py-3 px-3 font-mono text-rose-400">
                  -{w.congestion_score}
                </td>
                <td className="py-3 px-3 text-spotify-subtext max-w-xs text-[11px] leading-tight">
                  {w.caveat || w.rationale}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
