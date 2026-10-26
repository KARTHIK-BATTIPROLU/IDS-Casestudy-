"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ErrorBar,
} from "recharts";
import { WeekdayMetric } from "@/types";
import { formatNumber } from "@/lib/utils";

interface ReleaseWeekdayChartProps {
  data: WeekdayMetric[];
}

export function ReleaseWeekdayChart({ data }: ReleaseWeekdayChartProps) {
  // Format data for Recharts with error bar bounds
  const chartData = data.map((d) => ({
    weekday: d.weekday,
    mean: d.mean_streams,
    median: d.median_streams,
    releases: d.n_tracks,
    share: d.share_of_releases_pct,
    // Error bounds: distance from mean to CI upper and lower
    error: [Math.max(0, d.mean_streams - d.ci_lower_95), Math.max(0, d.ci_upper_95 - d.mean_streams)],
    ci_lower: d.ci_lower_95,
    ci_upper: d.ci_upper_95,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-lg border border-spotify-border bg-spotify-dark p-3 shadow-xl text-xs space-y-1">
          <p className="font-bold text-white text-sm">{label}</p>
          <p className="text-spotify-green">
            Mean Streams: <strong className="font-mono">{formatNumber(item.mean)}</strong>
          </p>
          <p className="text-blue-400">
            Median Streams: <strong className="font-mono">{formatNumber(item.median)}</strong>
          </p>
          <p className="text-spotify-subtext">
            95% CI (Mean): <span className="font-mono">[{formatNumber(item.ci_lower)} - {formatNumber(item.ci_upper)}]</span>
          </p>
          <p className="text-amber-400">
            Track Releases: <strong className="font-mono">{item.releases} tracks ({item.share}%)</strong>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-spotify-border/60 gap-2">
        <div>
          <h3 className="text-lg font-bold text-white">
            Release Weekday Performance & 95% Confidence Intervals
          </h3>
          <p className="text-xs text-spotify-subtext mt-1">
            Parametric mean with Student’s t-distribution 95% CI vs robust median streams (Spotify 2023 Dataset, N=952).
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="flex items-center space-x-1">
            <span className="h-3 w-3 rounded-sm bg-spotify-green"></span>
            <span className="text-spotify-subtext">Mean Streams</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="h-3 w-3 rounded-sm bg-blue-500"></span>
            <span className="text-spotify-subtext">Median Streams</span>
          </span>
        </div>
      </div>

      <div className="h-80 w-full mt-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#282828" vertical={false} />
            <XAxis dataKey="weekday" stroke="#a7a7a7" fontSize={12} tickLine={false} />
            <YAxis
              stroke="#a7a7a7"
              fontSize={12}
              tickLine={false}
              tickFormatter={(v) => formatNumber(v)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="mean" fill="#1DB954" radius={[4, 4, 0, 0]}>
              <ErrorBar dataKey="error" width={4} strokeWidth={2} stroke="#ffffff" />
            </Bar>
            <Bar dataKey="median" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-spotify-border/60 text-xs text-spotify-subtext flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-amber-400">Industry Release Congestion Note:</span>
          <span>Friday represents <strong>55.25%</strong> of all releases, leading to saturated curator inboxes.</span>
        </div>
        <span className="font-mono text-[11px] text-spotify-green">Computed in R via broom & stats</span>
      </div>
    </div>
  );
}
