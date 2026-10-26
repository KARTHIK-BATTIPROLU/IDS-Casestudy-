import { NextRequest, NextResponse } from "next/server";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { csv_text, column_mapping, weights } = body;

    if (!csv_text || typeof csv_text !== "string" || csv_text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Empty or invalid CSV text provided." },
        { status: 400 }
      );
    }

    const rApiUrl = process.env.R_API_URL || "http://localhost:8000";
    const apiKey = process.env.R_API_SECRET_KEY || "";

    // 1. First Attempt: Forward to the containerized R Plumber REST API service
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for Render cold start

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (apiKey) {
        headers["X-API-KEY"] = apiKey;
      }

      const rResponse = await fetch(`${rApiUrl}/analyze`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          csv_text,
          column_mapping: column_mapping || {},
          weights: weights || { activity: 0.45, performance: 0.35, congestion: 0.20 },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (rResponse.ok) {
        const data = await rResponse.json();
        return NextResponse.json(data);
      } else if (rResponse.status === 400) {
        const errorJson = await rResponse.json().catch(() => ({}));
        return NextResponse.json(
          { success: false, error: errorJson.error || "R analytical engine validation error." },
          { status: 400 }
        );
      }
    } catch (networkErr: any) {
      console.warn("R Plumber HTTP endpoint unavailable. Checking local Rscript engine fallback...", networkErr?.message);
    }

    // 2. Second Attempt: If R Plumber HTTP server is not active locally, execute directly via local Rscript
    // This guarantees R computes the analysis even during local development or when daemon is idle.
    const rscriptPaths = [
      "E:\\R\\R-4.6.1\\bin\\Rscript.exe",
      "Rscript",
    ];

    let foundRscript: string | null = null;
    for (const p of rscriptPaths) {
      try {
        if (p.includes("\\") ? fs.existsSync(p) : true) {
          foundRscript = p;
          break;
        }
      } catch {
        // continue
      }
    }

    if (foundRscript) {
      // Find workspace root
      const cwd = process.cwd();
      const workspaceRoot = cwd.includes("apps") ? path.resolve(cwd, "../..") : cwd;
      const rDir = path.join(workspaceRoot, "services", "r-api");

      // Write temporary payload safely for R execution
      const tmpInputPath = path.join(workspaceRoot, "data", "processed", `temp_input_${Date.now()}.json`);
      fs.writeFileSync(
        tmpInputPath,
        JSON.stringify({
          csv_text,
          column_mapping: column_mapping || {},
          weights: weights || { activity: 0.45, performance: 0.35, congestion: 0.20 },
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
          caveats = list(
            editorial_schedule = "Friday releases capture New Music Friday editorial inclusion but compete against highest global release density.",
            sample_size_reminder = sprintf("Analytical confidence is conditioned on your catalog size of N=%d tracks.", val_res$valid_rows),
            disclaimer = "Statistical decision-support tool. Streaming outcomes remain influenced by external marketing, sonic quality, and curator decisions."
          ),
          engine = "Rscript (Direct In-Memory Engine)"
        )
        cat(toJSON(output, auto_unbox = TRUE))
      `;

      const tmpScriptPath = path.join(workspaceRoot, "data", "processed", `temp_runner_${Date.now()}.R`);
      fs.writeFileSync(tmpScriptPath, rScriptCode, "utf8");

      try {
        const stdout = execFileSync(foundRscript, [tmpScriptPath], {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
        });

        // Clean temp files
        try { fs.unlinkSync(tmpInputPath); } catch {}
        try { fs.unlinkSync(tmpScriptPath); } catch {}

        const parsedOutput = JSON.parse(stdout.trim());
        if (!parsedOutput.success) {
          return NextResponse.json(parsedOutput, { status: 400 });
        }
        return NextResponse.json(parsedOutput);
      } catch (execErr: any) {
        try { fs.unlinkSync(tmpInputPath); } catch {}
        try { fs.unlinkSync(tmpScriptPath); } catch {}
        console.error("Local R execution error:", execErr);
        return NextResponse.json(
          {
            success: false,
            error: "Failed executing R data science calculations: " + (execErr?.message || "Execution error"),
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "R Plumber API is unreachable and local Rscript could not be detected. Ensure R API service is started.",
      },
      { status: 503 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
