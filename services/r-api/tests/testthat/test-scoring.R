# services/r-api/tests/testthat/test-scoring.R
library(testthat)

# Load dependencies
source("../../R/validator.R")
source("../../R/stats.R")
source("../../R/scoring.R")

test_that("rank_release_windows blocks ranking when N < 5", {
  fixture_path <- "fixtures/minimal_releases.csv"
  csv_content <- readChar(fixture_path, file.info(fixture_path)$size)
  val_res <- validate_and_parse_upload(csv_content)
  stats_res <- compute_user_release_stats(val_res$data, val_res$sample_tier)
  
  ranking <- rank_release_windows(stats_res)
  
  expect_false(ranking$eligible_for_ranking)
  expect_match(ranking$warning_banner, "Insufficient Sample Size", ignore.case = TRUE)
  expect_equal(length(ranking$top_recommendations), 0)
})

test_that("rank_release_windows produces ranked windows when N >= 5", {
  fixture_path <- "fixtures/valid_artist_releases.csv"
  csv_content <- readChar(fixture_path, file.info(fixture_path)$size)
  val_res <- validate_and_parse_upload(csv_content)
  stats_res <- compute_user_release_stats(val_res$data, val_res$sample_tier)
  
  ranking <- rank_release_windows(stats_res)
  
  expect_true(ranking$eligible_for_ranking)
  expect_equal(ranking$sample_tier, "robust")
  expect_equal(ranking$confidence_tier, "High")
  expect_gte(length(ranking$top_recommendations$rank), 5)
  
  top_row <- ranking$top_recommendations[1, ]
  expect_true(!is.na(top_row$composite_score))
  expect_true(!is.na(top_row$window_label))
  expect_true(top_row$composite_score >= 0)
})
