# services/r-api/R/stats.R
# Statistical computations: parametric CIs, robust non-parametric metrics, and ANOVA

suppressPackageStartupMessages({
  library(dplyr)
  library(broom)
})

compute_user_release_stats <- function(parsed_df, sample_tier) {
  if (nrow(parsed_df) == 0) {
    return(list(
      weekday_stats = list(),
      hypothesis_test = NULL,
      status = "empty"
    ))
  }
  
  weekdays_all <- c("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday")
  
  # Weekday group statistics
  summary_by_weekday <- parsed_df %>%
    group_by(weekday) %>%
    summarise(
      count = n(),
      mean_val = round(mean(metric_value, na.rm = TRUE), 1),
      median_val = round(median(metric_value, na.rm = TRUE), 1),
      sd_val = if (n() > 1) round(sd(metric_value, na.rm = TRUE), 1) else 0,
      iqr_val = if (n() > 1) round(IQR(metric_value, na.rm = TRUE), 1) else 0,
      se_val = if (n() > 1) round(sd(metric_value, na.rm = TRUE) / sqrt(n()), 1) else 0,
      ci_lower_95 = if (n() > 1) {
        round(mean(metric_value, na.rm = TRUE) - qt(0.975, df = n() - 1) * (sd(metric_value, na.rm = TRUE) / sqrt(n())), 1)
      } else {
        round(mean(metric_value, na.rm = TRUE), 1)
      },
      ci_upper_95 = if (n() > 1) {
        round(mean(metric_value, na.rm = TRUE) + qt(0.975, df = n() - 1) * (sd(metric_value, na.rm = TRUE) / sqrt(n())), 1)
      } else {
        round(mean(metric_value, na.rm = TRUE), 1)
      },
      .groups = "drop"
    )
  
  # Merge with full 7 weekdays so all days are represented
  full_weekday_stats <- data.frame(
    weekday = factor(weekdays_all, levels = weekdays_all),
    stringsAsFactors = FALSE
  ) %>%
    left_join(summary_by_weekday, by = "weekday") %>%
    mutate(
      count = ifelse(is.na(count), 0, count),
      mean_val = ifelse(is.na(mean_val), 0, mean_val),
      median_val = ifelse(is.na(median_val), 0, median_val),
      sd_val = ifelse(is.na(sd_val), 0, sd_val),
      iqr_val = ifelse(is.na(iqr_val), 0, iqr_val),
      se_val = ifelse(is.na(se_val), 0, se_val),
      ci_lower_95 = ifelse(is.na(ci_lower_95), 0, ci_lower_95),
      ci_upper_95 = ifelse(is.na(ci_upper_95), 0, ci_upper_95)
    )
  
  # Hypothesis Testing Evaluation
  hypothesis_results <- NULL
  active_groups <- summary_by_weekday %>% filter(count >= 2)
  
  if (sample_tier == "robust" && nrow(active_groups) >= 2) {
    # Kruskal-Wallis Test
    kw_test <- tryCatch({
      kw <- kruskal.test(metric_value ~ weekday, data = parsed_df)
      list(
        test = "Kruskal-Wallis Rank Sum Test",
        chi_squared = round(kw$statistic, 3),
        p_value = signif(kw$p.value, 4),
        is_significant = (kw$p.value < 0.05),
        interpretation = if (kw$p.value < 0.05) {
          "Statistically significant variance in stream outcomes detected across release weekdays."
        } else {
          "No statistically significant difference between release weekdays in your catalog at alpha = 0.05."
        }
      )
    }, error = function(e) NULL)
    
    # One-Way ANOVA Test
    anova_test <- tryCatch({
      fit <- aov(metric_value ~ weekday, data = parsed_df)
      td <- tidy(fit)
      list(
        test = "One-Way ANOVA",
        f_statistic = round(td$statistic[1], 3),
        p_value = signif(td$p.value[1], 4),
        is_significant = (td$p.value[1] < 0.05)
      )
    }, error = function(e) NULL)
    
    hypothesis_results <- list(
      kruskal_wallis = kw_test,
      anova = anova_test
    )
  }
  
  # Hourly stats if provided
  has_hourly_data <- sum(!is.na(parsed_df$release_hour)) >= 5
  hourly_stats <- NULL
  if (has_hourly_data) {
    hourly_stats <- parsed_df %>%
      filter(!is.na(release_hour)) %>%
      group_by(release_hour) %>%
      summarise(
        count = n(),
        median_val = median(metric_value, na.rm = TRUE),
        mean_val = mean(metric_value, na.rm = TRUE),
        .groups = "drop"
      ) %>%
      arrange(release_hour)
  }
  
  return(list(
    total_valid_releases = nrow(parsed_df),
    sample_tier = sample_tier,
    weekday_stats = full_weekday_stats,
    hypothesis_testing = hypothesis_results,
    has_hourly_data = has_hourly_data,
    hourly_stats = hourly_stats
  ))
}
