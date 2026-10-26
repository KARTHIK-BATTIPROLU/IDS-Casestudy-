"use client";

import { useState } from "react";
import Link from "next/link";
import baselineData from "@/data/baseline_recommendations.json";
import { CandidateWindowsTable } from "@/components/CandidateWindowsTable";
import { Clock, Award, ShieldAlert, TrendingUp, UploadCloud, ArrowRight } from "lucide-react";

export default function AdvisorPage() {
  const [weekdayFilter, setWeekdayFilter] = useState<string>("All");

  const allRecommendations = baselineData.top_recommendations as any[];

  const filteredWindows = weekdayFilter === "All"
    ? allRecommendations
    : allRecommendations.filter((w) => w.weekday === weekdayFilter);

  const weekdays = ["All", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", "Monday"];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2 border-b border-spotify-border pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-spotify-green">
          <Clock className="h-4 w-4" />
          <span>Decision Support System</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">
          Release-Window Advisor
        </h1>
        <p className="text-sm text-spotify-subtext max-w-3xl leading-relaxed">
          Algorithmic candidate release windows ranked by combining empirical listener activity (S_activity),
          historical release stream distributions (S_perf), and editorial release congestion penalties (C).
        </p>
      </div>

      {/* Strategic Window Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 font-bold">
            <Award className="h-4 w-4" />
            <span>Optimal Window #1: Tuesday Afternoon</span>
          </div>
          <h3 className="text-base font-bold text-white">Tuesday 15:00 - 17:00 UTC</h3>
          <p className="text-xs text-spotify-subtext leading-relaxed">
            Combines high real-time listening velocity across European and North American peak daytime hours with low competitor release volume (only 6.8% of weekly drops).
          </p>
        </div>

        <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-blue-400 font-bold">
            <TrendingUp className="h-4 w-4" />
            <span>Optimal Window #2: Wednesday Afternoon</span>
          </div>
          <h3 className="text-base font-bold text-white">Wednesday 15:00 - 18:00 UTC</h3>
          <p className="text-xs text-spotify-subtext leading-relaxed">
            Sustains high mid-week streaming momentum. Ideal for independent artists relying on algorithmic radio and user algorithmic playlists over editorial pitching.
          </p>
        </div>

        <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-amber-400 font-bold">
            <ShieldAlert className="h-4 w-4" />
            <span>Friday Industry Standard</span>
          </div>
          <h3 className="text-base font-bold text-white">Friday 00:00 UTC (New Music Friday)</h3>
          <p className="text-xs text-spotify-subtext leading-relaxed">
            Mandatory if pursuing major Spotify editorial playlist placement (NMF), but incurs the maximum congestion penalty (-100 pts) due to 55% global release saturation.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-spotify-subtext mr-2 font-mono">Filter by Weekday:</span>
          {weekdays.map((day) => (
            <button
              key={day}
              onClick={() => setWeekdayFilter(day)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                weekdayFilter === day
                  ? "bg-spotify-green text-black font-semibold"
                  : "bg-spotify-card text-spotify-subtext hover:text-white border border-spotify-border"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <Link
          href="/upload"
          className="inline-flex items-center space-x-1.5 text-xs text-spotify-green hover:text-spotify-lightgreen font-semibold"
        >
          <UploadCloud className="h-4 w-4" />
          <span>Upload your own catalog for customized advice</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Table of Candidate Windows */}
      <CandidateWindowsTable
        windows={filteredWindows}
        title="Baseline Research Recommendations (Top Candidate Windows)"
        subtitle="Ranked across 168 candidate hours using default weights (Activity 45%, Historical Performance 35%, Congestion Penalty 20%)."
        confidenceTier="High (N=952 baseline tracks)"
      />
    </div>
  );
}

