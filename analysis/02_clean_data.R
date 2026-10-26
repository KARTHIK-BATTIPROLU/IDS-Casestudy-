# analysis/02_clean_data.R
# Reproducible Data Cleaning and Transformation Script
# Parses release dates, cleans stream counts, computes track ages, and outputs standardized CSVs.

suppressPackageStartupMessages({
  library(readr)
  library(dplyr)
  library(lubridate)
  library(stringr)
  library(jsonlite)
})

message("==> Starting Phase 2: Data Cleaning (02_clean_data.R)...")

# 1. Clean Spotify 2023 Tracks
sp2023_path <- "data/raw/spotify_2023_tracks.csv"
raw_sp2023 <- read_csv(sp2023_path, show_col_types = FALSE)
initial_sp2023_rows <- nrow(raw_sp2023)

clean_sp2023 <- raw_sp2023 %>%
  # Filter out rows with non-numeric or malformed streams (e.g. row 575 which contains audio feature strings)
  mutate(
    streams_clean = suppressWarnings(as.numeric(as.character(streams))),
    # Construct release_date
    release_date = make_date(
      year = as.integer(released_year),
      month = as.integer(released_month),
      day = as.integer(released_day)
    )
  ) %>%
  filter(!is.na(streams_clean), !is.na(release_date), streams_clean > 0) %>%
  mutate(
    # Day of week (1 = Monday, ..., 7 = Sunday)
    weekday = factor(
      weekdays(release_date),
      levels = c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
    ),
    is_weekend = weekday %in% c("Saturday", "Sunday"),
    # Reference snapshot date: December 31, 2023
    track_age_days = as.numeric(as.Date("2023-12-31") - release_date),
    log_streams = log(streams_clean)
  ) %>%
  filter(track_age_days >= 0)

sp2023_clean_path <- "data/processed/clean_spotify_2023.csv"
write_csv(clean_sp2023, sp2023_clean_path)
message(sprintf("Cleaned Spotify 2023: retained %d of %d rows. Saved to %s",
                nrow(clean_sp2023), initial_sp2023_rows, sp2023_clean_path))

# 2. Clean Historical Charts (sample aggregation)
chart_path <- "data/raw/spotify_chart_historical.csv"
raw_chart <- read_csv(chart_path, n_max = 250000, show_col_types = FALSE)

clean_chart_summary <- raw_chart %>%
  filter(!is.na(streams), streams > 0, !is.na(date)) %>%
  mutate(
    weekday = factor(
      weekdays(as.Date(date)),
      levels = c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
    )
  ) %>%
  group_by(weekday, country) %>%
  summarise(
    total_streams = sum(as.numeric(streams), na.rm = TRUE),
    median_streams = median(as.numeric(streams), na.rm = TRUE),
    mean_streams = mean(as.numeric(streams), na.rm = TRUE),
    track_observations = n(),
    .groups = "drop"
  )

chart_clean_path <- "data/processed/clean_chart_summary.csv"
write_csv(clean_chart_summary, chart_clean_path)
message(sprintf("Cleaned Chart Summary: %d aggregated groups. Saved to %s",
                nrow(clean_chart_summary), chart_clean_path))

# 3. Output Cleaning Summary JSON
cleaning_summary <- list(
  timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC", tz = "UTC"),
  spotify_2023 = list(
    raw_rows = initial_sp2023_rows,
    clean_rows = nrow(clean_sp2023),
    dropped_rows = initial_sp2023_rows - nrow(clean_sp2023),
    weekday_distribution = as.list(table(clean_sp2023$weekday))
  ),
  chart_summary = list(
    sampled_rows = nrow(raw_chart),
    aggregated_cells = nrow(clean_chart_summary),
    countries_covered = length(unique(clean_chart_summary$country))
  )
)

write_json(cleaning_summary, "data/processed/cleaning_summary.json", pretty = TRUE, auto_unbox = TRUE)
message("Saved cleaning summary to data/processed/cleaning_summary.json")
message("==> Phase 2: 02_clean_data.R Complete.")
