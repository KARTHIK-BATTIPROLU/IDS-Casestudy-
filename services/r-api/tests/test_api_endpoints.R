# services/r-api/tests/test_api_endpoints.R
# Integration test for Plumber API endpoints

suppressPackageStartupMessages({
  library(testthat)
  library(plumber)
  library(jsonlite)
})

# Change working directory to services/r-api
if (basename(getwd()) == "Spotify IDS") {
  setwd("services/r-api")
} else if (basename(getwd()) == "tests") {
  setwd("..")
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

message("API integration tests passed successfully!")
