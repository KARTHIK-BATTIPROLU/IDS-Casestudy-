# services/r-api/tests/testthat/test-validator.R
library(testthat)

# Load validator module
source("../../R/validator.R")

test_that("detect_csv_delimiter identifies common delimiters", {
  expect_equal(detect_csv_delimiter("col1,col2,col3\n1,2,3"), ",")
  expect_equal(detect_csv_delimiter("col1;col2;col3\n1;2;3"), ";")
  expect_equal(detect_csv_delimiter("col1\tcol2\tcol3\n1\t2\t3"), "\t")
  expect_equal(detect_csv_delimiter("col1|col2|col3\n1|2|3"), "|")
})

test_that("parse_flexible_date correctly parses multiple formats", {
  dates_iso <- c("2023-01-15", "2023-05-20", "2023-11-03")
  parsed_iso <- parse_flexible_date(dates_iso)
  expect_false(any(is.na(parsed_iso)))
  expect_equal(as.character(parsed_iso[1]), "2023-01-15")
  
  dates_dmy <- c("15/01/2023", "20/05/2023")
  parsed_dmy <- parse_flexible_date(dates_dmy)
  expect_false(any(is.na(parsed_dmy)))
  expect_equal(as.character(parsed_dmy[1]), "2023-01-15")
})

test_that("validate_and_parse_upload handles valid fixture cleanly", {
  fixture_path <- "fixtures/valid_artist_releases.csv"
  csv_content <- readChar(fixture_path, file.info(fixture_path)$size)
  
  res <- validate_and_parse_upload(csv_content)
  expect_true(res$valid)
  expect_null(res$error)
  expect_gte(res$valid_rows, 20)
  expect_equal(res$sample_tier, "robust")
  expect_true("release_date" %in% colnames(res$data))
  expect_true("metric_value" %in% colnames(res$data))
  expect_true("weekday" %in% colnames(res$data))
})

test_that("validate_and_parse_upload classifies N < 5 as insufficient", {
  fixture_path <- "fixtures/minimal_releases.csv"
  csv_content <- readChar(fixture_path, file.info(fixture_path)$size)
  
  res <- validate_and_parse_upload(csv_content)
  expect_true(res$valid)
  expect_equal(res$sample_tier, "insufficient")
  expect_equal(res$valid_rows, 4)
})

test_that("validate_and_parse_upload rejects empty or missing columns", {
  expect_false(validate_and_parse_upload("")$valid)
  expect_false(validate_and_parse_upload(NULL)$valid)
  
  fixture_path <- "fixtures/missing_columns.csv"
  csv_content <- readChar(fixture_path, file.info(fixture_path)$size)
  res <- validate_and_parse_upload(csv_content)
  expect_false(res$valid)
  expect_match(res$error, "Release Date|Performance Metric", ignore.case = TRUE)
})
