"use client";

import { useState } from "react";
import { HourlyListeningCell } from "@/types";
import { Info, Globe } from "lucide-react";

interface HourlyHeatmapProps {
  data: HourlyListeningCell[];
}

export function HourlyHeatmap({ data }: HourlyHeatmapProps) {
  const [selectedCell, setSelectedCell] = useState<HourlyListeningCell | null>(null);
  const [timezoneOffset, setTimezoneOffset] = useState<number>(0);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Function to shift hour by timezone
  const getShiftedHour = (h: number, offset: number) => {
    const shifted = (h + offset) % 24;
    return shifted < 0 ? shifted + 24 : shifted;
  };

  const getCellIntensityColor = (index: number) => {
    // index is relative to 100
    if (index >= 135) return "bg-emerald-500 text-black font-bold";
    if (index >= 115) return "bg-emerald-600 text-white";
    if (index >= 95) return "bg-emerald-700/80 text-white";
    if (index >= 75) return "bg-emerald-900/60 text-emerald-200";
    return "bg-spotify-card text-spotify-subtext";
  };

  return (
    <div className="rounded-xl border border-spotify-border bg-spotify-dark p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-spotify-border/60 gap-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Global Listening Activity Distribution (168-Hour Matrix)</span>
          </h3>
          <p className="text-xs text-spotify-subtext mt-1">
            Empirical streaming density derived from Last.fm 1K user corpus. Values normalized to 100 as the baseline hourly mean.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <Globe className="h-4 w-4 text-spotify-subtext" />
          <span className="text-spotify-subtext">Display Timezone:</span>
          <select
            value={timezoneOffset}
            onChange={(e) => setTimezoneOffset(Number(e.target.value))}
            className="bg-spotify-card border border-spotify-border text-white text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-spotify-green"
          >
            <option value={0}>UTC (Coordinated Universal)</option>
            <option value={-5}>EST (UTC-5: New York)</option>
            <option value={-8}>PST (UTC-8: Los Angeles)</option>
            <option value={1}>CET (UTC+1: Berlin/Paris)</option>
            <option value={5.5}>IST (UTC+5:30: India)</option>
          </select>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto mt-6">
        <div className="min-w-[700px]">
          {/* Header row with hours */}
          <div className="grid grid-cols-[90px_repeat(24,1fr)] gap-1 text-[10px] text-spotify-subtext text-center font-mono mb-1">
            <div></div>
            {hours.map((h) => (
              <div key={h} className="py-1">
                {String(getShiftedHour(h, Math.floor(timezoneOffset))).padStart(2, "0")}h
              </div>
            ))}
          </div>

          {/* Days rows */}
          {days.map((day) => {
            return (
              <div
                key={day}
                className="grid grid-cols-[90px_repeat(24,1fr)] gap-1 mb-1 items-center"
              >
                <div className="text-xs font-medium text-white/90 truncate pr-2">
                  {day}
                </div>
                {hours.map((hour) => {
                  const cell = data.find((d) => d.weekday === day && d.hour === hour) || {
                    weekday: day,
                    hour,
                    event_count: 0,
                    share_pct: 0,
                    activity_index: 0,
                  };

                  return (
                    <div
                      key={hour}
                      onMouseEnter={() => setSelectedCell(cell)}
                      className={`h-7 rounded cursor-pointer transition-transform hover:scale-110 flex items-center justify-center text-[10px] ${getCellIntensityColor(
                        cell.activity_index
                      )}`}
                      title={`${day} ${hour}:00 UTC - Index: ${cell.activity_index} (${cell.share_pct}%)`}
                    >
                      {Math.round(cell.activity_index)}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend & Hover Inspector */}
      <div className="mt-6 pt-4 border-t border-spotify-border/60 flex flex-col md:flex-row items-start md:items-center justify-between text-xs gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-spotify-subtext font-mono">Intensity Index:</span>
          <div className="flex items-center space-x-1 font-mono text-[10px]">
            <span className="px-2 py-0.5 rounded bg-spotify-card text-spotify-subtext">&lt;75 Low</span>
            <span className="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200">75-95</span>
            <span className="px-2 py-0.5 rounded bg-emerald-700/80 text-white">95-115 Avg</span>
            <span className="px-2 py-0.5 rounded bg-emerald-600 text-white">115-135 High</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-bold">&gt;135 Peak</span>
          </div>
        </div>

        {selectedCell ? (
          <div className="bg-spotify-card border border-spotify-green/40 px-3 py-1.5 rounded-md text-xs text-white flex items-center space-x-3">
            <span className="font-semibold text-spotify-green">
              {selectedCell.weekday} {String(selectedCell.hour).padStart(2, "0")}:00 UTC
            </span>
            <span>Index: <strong>{selectedCell.activity_index}</strong></span>
            <span>Share: <strong>{selectedCell.share_pct}%</strong></span>
            <span>Events: <strong>{selectedCell.event_count.toLocaleString()}</strong></span>
          </div>
        ) : (
          <div className="text-spotify-subtext text-xs italic flex items-center space-x-1">
            <Info className="h-3.5 w-3.5" />
            <span>Hover over any hour cell to inspect empirical listening metrics</span>
          </div>
        )}
      </div>
    </div>
  );
}
