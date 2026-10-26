# analysis/01_audit_data.R
# Reproducible Data Audit Script
# Profiles datasets in data/raw/, computes missingness, types, and summary metrics.
# Exports data/processed/data_audit_summary.json and updates docs/DATA_DICTIONARY.md.

suppressPackageStartupMessages({
  library(readr)
  library(dplyr)
  library(arrow)
  library(jsonlite)
})

message("==> Starting Phase 2: Data Audit (01_audit_data.R)...")

dir.create("data/processed", showWarnings = FALSE, recursive = TRUE)
dir.create("docs", showWarnings = FALSE, recursive = TRUE)

audit_column <- function(vec, col_name) {
  n_total <- length(vec)
  n_na <- sum(is.na(vec) | as.character(vec) == "" | as.character(vec) == "NA")
  pct_na <- round((n_na / n_total) * 100, 2)
  col_type <- class(vec)[1]
  
  unique_sample <- head(unique(na.omit(vec)), 3)
  sample_str <- paste(as.character(unique_sample), collapse = ", ")
  
  list(
    column_name = col_name,
    data_type = col_type,
    total_records = n_total,
    na_count = n_na,
    na_percentage = pct_na,
    sample_values = sample_str
  )
}

audit_df <- function(df, dataset_name, file_path) {
  cols <- colnames(df)
  col_audits <- lapply(cols, function(col) audit_column(df[[col]], col))
  
  list(
    dataset_name = dataset_name,
    file_path = file_path,
    total_rows = nrow(df),
    total_columns = ncol(df),
    columns = col_audits
  )
}

# 1. Audit Spotify 2023 Tracks
sp2023_path <- "data/raw/spotify_2023_tracks.csv"
if (!file.exists(sp2023_path)) stop(paste("File missing:", sp2023_path))

sp2023_df <- read_csv(sp2023_path, show_col_types = FALSE, guess_max = 2000)
audit_sp2023 <- audit_df(sp2023_df, "Spotify Most Streamed Songs 2023", sp2023_path)
message(sprintf("Audited Spotify 2023: %d rows, %d columns", audit_sp2023$total_rows, audit_sp2023$total_columns))

# 2. Audit Spotify Historical Charts (sample first 100,000 rows for memory safety)
chart_path <- "data/raw/spotify_chart_historical.csv"
if (!file.exists(chart_path)) stop(paste("File missing:", chart_path))

chart_df <- read_csv(chart_path, n_max = 100000, show_col_types = FALSE)
audit_chart <- audit_df(chart_df, "Spotify Historical Charts (Sample)", chart_path)
message(sprintf("Audited Spotify Charts Sample: %d rows, %d columns", audit_chart$total_rows, audit_chart$total_columns))

# 3. Audit Last.fm Listening Events Parquet
lastfm_path <- "data/raw/lastfm_listening_sample.parquet"
if (!file.exists(lastfm_path)) stop(paste("File missing:", lastfm_path))

lastfm_df <- read_parquet(lastfm_path)
audit_lastfm <- audit_df(lastfm_df, "Last.fm 1K User Listening Events (Sample)", lastfm_path)
message(sprintf("Audited Last.fm Sample: %d rows, %d columns", audit_lastfm$total_rows, audit_lastfm$total_columns))

# Combine and export to JSON
combined_audit <- list(
  generated_at = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC", tz = "UTC"),
  datasets = list(
    spotify_2023 = audit_sp2023,
    spotify_charts = audit_chart,
    lastfm_listening = audit_lastfm
  )
)

out_json_path <- "data/processed/data_audit_summary.json"
write_json(combined_audit, out_json_path, pretty = TRUE, auto_unbox = TRUE)
message(sprintf("Saved audit summary to %s", out_json_path))

# Generate docs/DATA_DICTIONARY.md
md_lines <- c(
  "# Data Dictionary: Spotify Listener Behaviour and Release Window Datasets",
  "",
  paste("**Generated automatically by:** `analysis/01_audit_data.R`  "),
  paste("**Timestamp:**", combined_audit$generated_at),
  "",
  "---",
  "",
  "## 1. Spotify Most Streamed Songs 2023 (`spotify_2023_tracks.csv`)",
  "",
  paste("- **Source:** Kaggle (`nelgiriyewithana/top-spotify-songs-2023`)"),
  paste("- **Total Records:**", audit_sp2023$total_rows),
  paste("- **Total Columns:**", audit_sp2023$total_columns),
  "",
  "| Column Name | Data Type | NA Count | NA % | Sample Values | Description / Operational Role |",
  "| :--- | :--- | :--- | :--- | :--- | :--- |"
)

for (c in audit_sp2023$columns) {
  desc <- switch(c$column_name,
    "track_name" = "Track title as listed on Spotify.",
    "artist(s)_name" = "Name of performing artist(s).",
    "artist_count" = "Number of contributing artists.",
    "released_year" = "Year track was released.",
    "released_month" = "Month track was released (1-12).",
    "released_day" = "Day of the month track was released (1-31).",
    "in_spotify_playlists" = "Number of Spotify playlists featuring the song.",
    "in_spotify_charts" = "Rank/presence in Spotify charts.",
    "streams" = "Total cumulative stream count (requires type cleaning).",
    "bpm" = "Tempo in beats per minute.",
    "danceability_%" = "Danceability index (0-100%).",
    "valence_%" = "Musical positiveness/valence (0-100%).",
    "energy_%" = "Energy level of audio (0-100%).",
    "Primary feature / audio descriptor."
  )
  md_lines <- c(md_lines, sprintf("| `%s` | `%s` | %d | %.1f%% | `%s` | %s |",
                                  c$column_name, c$data_type, c$na_count, c$na_percentage, substr(c$sample_values, 1, 30), desc))
}

md_lines <- c(
  md_lines,
  "",
  "### Important Caveats for `spotify_2023_tracks.csv`:",
  "1. **No Hourly Release Stamp:** Only `released_year`, `released_month`, and `released_day` are present.",
  "2. **No Genre Column:** The dataset does not contain an explicit genre classification.",
  "3. **Streams String Coercion:** Some rows contain invalid characters in `streams` requiring regex cleaning.",
  "",
  "---",
  "",
  "## 2. Spotify Historical Charts (`spotify_chart_historical.csv`)",
  "",
  paste("- **Source:** Kaggle (`jfreyberg/spotify-chart-data`)"),
  paste("- **Sampled Records:**", audit_chart$total_rows),
  paste("- **Total Columns:**", audit_chart$total_columns),
  "",
  "| Column Name | Data Type | NA Count | NA % | Sample Values |",
  "| :--- | :--- | :--- | :--- | :--- |"
)

for (c in audit_chart$columns) {
  md_lines <- c(md_lines, sprintf("| `%s` | `%s` | %d | %.1f%% | `%s` |",
                                  c$column_name, c$data_type, c$na_count, c$na_percentage, substr(c$sample_values, 1, 30)))
}

md_lines <- c(
  md_lines,
  "",
  "---",
  "",
  "## 3. Last.fm 1K User Listening Events (`lastfm_listening_sample.parquet`)",
  "",
  paste("- **Source:** Last.fm 1K User Listening Corpus"),
  paste("- **Sampled Events:**", audit_lastfm$total_rows),
  paste("- **Total Columns:**", audit_lastfm$total_columns),
  "",
  "| Column Name | Data Type | NA Count | NA % | Sample Values | Description |",
  "| :--- | :--- | :--- | :--- | :--- | :--- |"
)

for (c in audit_lastfm$columns) {
  desc <- switch(c$column_name,
    "user_id" = "Anonymized user identifier.",
    "timestamp" = "Timestamp in UTC timezone (microsecond precision).",
    "artist_id" = "MusicBrainz Artist ID if matched.",
    "artist_name" = "Artist name string.",
    "track_id" = "MusicBrainz Track ID if matched.",
    "track_name" = "Track title string.",
    "Metadata attribute."
  )
  md_lines <- c(md_lines, sprintf("| `%s` | `%s` | %d | %.1f%% | `%s` | %s |",
                                  c$column_name, c$data_type, c$na_count, c$na_percentage, substr(c$sample_values, 1, 30), desc))
}

writeLines(md_lines, "docs/DATA_DICTIONARY.md")
message("Generated docs/DATA_DICTIONARY.md successfully.")
message("==> Phase 2: 01_audit_data.R Complete.")
