# services/r-api/run_api.R
# Local and Production Plumber API server runner

suppressPackageStartupMessages({
  library(plumber)
})

# Change working directory to services/r-api if executed from root
if (basename(getwd()) == "Spotify IDS") {
  setwd("services/r-api")
}

port <- as.integer(Sys.getenv("PORT", "8000"))
host <- Sys.getenv("HOST", "0.0.0.0")

message(sprintf("Starting Spotify IDS R Plumber API on %s:%d ...", host, port))

pr <- plumb("api.R")
pr$run(host = host, port = port, swagger = TRUE)
