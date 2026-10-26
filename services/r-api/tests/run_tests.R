# services/r-api/tests/run_tests.R
# Test runner executing all testthat suites

suppressPackageStartupMessages({
  library(testthat)
})

# Ensure we are in services/r-api/tests
if (dir.exists("services/r-api/tests")) {
  setwd("services/r-api/tests")
} else if (dir.exists("tests/testthat")) {
  setwd("tests")
} else if (file.exists("run_tests.R")) {
  # Already in tests directory
}

message("==> Running R Unit Tests via testthat in directory: ", getwd())
test_results <- test_dir("testthat", stop_on_failure = TRUE)

message("\nAll test suites completed successfully!")
