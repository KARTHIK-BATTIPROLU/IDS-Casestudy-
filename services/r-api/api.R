# services/r-api/api.R
# R Plumber API Service for Spotify Listener Behaviour and Release Window Advisor

suppressPackageStartupMessages({
  library(plumber)
  library(jsonlite)
  library(readr)
})

# Source internal modules
source("R/validator.R")
source("R/stats.R")
source("R/scoring.R")

#* @apiTitle Spotify Listener Behaviour & Release Window Advisor API
#* @apiDescription R Plumber Analytical Engine powering release timing decisions, parametric CIs, ANOVA, and custom artist catalog analysis.
#* @apiVersion 1.0.0

# CORS Filter
#* @filter cors
function(req, res) {
  res$setHeader("Access-Control-Allow-Origin", "*")
  res$setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
  res$setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-KEY")
  
  if (req$REQUEST_METHOD == "OPTIONS") {
    res$status <- 200
    return(list())
  }
  
  plumber::forward()
}

# API Key Authentication Filter (Active if API_SECRET_KEY is defined)
#* @filter auth
function(req, res) {
  expected_key <- Sys.getenv("API_SECRET_KEY", "")
  
  # Skip auth on health and metadata endpoints
  if (req$PATH_INFO %in% c("/health", "/metadata", "/")) {
    return(plumber::forward())
  }
  
  if (nchar(expected_key) > 0) {
    provided_key <- req$HTTP_X_API_KEY %||% ""
    if (nchar(provided_key) == 0 && !is.null(req$HTTP_AUTHORIZATION)) {
      auth_header <- req$HTTP_AUTHORIZATION
      if (grepl("^Bearer ", auth_header)) {
        provided_key <- sub("^Bearer ", "", auth_header)
      }
    }
    
    if (provided_key != expected_key) {
      res$status <- 401
      return(list(
        success = FALSE,
        error = "Unauthorized. Invalid or missing X-API-KEY shared secret."
      ))
    }
  }
  
  plumber::forward()
}

#* Check analytical engine status and R environment
#* @get /health
function() {
  list(
    status = "healthy",
    service = "spotify-ids-r-api",
    r_version = R.version.string,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC", tz = "UTC"),
    system = Sys.info()[["sysname"]]
  )
}

#* Retrieve service metadata, supported schemas, and analytical thresholds
#* @get /metadata
function() {
  list(
    service_name = "Spotify Listener Behaviour Analysis & Optimal Release-Window Advisor",
    engine = "R Plumber",
    required_columns = list(
      date = "Release date (ISO YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY)",
      metric = "Performance outcome (streams, listeners, or plays)"
    ),
    optional_columns = list(
      title = "Track title",
      time = "Release hour/time (e.g. 14:00, 00:00)",
      genre = "Genre classification",
      market = "Target country/market"
    ),
    sample_size_tiers = list(
      insufficient = "N < 5 (Statistical ranking withheld to protect against specious inferences)",
      small = "5 <= N < 20 (Robust non-parametric medians with uncertainty penalty)",
      robust = "N >= 20 (Parametric 95% CIs and ANOVA/Kruskal-Wallis testing)"
    ),
    default_heuristic_weights = list(
      activity_weight = 0.45,
      performance_weight = 0.35,
      congestion_penalty = 0.20
    ),
    privacy_policy = "Private, in-memory processing only. User CSV data is never persisted to disk or permanent databases."
  )
}

#* Analyze artist CSV release history and compute optimal release windows
#* @post /analyze
function(req, res) {
  raw_body <- req$postBody
  csv_text <- NULL
  column_mapping <- list()
  weights <- list(activity = 0.45, performance = 0.35, congestion = 0.20)
  
  # Check if JSON payload or multipart
  if (!is.null(raw_body) && nchar(raw_body) > 0) {
    parsed_json <- tryCatch(fromJSON(raw_body), error = function(e) NULL)
    if (!is.null(parsed_json) && is.list(parsed_json)) {
      csv_text <- parsed_json$csv_text
      if (!is.null(parsed_json$column_mapping)) column_mapping <- parsed_json$column_mapping
      if (!is.null(parsed_json$weights)) weights <- parsed_json$weights
    } else {
      # Fallback to direct raw text
      csv_text <- raw_body
    }
  }
  
  # Multipart form upload support
  if (is.null(csv_text) || nchar(str_trim(csv_text)) == 0) {
    if (!is.null(req$body) && is.list(req$body)) {
      if (!is.null(req$body$file)) {
        csv_text <- req$body$file
      } else if (!is.null(req$body$csv_text)) {
        csv_text <- req$body$csv_text
      }
    }
  }
  
  if (is.null(csv_text) || nchar(str_trim(csv_text)) == 0) {
    res$status <- 400
    return(list(
      success = FALSE,
      error = "Missing CSV data. Provide 'csv_text' in JSON body or upload a CSV file."
    ))
  }
  
  # Step 1: In-memory Validation & Parsing
  val_res <- validate_and_parse_upload(csv_text, column_mapping)
  if (!val_res$valid) {
    res$status <- 400
    return(list(
      success = FALSE,
      error = val_res$error
    ))
  }
  
  # Step 2: Statistical Computations (CIs, ANOVA, Medians)
  stats_res <- compute_user_release_stats(val_res$data, val_res$sample_tier)
  
  # Step 3: Heuristic Release-Window Ranking & Uncertainty Assessment
  scoring_res <- rank_release_windows(stats_res, weights)
  
  # Step 4: Assemble Analytical Output
  res$status <- 200
  list(
    success = TRUE,
    timestamp = format(Sys.time(), "%Y-%m-%d %H:%M:%S UTC", tz = "UTC"),
    validation = list(
      total_rows_received = val_res$total_rows,
      valid_analyzed_rows = val_res$valid_rows,
      dropped_invalid_rows = val_res$dropped_rows,
      sample_tier = val_res$sample_tier,
      detected_columns = val_res$detected_columns
    ),
    statistics = list(
      sample_size = stats_res$total_valid_releases,
      weekday_summary = stats_res$weekday_stats,
      hypothesis_testing = stats_res$hypothesis_testing,
      has_hourly_data = stats_res$has_hourly_data,
      hourly_summary = stats_res$hourly_stats
    ),
    advisory = list(
      eligible_for_ranking = scoring_res$eligible_for_ranking,
      warning_banner = scoring_res$warning_banner,
      confidence_tier = scoring_res$confidence_tier,
      uncertainty_note = scoring_res$uncertainty_note,
      scoring_weights = scoring_res$scoring_weights,
      top_recommendations = scoring_res$top_recommendations
    ),
    caveats = list(
      editorial_schedule = "Friday releases capture New Music Friday editorial inclusion but compete against highest global release density.",
      sample_size_reminder = sprintf("Analytical confidence is conditioned on your catalog size of N=%d tracks.", val_res$valid_rows),
      disclaimer = "Statistical decision-support tool. Streaming outcomes remain influenced by external marketing, sonic quality, and curator decisions."
    )
  )
}
