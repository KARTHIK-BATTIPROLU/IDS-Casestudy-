# analysis/05_advisor_scoring.R
# Release-Window Advisory Algorithm & Candidate Ranking
# Combines listening activity, historical performance, and congestion penalties into transparent scores.
# Exports data/processed/baseline_recommendations.json and creates apps/web/public/templates/sample_artist_releases.csv.

suppressPackageStartupMessages({
  library(jsonlite)
  library(dplyr)
  library(readr)
})

message("==> Starting Phase 2: Advisor Scoring (05_advisor_scoring.R)...")

# Load baseline processed datasets
listening_data <- fromJSON("data/processed/hourly_listening_summary.json")
performance_data <- fromJSON("data/processed/release_weekday_summary.json")

grid <- as.data.frame(listening_data$heatmap_grid)
weekday_stats <- as.data.frame(performance_data$weekday_metrics)

# Normalize activity score (0-100)
min_activity <- min(grid$share_pct)
max_activity <- max(grid$share_pct)
grid$activity_score <- round(((grid$share_pct - min_activity) / (max_activity - min_activity)) * 100, 1)

# Normalize performance score (0-100) based on median streams
min_perf <- min(weekday_stats$median_streams)
max_perf <- max(weekday_stats$median_streams)
weekday_stats$perf_score <- round(((weekday_stats$median_streams - min_perf) / (max_perf - min_perf)) * 100, 1)

# Congestion score calculation (0-100)
# Friday releases dominate ~55% of all releases, with midnight and morning being peak drop times
grid <- grid %>%
  left_join(weekday_stats %>% select(weekday, perf_score, median_streams, n_tracks, share_of_releases_pct), by = "weekday") %>%
  mutate(
    congestion_score = case_when(
      weekday == "Friday" & hour %in% c(0, 1, 2, 3, 4, 5) ~ 100.0,
      weekday == "Friday" & hour %in% 6:12 ~ 85.0,
      weekday == "Friday" ~ 70.0,
      weekday == "Thursday" & hour >= 18 ~ 60.0,
      weekday == "Thursday" ~ 40.0,
      weekday %in% c("Wednesday", "Tuesday") ~ 25.0,
      TRUE ~ 15.0
    )
  )

# Default Heuristic Weights:
# Activity: 0.45, Historical Performance: 0.35, Congestion Penalty: 0.20
w_act <- 0.45
w_perf <- 0.35
w_cong <- 0.20

scored_windows <- grid %>%
  mutate(
    composite_score = round(
      (w_act * activity_score) + (w_perf * perf_score) - (w_cong * congestion_score),
      1
    )
  ) %>%
  arrange(desc(composite_score)) %>%
  mutate(
    rank = row_number(),
    window_label = sprintf("%s %02d:00 - %02d:00 UTC", weekday, hour, (hour + 1) %% 24),
    recommendation_tier = case_when(
      rank <= 5 ~ "Top Recommended",
      rank <= 20 ~ "Strong Alternative",
      rank <= 60 ~ "Viable Window",
      TRUE ~ "High Congestion / Low Activity"
    ),
    caveat = case_when(
      weekday == "Friday" ~ "High editorial playlist visibility (New Music Friday), but faces maximum global competition.",
      weekday %in% c("Tuesday", "Wednesday") ~ "High listening engagement with significantly lower release congestion.",
      weekday %in% c("Saturday", "Sunday") ~ "Weekend listening activity is strong, but industry curator coverage is lower.",
      TRUE ~ "Standard weekday window."
    )
  )

# Top 20 Candidate Windows for Baseline Export
top_windows <- head(scored_windows, 20)

advisor_output <- list(
  generated_at = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC", tz = "UTC"),
  scoring_weights = list(activity = w_act, performance = w_perf, congestion_penalty = w_cong),
  total_candidate_windows = nrow(scored_windows),
  top_recommendations = top_windows,
  all_windows = scored_windows
)

write_json(advisor_output, "data/processed/baseline_recommendations.json", pretty = TRUE, auto_unbox = TRUE)
message("Saved baseline recommendations to data/processed/baseline_recommendations.json")

# Generate Downloadable Sample CSV for Users (Phase 4 Page 4 requirement)
dir.create("apps/web/public/templates", showWarnings = FALSE, recursive = TRUE)

sample_user_releases <- data.frame(
  track_title = c(
    "Midnight Echoes", "Neon Skyline", "Velvet Waves", "Urban Solitude",
    "Golden Horizon", "Electric Pulse", "Autumn Chill", "Starlight Memory",
    "Lost in Tokyo", "Retrograde Drift", "Prism Glow", "Summer Breeze",
    "Parallel Dimensions", "Cyber City", "Silver Lining", "Deep Blue",
    "Cosmic Voyage", "Dawn Patrol", "Echo Valley", "Solstice Dreams",
    "Aurora Nights", "Shadow Dance"
  ),
  release_date = c(
    "2023-01-13", "2023-02-17", "2023-03-14", "2023-04-05",
    "2023-04-28", "2023-05-19", "2023-06-06", "2023-06-21",
    "2023-07-07", "2023-07-25", "2023-08-11", "2023-08-30",
    "2023-09-15", "2023-10-03", "2023-10-20", "2023-11-08",
    "2023-11-24", "2023-12-05", "2023-12-22", "2024-01-12",
    "2024-02-02", "2024-02-27"
  ),
  release_time = c(
    "00:00", "00:00", "14:00", "16:00",
    "00:00", "00:00", "15:00", "17:00",
    "00:00", "14:30", "00:00", "16:00",
    "00:00", "15:00", "00:00", "14:00",
    "00:00", "16:30", "00:00", "00:00",
    "00:00", "15:00"
  ),
  streams_first_28d = c(
    184500, 245000, 312000, 289000,
    198000, 215000, 340000, 295000,
    176000, 325000, 210000, 360000,
    189000, 310000, 205000, 275000,
    192000, 335000, 220000, 185000,
    195000, 315000
  ),
  genre = c(
    "Indie Pop", "Synthwave", "Indie Pop", "Lo-Fi",
    "Synthwave", "Synthwave", "Lo-Fi", "Indie Pop",
    "Synthwave", "Lo-Fi", "Indie Pop", "Indie Pop",
    "Synthwave", "Cyberpunk", "Indie Pop", "Lo-Fi",
    "Synthwave", "Indie Pop", "Indie Pop", "Synthwave",
    "Synthwave", "Lo-Fi"
  ),
  target_market = c(
    "Global", "US", "UK", "Global",
    "US", "Global", "UK", "Global",
    "US", "Global", "Global", "US",
    "Global", "US", "UK", "Global",
    "US", "UK", "Global", "US",
    "Global", "Global"
  ),
  stringsAsFactors = FALSE
)

sample_csv_path <- "apps/web/public/templates/sample_artist_releases.csv"
write_csv(sample_user_releases, sample_csv_path)
message(sprintf("Generated sample user CSV at %s (%d rows)", sample_csv_path, nrow(sample_user_releases)))

# Also create fixture files for R tests in services/r-api/tests/testthat/fixtures/
fixtures_dir <- "services/r-api/tests/testthat/fixtures"
dir.create(fixtures_dir, showWarnings = FALSE, recursive = TRUE)

write_csv(sample_user_releases, file.path(fixtures_dir, "valid_artist_releases.csv"))
write_csv(head(sample_user_releases, 4), file.path(fixtures_dir, "minimal_releases.csv")) # N < 5 test

malformed_df <- sample_user_releases
malformed_df$release_date[1:3] <- c("not-a-date", "invalid_day", "2023-99-99")
write_csv(malformed_df, file.path(fixtures_dir, "malformed_dates.csv"))

missing_cols_df <- sample_user_releases[, c("track_title", "genre")]
write_csv(missing_cols_df, file.path(fixtures_dir, "missing_columns.csv"))

message("Saved test fixtures to services/r-api/tests/testthat/fixtures/")
message("==> Phase 2: 05_advisor_scoring.R Complete.")
