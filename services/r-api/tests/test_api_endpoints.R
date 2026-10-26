# services/r-api/tests/test_api_endpoints.R
# Integration test for Plumber API endpoints

suppressPackageStartupMessages({
  library(testthat)
  library(plumber)
  library(jsonlite)
})

# Ensure working directory is services/r-api
if (file.exists("services/r-api/api.R")) {
  setwd("services/r-api")
} else if (file.exists("../api.R")) {
  setwd("..")
} else if (file.exists("api.R")) {
  # Already in services/r-api
}

pr <- plumb("api.R")

test_that("GET /health endpoint returns healthy status", {
  # Direct invocation of endpoint function
  endpoints <- pr$endpoints[[1]]
  health_ep <- NULL
  for (ep_list in pr$endpoints) {
    for (ep in ep_list) {
      if (ep$path == "/health" && ep$verbs == "GET") {
        health_ep <- ep
        break
      }
    }
  }
  expect_false(is.null(health_ep))
  mock_req <- list(PATH_INFO = "/health", REQUEST_METHOD = "GET")
  mock_res <- list(status = 200, setHeader = function(...) NULL)
  res <- health_ep$exec(mock_req, mock_res)
  expect_equal(res$status, "healthy")
  expect_equal(res$service, "spotify-ids-r-api")
  expect_true(!is.null(res$timestamp))
})

test_that("GET /metadata returns required schemas", {
  meta_ep <- NULL
  for (ep_list in pr$endpoints) {
    for (ep in ep_list) {
      if (ep$path == "/metadata" && ep$verbs == "GET") {
        meta_ep <- ep
        break
      }
    }
  }
  expect_false(is.null(meta_ep))
  mock_req <- list(PATH_INFO = "/metadata", REQUEST_METHOD = "GET")
  mock_res <- list(status = 200, setHeader = function(...) NULL)
  res <- meta_ep$exec(mock_req, mock_res)
  expect_equal(res$engine, "R Plumber")
  expect_true("required_columns" %in% names(res))
  expect_true("sample_size_tiers" %in% names(res))
})

test_that("POST /analyze handles valid JSON body", {
  analyze_ep <- NULL
  for (ep_list in pr$endpoints) {
    for (ep in ep_list) {
      if (ep$path == "/analyze" && ep$verbs == "POST") {
        analyze_ep <- ep
        break
      }
    }
  }
  expect_false(is.null(analyze_ep))
  
  fixture_path <- "tests/testthat/fixtures/valid_artist_releases.csv"
  csv_content <- readChar(fixture_path, file.info(fixture_path)$size)
  
  payload <- list(
    csv_text = csv_content,
    column_mapping = list(
      date = "release_date",
      metric = "streams_first_28d"
    ),
    weights = list(
      activity = 0.5,
      performance = 0.3,
      congestion = 0.2
    )
  )
  
  mock_req <- list(
    postBody = toJSON(payload, auto_unbox = TRUE)
  )
  mock_res <- list(
    status = 200,
    setHeader = function(...) NULL
  )
  
  result <- analyze_ep$exec(mock_req, mock_res)
  expect_true(result$success)
  expect_equal(result$validation$valid_analyzed_rows, 22)
  expect_equal(result$validation$sample_tier, "robust")
  expect_true(result$advisory$eligible_for_ranking)
  expect_gte(length(result$advisory$top_recommendations$rank), 5)
})

test_that("POST /analyze handles non-standard date formats and AM/PM time strings", {
  analyze_ep <- NULL
  for (ep_list in pr$endpoints) {
    for (ep in ep_list) {
      if (ep$path == "/analyze" && ep$verbs == "POST") {
        analyze_ep <- ep
        break
      }
    }
  }
  
  # CSV with mixed date styles (ISO, DMY, Excel serial) and AM/PM times
  custom_csv <- paste(
    "track_title,release_date,release_time,streams",
    "Track 1,2023-01-13,02:00 PM,120000",
    "Track 2,14/01/2023,12:00 AM,95000",
    "Track 3,44941,15:30,85000",
    "Track 4,2023-01-16,09:00 AM,110000",
    "Track 5,17/01/2023,11:30 PM,130000",
    "Track 6,2023-01-18,01:00 PM,75000",
    sep = "\n"
  )
  
  payload <- list(
    csv_text = custom_csv,
    column_mapping = list(
      title = "track_title",
      date = "release_date",
      time = "release_time",
      metric = "streams"
    )
  )
  
  mock_req <- list(
    postBody = toJSON(payload, auto_unbox = TRUE)
  )
  mock_res <- list(
    status = 200,
    setHeader = function(...) NULL
  )
  
  result <- analyze_ep$exec(mock_req, mock_res)
  expect_true(result$success)
  expect_equal(result$validation$valid_analyzed_rows, 6)
  expect_equal(result$validation$sample_tier, "small")
  expect_true(result$advisory$eligible_for_ranking)
  expect_true(result$statistics$has_hourly_data)
})

test_that("POST /analyze returns 400 on empty or invalid CSV text", {
  analyze_ep <- NULL
  for (ep_list in pr$endpoints) {
    for (ep in ep_list) {
      if (ep$path == "/analyze" && ep$verbs == "POST") {
        analyze_ep <- ep
        break
      }
    }
  }
  
  mock_req <- list(
    postBody = toJSON(list(csv_text = ""), auto_unbox = TRUE)
  )
  mock_res <- plumber:::PlumberResponse$new()
  
  result <- analyze_ep$exec(mock_req, mock_res)
  expect_false(result$success)
  expect_equal(mock_res$status, 400)
  expect_match(result$error, "Missing CSV data", ignore.case = TRUE)
})

message("API integration tests passed successfully!")
