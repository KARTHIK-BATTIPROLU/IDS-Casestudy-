# services/r-api/tests/testthat/test-stats.R
library(testthat)

# Load dependencies
source("../../R/validator.R")
source("../../R/stats.R")

test_that("compute_user_release_stats calculates parametric and non-parametric metrics", {
  fixture_path <- "fixtures/valid_artist_releases.csv"
  csv_content <- readChar(fixture_path, file.info(fixture_path)$size)
  val_res <- validate_and_parse_upload(csv_content)
  
  stats_res <- compute_user_release_stats(val_res$data, val_res$sample_tier)
  
  expect_equal(stats_res$total_valid_releases, 22)
  expect_equal(stats_res$sample_tier, "robust")
  
  # Ensure all 7 weekdays are present
  expect_equal(nrow(stats_res$weekday_stats), 7)
  expect_true(all(c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday") %in% stats_res$weekday_stats$weekday))
  
  # Check 95% confidence intervals are non-null for active weekdays
  friday_stat <- stats_res$weekday_stats[stats_res$weekday_stats$weekday == "Friday", ]
  expect_gt(friday_stat$count, 0)
  expect_gt(friday_stat$mean_val, 0)
  expect_gt(friday_stat$median_val, 0)
  expect_lte(friday_stat$ci_lower_95, friday_stat$mean_val)
  expect_gte(friday_stat$ci_upper_95, friday_stat$mean_val)
})

test_that("compute_user_release_stats handles single-observation groups safely", {
  single_row_df <- data.frame(
    release_date = as.Date("2023-01-13"),
    metric_value = 50000,
    weekday = factor("Friday", levels = c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")),
    stringsAsFactors = FALSE
  )
  
  stats_res <- compute_user_release_stats(single_row_df, "insufficient")
  expect_equal(stats_res$total_valid_releases, 1)
  expect_equal(nrow(stats_res$weekday_stats), 7)
  
  friday_stat <- stats_res$weekday_stats[stats_res$weekday_stats$weekday == "Friday", ]
  expect_equal(friday_stat$count, 1)
  expect_equal(friday_stat$sd_val, 0)
  expect_equal(friday_stat$ci_lower_95, 50000)
  expect_equal(friday_stat$ci_upper_95, 50000)
})

test_that("compute_user_release_stats executes hypothesis tests when N >= 20", {
  fixture_path <- "fixtures/valid_artist_releases.csv"
  csv_content <- readChar(fixture_path, file.info(fixture_path)$size)
  val_res <- validate_and_parse_upload(csv_content)
  
  stats_res <- compute_user_release_stats(val_res$data, val_res$sample_tier)
  
  expect_false(is.null(stats_res$hypothesis_testing))
  expect_false(is.null(stats_res$hypothesis_testing$kruskal_wallis))
  expect_true("p_value" %in% names(stats_res$hypothesis_testing$kruskal_wallis))
})
