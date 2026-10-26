# services/r-api/R/validator.R
# CSV validation, delimiter detection, date parsing, and sample size tiering

suppressPackageStartupMessages({
  library(readr)
  library(lubridate)
  library(stringr)
})

detect_csv_delimiter <- function(text_snippet) {
  first_line <- strsplit(text_snippet, "[\r\n]+")[[1]][1]
  if (is.na(first_line) || nchar(first_line) == 0) return(",")
  
  commas <- str_count(first_line, ",")
  semicolons <- str_count(first_line, ";")
  tabs <- str_count(first_line, "\t")
  pipes <- str_count(first_line, "\\|")
  
  counts <- c("," = commas, ";" = semicolons, "\t" = tabs, "|" = pipes)
  best <- names(which.max(counts))
  if (counts[[best]] == 0) return(",")
  return(best)
}

parse_flexible_date <- function(date_vec) {
  if (is.null(date_vec) || length(date_vec) == 0) return(as.Date(character(0)))
  clean_str <- str_trim(as.character(date_vec))
  parsed <- rep(as.Date(NA), length(clean_str))
  
  # 1. Excel serial number dates (e.g. 44927 -> 2023-01-01)
  is_excel <- grepl("^[0-9]{4,5}$", clean_str)
  if (any(is_excel, na.rm = TRUE)) {
    nums <- suppressWarnings(as.numeric(clean_str[is_excel]))
    valid_nums <- !is.na(nums) & nums >= 20000 & nums <= 60000
    if (any(valid_nums)) {
      parsed[is_excel][valid_nums] <- as.Date(nums[valid_nums], origin = "1899-12-30")
    }
  }
  
  # 2. Vectorized multi-order date parsing via lubridate parse_date_time
  still_na <- is.na(parsed) & !is.na(clean_str) & clean_str != ""
  if (any(still_na)) {
    parsed_dt <- suppressWarnings(as.Date(parse_date_time(
      clean_str[still_na],
      orders = c("ymd", "dmy", "mdy", "Ymd HMS", "dmy HMS", "mdy HMS", "Ymd HM", "dmy HM", "mdy HM", "y-m-d", "d-m-y", "m-d-y"),
      quiet = TRUE
    )))
    parsed[still_na] <- parsed_dt
  }
  
  # 3. Individual fallback for remaining strings
  still_na <- is.na(parsed) & !is.na(clean_str) & clean_str != ""
  if (any(still_na)) {
    for (i in which(still_na)) {
      val <- clean_str[i]
      d <- suppressWarnings(ymd(val))
      if (is.na(d)) d <- suppressWarnings(dmy(val))
      if (is.na(d)) d <- suppressWarnings(mdy(val))
      if (is.na(d)) d <- suppressWarnings(as.Date(val))
      parsed[i] <- d
    }
  }
  
  return(parsed)
}

parse_flexible_time <- function(time_vec) {
  # Returns integer hour 0-23 or NA
  if (is.null(time_vec)) return(rep(NA_integer_, length(time_vec)))
  
  clean_str <- str_trim(as.character(time_vec))
  hours <- rep(NA_integer_, length(clean_str))
  
  for (i in seq_along(clean_str)) {
    val <- clean_str[i]
    if (is.na(val) || nchar(val) == 0) next
    
    # Handle 12-hour format with AM/PM (e.g., "02:00 PM", "2 PM", "12:00 AM")
    if (grepl("(?i)(am|pm)", val)) {
      is_pm <- grepl("(?i)pm", val)
      is_am <- grepl("(?i)am", val)
      h <- suppressWarnings(as.integer(str_extract(val, "^[0-9]{1,2}")))
      if (!is.na(h) && h >= 1 && h <= 12) {
        if (is_pm && h < 12) h <- h + 12
        if (is_am && h == 12) h <- 0
        hours[i] <- h
      }
    } else {
      # Handle 24-hour format (e.g. "14:00", "09:30:00", "14")
      h <- suppressWarnings(as.integer(str_extract(val, "^[0-9]{1,2}")))
      if (!is.na(h) && h >= 0 && h <= 23) {
        hours[i] <- h
      }
    }
  }
  return(hours)
}

validate_and_parse_upload <- function(raw_csv_text, column_mapping = list()) {
  if (is.null(raw_csv_text) || nchar(str_trim(raw_csv_text)) == 0) {
    return(list(
      valid = FALSE,
      error = "Empty CSV data provided. Please upload a file with valid headers and rows."
    ))
  }
  
  delim <- detect_csv_delimiter(raw_csv_text)
  
  # Read CSV in-memory with strict security (never saved to disk)
  df <- tryCatch({
    read_delim(
      file = I(raw_csv_text),
      delim = delim,
      show_col_types = FALSE,
      trim_ws = TRUE,
      name_repair = "unique"
    )
  }, error = function(e) {
    return(NULL)
  })
  
  if (is.null(df) || nrow(df) == 0) {
    return(list(
      valid = FALSE,
      error = "Failed to parse CSV table structure. Ensure valid delimiters and column headers."
    ))
  }
  
  raw_cols <- colnames(df)
  
  # Auto-resolve or apply mapping
  date_col <- column_mapping$date %||% grep("date|release.*date|day", raw_cols, ignore.case = TRUE, value = TRUE)[1]
  metric_col <- column_mapping$metric %||% grep("stream|plays|listeners|units|first_week", raw_cols, ignore.case = TRUE, value = TRUE)[1]
  title_col <- column_mapping$title %||% grep("title|track|song|name", raw_cols, ignore.case = TRUE, value = TRUE)[1]
  time_col <- column_mapping$time %||% grep("time|hour", raw_cols, ignore.case = TRUE, value = TRUE)[1]
  genre_col <- column_mapping$genre %||% grep("genre|category|style", raw_cols, ignore.case = TRUE, value = TRUE)[1]
  market_col <- column_mapping$market %||% grep("market|country|region", raw_cols, ignore.case = TRUE, value = TRUE)[1]
  
  if (is.na(date_col) || !(date_col %in% raw_cols)) {
    return(list(
      valid = FALSE,
      error = sprintf("Could not identify a Release Date column. Detected columns: [%s]. Please map the date column explicitly.",
                      paste(raw_cols, collapse = ", "))
    ))
  }
  
  if (is.na(metric_col) || !(metric_col %in% raw_cols)) {
    return(list(
      valid = FALSE,
      error = sprintf("Could not identify a Performance Metric (Streams/Plays) column. Detected columns: [%s]. Please map the metric column explicitly.",
                      paste(raw_cols, collapse = ", "))
    ))
  }
  
  # Clean and parse metrics
  metric_raw <- df[[metric_col]]
  clean_metric <- suppressWarnings(as.numeric(str_replace_all(as.character(metric_raw), "[^0-9.]", "")))
  
  # Parse dates
  clean_dates <- parse_flexible_date(df[[date_col]])
  
  # Filter valid rows
  valid_mask <- !is.na(clean_dates) & !is.na(clean_metric) & clean_metric >= 0
  
  parsed_df <- data.frame(
    release_date = clean_dates[valid_mask],
    metric_value = clean_metric[valid_mask],
    stringsAsFactors = FALSE
  )
  
  if (!is.na(title_col) && title_col %in% raw_cols) {
    parsed_df$title <- as.character(df[[title_col]][valid_mask])
  } else {
    parsed_df$title <- paste("Track", seq_len(nrow(parsed_df)))
  }
  
  if (!is.na(time_col) && time_col %in% raw_cols) {
    parsed_df$release_hour <- parse_flexible_time(df[[time_col]][valid_mask])
  } else {
    parsed_df$release_hour <- rep(NA_integer_, nrow(parsed_df))
  }
  
  if (!is.na(genre_col) && genre_col %in% raw_cols) {
    parsed_df$genre <- as.character(df[[genre_col]][valid_mask])
  } else {
    parsed_df$genre <- rep(NA_character_, nrow(parsed_df))
  }
  
  if (!is.na(market_col) && market_col %in% raw_cols) {
    parsed_df$target_market <- as.character(df[[market_col]][valid_mask])
  } else {
    parsed_df$target_market <- rep(NA_character_, nrow(parsed_df))
  }
  
  # Compute weekday factors
  parsed_df$weekday <- factor(
    weekdays(parsed_df$release_date),
    levels = c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
  )
  
  n_total_rows <- nrow(df)
  n_valid_rows <- nrow(parsed_df)
  
  # Sample size tiering
  sample_tier <- if (n_valid_rows < 5) {
    "insufficient"
  } else if (n_valid_rows < 20) {
    "small"
  } else {
    "robust"
  }
  
  return(list(
    valid = TRUE,
    error = NULL,
    total_rows = n_total_rows,
    valid_rows = n_valid_rows,
    dropped_rows = n_total_rows - n_valid_rows,
    sample_tier = sample_tier,
    detected_columns = list(
      date = date_col,
      metric = metric_col,
      title = title_col,
      time = time_col,
      genre = genre_col,
      market = market_col
    ),
    data = parsed_df
  ))
}

`%||%` <- function(a, b) {
  if (is.null(a) || is.na(a) || length(a) == 0 || nchar(as.character(a)) == 0) b else a
}
