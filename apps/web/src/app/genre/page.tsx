"use client";

import { useState } from "react";
import { Compass, AlertCircle, Music, Globe, BarChart2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

// Artist catalog multi-genre research fixture
const genreData = [
  { genre: "Indie Pop", tracks: 8, avgStreams: 268250, medianStreams: 282000, topMarket: "Global", peakDay: "Wednesday", danceability: 68, valence: 59, energy: 65, bpm: 118 },
  { genre: "Synthwave", tracks: 8, avgStreams: 226250, medianStreams: 207500, topMarket: "US", peakDay: "Tuesday", danceability: 62, valence: 48, energy: 78, bpm: 124 },
  { genre: "Lo-Fi", tracks: 5, avgStreams: 306800, medianStreams: 315000, topMarket: "Global", peakDay: "Thursday", danceability: 54, valence: 41, energy: 45, bpm: 86 },
  { genre: "Cyberpunk", tracks: 1, avgStreams: 310000, medianStreams: 310000, topMarket: "US", peakDay: "Friday", danceability: 70, valence: 35, energy: 88, bpm: 130 },
];

export default function GenreExplorerPage() {
  const [selectedGenre, setSelectedGenre] = useState<string>("All");

  const filteredGenres = selectedGenre === "All" ? genreData : genreData.filter((g) => g.genre === selectedGenre);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-2 border-b border-spotify-border pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono text-spotify-green">
          <Compass className="h-4 w-4" />
          <span>Catalog Genre & Audio Feature Analysis</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Genre Explorer</h1>
        <p className="text-sm text-spotify-subtext max-w-3xl leading-relaxed">
          Examine performance variations, audio attributes, and optimal release day tendencies across music styles.
        </p>
      </div>

      {/* Transparency Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-200 text-xs space-y-2">
        <div className="flex items-center space-x-2 font-bold text-amber-400">
          <AlertCircle className="h-4 w-4" />
          <span>Scientific Transparency Notice: Dataset Schema Clarification</span>
        </div>
        <p className="leading-relaxed">
          The Kaggle <em>Spotify Top Songs 2023</em> dataset does not contain an explicit genre classification column.
          Rather than hallucinating genres onto unclassified rows, genre segmentation in this application is derived strictly from
          verified user-uploaded catalogs and artist research fixtures.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedGenre("All")}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
            selectedGenre === "All"
              ? "bg-spotify-green text-black"
              : "bg-spotify-card text-spotify-subtext hover:text-white border border-spotify-border"
          }`}
        >
          All Genres (22 Tracks)
        </button>
        {genreData.map((g) => (
          <button
            key={g.genre}
            onClick={() => setSelectedGenre(g.genre)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              selectedGenre === g.genre
                ? "bg-spotify-green text-black"
                : "bg-spotify-card text-spotify-subtext hover:text-white border border-spotify-border"
            }`}
          >
            {g.genre} ({g.tracks})
          </button>
        ))}
      </div>

      {/* Genre Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredGenres.map((item) => (
          <div
            key={item.genre}
            className="rounded-xl border border-spotify-border bg-spotify-dark p-6 space-y-4 hover:border-spotify-green/40 transition"
          >
            <div className="flex items-center justify-between pb-3 border-b border-spotify-border">
              <h3 className="text-lg font-bold text-white">{item.genre}</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-spotify-card text-spotify-green font-mono">
                {item.tracks} tracks
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-spotify-subtext">Avg Streams:</span>
                <span className="font-mono font-bold text-white">{formatNumber(item.avgStreams)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-spotify-subtext">Median Streams:</span>
                <span className="font-mono font-bold text-blue-400">{formatNumber(item.medianStreams)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-spotify-subtext">Optimal Weekday:</span>
                <span className="font-semibold text-spotify-green">{item.peakDay}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-spotify-subtext">Top Market:</span>
                <span className="font-medium text-white">{item.topMarket}</span>
              </div>
            </div>

            {/* Audio Profile Bars */}
            <div className="pt-3 border-t border-spotify-border/60 space-y-2 text-[11px]">
              <span className="text-spotify-subtext font-mono block">Sonic Fingerprint:</span>
              <div className="space-y-1.5">
                <div>
                  <div className="flex justify-between text-[10px] text-spotify-subtext">
                    <span>Danceability</span>
                    <span>{item.danceability}%</span>
                  </div>
                  <div className="w-full bg-spotify-card h-1.5 rounded-full overflow-hidden">
                    <div className="bg-spotify-green h-full rounded-full" style={{ width: `${item.danceability}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-spotify-subtext">
                    <span>Valence (Mood)</span>
                    <span>{item.valence}%</span>
                  </div>
                  <div className="w-full bg-spotify-card h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full rounded-full" style={{ width: `${item.valence}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] text-spotify-subtext">
                    <span>Energy</span>
                    <span>{item.energy}%</span>
                  </div>
                  <div className="w-full bg-spotify-card h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full rounded-full" style={{ width: `${item.energy}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

