export interface HourlyListeningCell {
  weekday: string;
  hour: number;
  event_count: number;
  share_pct: number;
  activity_index: number;
}

export interface MarginalDistribution {
  hour?: number;
  weekday?: string;
  event_count: number;
  share_pct: number;
}

export interface WeekdayMetric {
  weekday: string;
  n_tracks: number;
  share_of_releases_pct: number;
  mean_streams: number;
  median_streams: number;
  sd_streams: number;
  iqr_streams: number;
  se_mean: number;
  ci_lower_95: number;
  ci_upper_95: number;
}

export interface RegressionCoefficient {
  term: string;
  estimate: number;
  std_error: number;
  statistic: number;
  p_value: number;
}

export interface CandidateWindow {
  rank: number;
  weekday: string;
  hour: number;
  window_label: string;
  composite_score: number;
  tier?: string;
  recommendation_tier?: string;
  activity_score: number;
  user_perf_score?: number;
  perf_score?: number;
  congestion_score: number;
  caveat?: string;
  rationale?: string;
}

export interface ColumnMapping {
  date?: string;
  metric?: string;
  title?: string;
  time?: string;
  genre?: string;
  market?: string;
}

export interface AnalysisWeights {
  activity: number;
  performance: number;
  congestion: number;
}

export interface AnalyzeResponse {
  success: boolean;
  error?: string;
  timestamp?: string;
  validation?: {
    total_rows_received: number;
    valid_analyzed_rows: number;
    dropped_invalid_rows: number;
    sample_tier: "insufficient" | "small" | "robust";
    detected_columns: ColumnMapping;
  };
  statistics?: {
    sample_size: number;
    weekday_summary: {
      weekday: string;
      count: number;
      mean_val: number;
      median_val: number;
      sd_val: number;
      iqr_val: number;
      ci_lower_95: number;
      ci_upper_95: number;
    }[];
    hypothesis_testing?: {
      kruskal_wallis?: {
        test: string;
        chi_squared: number;
        p_value: number;
        is_significant: boolean;
        interpretation?: string;
      };
      anova?: {
        test: string;
        f_statistic: number;
        p_value: number;
        is_significant: boolean;
      };
    };
    has_hourly_data?: boolean;
    hourly_summary?: {
      release_hour: number;
      count: number;
      mean_val: number;
      median_val: number;
    }[];
  };
  advisory?: {
    eligible_for_ranking: boolean;
    warning_banner?: string;
    confidence_tier?: "High" | "Moderate" | "Low";
    uncertainty_note?: string;
    scoring_weights?: AnalysisWeights;
    top_recommendations?: CandidateWindow[];
  };
  caveats?: {
    editorial_schedule?: string;
    sample_size_reminder?: string;
    disclaimer?: string;
  };
  is_local_r_fallback?: boolean;
}
