// test_e2e_route.mjs
// End-to-end integration test for Rscript analytical execution via Next.js route logic
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import os from "os";

console.log("==> Running End-to-End Route Integration Tests");

const workspaceRoot = process.cwd();
const rDir = path.join(workspaceRoot, "services", "r-api");
const sampleCsvPath = path.join(workspaceRoot, "apps", "web", "public", "templates", "sample_artist_releases.csv");
const sampleCsv = fs.readFileSync(sampleCsvPath, "utf8");

const runRAnalysis = (csvText, columnMapping = {}, weights = { activity: 0.45, performance: 0.35, congestion: 0.20 }) => {
  const osTmp = os.tmpdir();
  const randId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const tmpInputPath = path.join(osTmp, `e2e_input_${randId}.json`);
  const tmpScriptPath = path.join(osTmp, `e2e_runner_${randId}.R`);

  fs.writeFileSync(
    tmpInputPath,
    JSON.stringify({
      csv_text: csvText,
      column_mapping: columnMapping,
      weights,
    }),
    "utf8"
  );

  const rScriptCode = `
    suppressPackageStartupMessages({
      library(jsonlite)
    })
    setwd("${rDir.replace(/\\/g, "/")}")
    source("R/validator.R")
    source("R/stats.R")
    source("R/scoring.R")
    
    input <- fromJSON("${tmpInputPath.replace(/\\/g, "/")}")
    val_res <- validate_and_parse_upload(input$csv_text, input$column_mapping)
    if (!val_res$valid) {
      cat(toJSON(list(success = FALSE, error = val_res$error), auto_unbox = TRUE))
      quit(save = "no", status = 0)
    }
    stats_res <- compute_user_release_stats(val_res$data, val_res$sample_tier)
    scoring_res <- rank_release_windows(stats_res, input$weights)
    
    output <- list(
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
      engine = "Rscript (Direct In-Memory Engine)"
    )
    cat(toJSON(output, auto_unbox = TRUE))
  `;

  fs.writeFileSync(tmpScriptPath, rScriptCode, "utf8");

  try {
    const stdout = execFileSync("Rscript", [tmpScriptPath], {
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
    });
    fs.unlinkSync(tmpInputPath);
    fs.unlinkSync(tmpScriptPath);
    return JSON.parse(stdout.trim());
  } catch (err) {
    try { fs.unlinkSync(tmpInputPath); } catch {}
    try { fs.unlinkSync(tmpScriptPath); } catch {}
    throw err;
  }
};

// Test 1: 22-track sample dataset
console.log("Test 1: Running 22-track sample CSV analysis...");
const res1 = runRAnalysis(sampleCsv);
if (!res1.success) throw new Error("Test 1 failed: " + res1.error);
if (res1.validation.valid_analyzed_rows !== 22) throw new Error("Test 1 row count mismatch: " + res1.validation.valid_analyzed_rows);
if (res1.validation.sample_tier !== "robust") throw new Error("Test 1 tier mismatch: " + res1.validation.sample_tier);
if (!res1.advisory.eligible_for_ranking) throw new Error("Test 1 not eligible for ranking");
if (!res1.advisory.top_recommendations || res1.advisory.top_recommendations.length < 5) throw new Error("Test 1 recommendations empty");
console.log("✔ Test 1 passed: 22 tracks analyzed, tier 'robust', top recommendation:", res1.advisory.top_recommendations[0].window_label);

// Test 2: Non-standard dates and AM/PM times
console.log("Test 2: Running mixed date formats and AM/PM times...");
const customCsv = `title,release_date,release_time,streams
Track A,2023-01-13,02:00 PM,150000
Track B,14/01/2023,12:00 AM,85000
Track C,44941,16:00,120000
Track D,2023-01-16,09:30 AM,95000
Track E,17/01/2023,11:00 PM,110000
Track F,2023-01-18,03:00 PM,105000`;

const res2 = runRAnalysis(customCsv, { date: "release_date", metric: "streams", time: "release_time" });
if (!res2.success) throw new Error("Test 2 failed: " + res2.error);
if (res2.validation.valid_analyzed_rows !== 6) throw new Error("Test 2 row count mismatch: " + res2.validation.valid_analyzed_rows);
if (res2.validation.sample_tier !== "small") throw new Error("Test 2 tier mismatch: " + res2.validation.sample_tier);
if (!res2.statistics.has_hourly_data) throw new Error("Test 2 hourly data not detected");
console.log("✔ Test 2 passed: 6 tracks parsed with mixed dates/times, tier 'small'");

// Test 3: Invalid data handling
console.log("Test 3: Checking error handling on bad CSV...");
const badCsv = `col_a,col_b\n1,2\n3,4`;
const res3 = runRAnalysis(badCsv);
if (res3.success !== false) throw new Error("Test 3 should have failed but succeeded");
console.log("✔ Test 3 passed: Correctly rejected CSV with missing date/metric columns:", res3.error);

console.log("\nAll End-to-End Route Integration Tests Passed Successfully! 🎉");
