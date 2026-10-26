# services/r-api/R/scoring.R
# Release-Window Ranking Algorithm and Uncertainty Quantification

suppressPackageStartupMessages({
  library(dplyr)
  library(jsonlite)
})

# Load or generate baseline listening grid
get_baseline_listening_grid <- function() {
  candidate_paths <- c(
    "data/processed/hourly_listening_summary.json",
    "../../data/processed/hourly_listening_summary.json",
    "../../../data/processed/hourly_listening_summary.json"
  )
  for (p in candidate_paths) {
    if (file.exists(p)) {
      d <- fromJSON(p)
      return(as.data.frame(d$heatmap_grid))
    }
  }
  
  # Fallback empirical matrix if file not found
  grid <- expand.grid(
    weekday = c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"),
    hour = 0:23
  )
  grid$share_pct <- 0.595 # Uniform fallback
  grid$activity_index <- 100
  return(grid)
}

rank_release_windows <- function(user_stats, weights = list(activity = 0.45, performance = 0.35, congestion = 0.20)) {
  sample_tier <- user_stats$sample_tier
  weekday_df <- user_stats$weekday_stats
  
  if (sample_tier == "insufficient") {
    return(list(
      eligible_for_ranking = FALSE,
      warning_banner = "Insufficient Sample Size (N < 5): We require at least 5 historical releases to compute statistical release windows. Showing exploratory catalog summary without ranking.",
      sample_size = user_stats$total_valid_releases,
      top_recommendations = list(),
      scoring_method = "descriptive_only"
    ))
  }
  
  grid <- get_baseline_listening_grid()
  
  # Normalize user weekday performance score (0-100)
  active_weekdays <- weekday_df %>% filter(count > 0)
  min_median <- if (nrow(active_weekdays) > 0) min(active_weekdays$median_val) else 0
  max_median <- if (nrow(active_weekdays) > 0) max(active_weekdays$median_val) else 1
  
  range_median <- max_median - min_median
  if (range_median == 0) range_median <- 1
  
  weekday_df <- weekday_df %>%
    mutate(
      user_perf_score = ifelse(count > 0, round(((median_val - min_median) / range_median) * 100, 1), 50.0)
    )
  
  # Normalize activity score (0-100)
  min_act <- min(grid$share_pct)
  max_act <- max(grid$share_pct)
  range_act <- if (max_act > min_act) max_act - min_act else 1
  grid$activity_score <- round(((grid$share_pct - min_act) / range_act) * 100, 1)
  
  # Calculate congestion penalty (0-100)
  grid <- grid %>%
    left_join(weekday_df %>% select(weekday, user_perf_score, median_val, count, ci_lower_95, ci_upper_95), by = "weekday") %>%
    mutate(
      congestion_score = case_when(
        weekday == "Friday" & hour %in% 0:5 ~ 100.0,
        weekday == "Friday" & hour %in% 6:12 ~ 85.0,
        weekday == "Friday" ~ 70.0,
        weekday == "Thursday" & hour >= 18 ~ 60.0,
        weekday == "Thursday" ~ 40.0,
        weekday %in% c("Wednesday", "Tuesday") ~ 25.0,
        TRUE ~ 15.0
      )
    )
  
  w_act <- weights$activity %||% 0.45
  w_perf <- weights$performance %||% 0.35
  w_cong <- weights$congestion %||% 0.20
  
  # Uncertainty adjustment factor based on sample size
  uncertainty_discount <- if (sample_tier == "small") 0.85 else 1.0
  
  scored_grid <- grid %>%
    mutate(
      raw_score = (w_act * activity_score) + (w_perf * user_perf_score) - (w_cong * congestion_score),
      composite_score = round(raw_score * uncertainty_discount, 1),
      confidence_label = if (sample_tier == "robust") {
        sprintf("High (N = %d releases in catalog)", user_stats$total_valid_releases)
      } else {
        sprintf("Moderate - Small Sample (N = %d releases, wider uncertainty)", user_stats$total_valid_releases)
      }
    ) %>%
    arrange(desc(composite_score)) %>%
    mutate(
      rank = row_number(),
      window_label = sprintf("%s %02d:00 - %02d:00 UTC", weekday, hour, (hour + 1) %% 24),
      tier = case_when(
        rank <= 3 ~ "Optimal Primary Window",
        rank <= 10 ~ "Strong Contender",
        rank <= 25 ~ "Viable Secondary",
        TRUE ~ "Higher Competition / Lower Demand"
      ),
      rationale = case_when(
        weekday == "Friday" ~ "High curator playlisting potential (New Music Friday), balanced against intense weekly saturation.",
        weekday %in% c("Tuesday", "Wednesday") ~ "Solid listening velocity with substantially lower competitor drop congestion.",
        weekday == "Thursday" ~ "Captures early weekend build-up before the Friday midnight flood.",
        TRUE ~ "Weekend leisure listening window."
      )
    )
  
  top_10 <- head(scored_grid, 10)
  
  return(list(
    eligible_for_ranking = TRUE,
    sample_size = user_stats$total_valid_releases,
    sample_tier = sample_tier,
    confidence_tier = if (sample_tier == "robust") "High" else "Moderate",
    uncertainty_note = if (sample_tier == "small") {
      "Note: Sample size between 5 and 19 releases. Results utilize robust non-parametric medians with an uncertainty discount factor."
    } else {
      "High statistical confidence: Sample size N >= 20 permits reliable parametric and non-parametric estimation."
    },
    scoring_weights = list(activity = w_act, performance = w_perf, congestion = w_cong),
    top_recommendations = top_10,
    all_candidate_windows = scored_grid
  ))
}

`%||%` <- function(a, b) {
  if (is.null(a) || is.na(a) || length(a) == 0) b else a
}
