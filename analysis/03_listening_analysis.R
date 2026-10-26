# analysis/03_listening_analysis.R
# Reproducible Hourly & Weekday Listening Activity Distribution Analysis
# Computes empirical listening matrices from the timestamped Last.fm corpus.
# Exports data/processed/hourly_listening_summary.json for the research dashboard and advisor.

suppressPackageStartupMessages({
  library(arrow)
  library(dplyr)
  library(lubridate)
  library(jsonlite)
  library(tidyr)
})

message("==> Starting Phase 2: Listening Analysis (03_listening_analysis.R)...")

parquet_path <- "data/raw/lastfm_listening_sample.parquet"
if (!file.exists(parquet_path)) stop(paste("File missing:", parquet_path))

events_df <- read_parquet(parquet_path)
total_events <- nrow(events_df)
message(sprintf("Loaded %d timestamped listening events.", total_events))

# Extract UTC weekday and hour
events_processed <- events_df %>%
  filter(!is.na(timestamp)) %>%
  mutate(
    utc_time = as.POSIXct(timestamp, tz = "UTC"),
    weekday = factor(
      weekdays(utc_time),
      levels = c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
    ),
    hour = as.integer(format(utc_time, "%H"))
  ) %>%
  filter(!is.na(weekday), !is.na(hour), hour >= 0, hour <= 23)

valid_events <- nrow(events_processed)

# 1. 168-cell matrix (Weekday x Hour)
grid_168 <- expand.grid(
  weekday = factor(c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
                   levels = c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")),
  hour = 0:23
)

matrix_counts <- events_processed %>%
  group_by(weekday, hour) %>%
  summarise(event_count = n(), .groups = "drop")

matrix_full <- grid_168 %>%
  left_join(matrix_counts, by = c("weekday", "hour")) %>%
  mutate(
    event_count = ifelse(is.na(event_count), 0, event_count),
    share_pct = round((event_count / valid_events) * 100, 4),
    # Index normalized to 100 as the average cell (1/168 = 0.5952%)
    activity_index = round((share_pct / (100 / 168)) * 100, 2)
  )

# 2. Hourly marginal distribution (0-23)
hourly_distribution <- events_processed %>%
  group_by(hour) %>%
  summarise(
    event_count = n(),
    share_pct = round((n() / valid_events) * 100, 3),
    .groups = "drop"
  ) %>%
  arrange(hour)

# 3. Weekday marginal distribution (Monday-Sunday)
weekday_distribution <- events_processed %>%
  group_by(weekday) %>%
  summarise(
    event_count = n(),
    share_pct = round((n() / valid_events) * 100, 3),
    .groups = "drop"
  )

# 4. Key Highlights & Insights
peak_cell <- matrix_full %>% arrange(desc(event_count)) %>% slice(1)
trough_cell <- matrix_full %>% arrange(event_count) %>% slice(1)
peak_hour <- hourly_distribution %>% arrange(desc(event_count)) %>% slice(1)
peak_weekday <- weekday_distribution %>% arrange(desc(event_count)) %>% slice(1)

summary_output <- list(
  generated_at = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC", tz = "UTC"),
  dataset_source = "Last.fm 1K User Listening Corpus (UTC Timestamps)",
  total_events_analyzed = valid_events,
  marginal_hourly = hourly_distribution,
  marginal_weekday = weekday_distribution,
  heatmap_grid = matrix_full,
  insights = list(
    peak_release_window = list(
      weekday = as.character(peak_cell$weekday),
      hour = peak_cell$hour,
      share_pct = peak_cell$share_pct,
      activity_index = peak_cell$activity_index
    ),
    lowest_activity_window = list(
      weekday = as.character(trough_cell$weekday),
      hour = trough_cell$hour,
      share_pct = trough_cell$share_pct,
      activity_index = trough_cell$activity_index
    ),
    peak_listening_hour = peak_hour$hour,
    peak_listening_weekday = as.character(peak_weekday$weekday)
  )
)

out_file <- "data/processed/hourly_listening_summary.json"
write_json(summary_output, out_file, pretty = TRUE, auto_unbox = TRUE)
message(sprintf("Successfully exported listening summary to %s", out_file))
message("==> Phase 2: 03_listening_analysis.R Complete.")
