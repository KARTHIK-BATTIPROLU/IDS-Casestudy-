# Spotify Listener Behaviour Analysis and Optimal Release-Window Advisor
**Academic Case Study Report**

- **Course / Context:** Bachelor of Engineering in Artificial Intelligence & Data Science, Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad
- **Author:** Karthik Battiprolu (Roll No. ugs24304_aid.battiprolu@cbit.org.in)
- **Repository:** [https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-.git](https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-.git)
- **Date:** October 26, 2026

---

## Executive Summary / Abstract

In the contemporary music streaming economy, independent artists and record labels routinely schedule new releases for Friday at 00:00 UTC. While historically initiated by the International Federation of the Phonographic Industry (IFPI) in 2015 to coordinate physical charting cycles and weekly editorial playlist schedules (such as Spotify's *New Music Friday*), this ubiquitous standard generates extreme release congestion. 

This case study empirically analyzes the validity of the universal Friday release convention using real timestamped listening logs (Last.fm 1K user corpus, $N = 500,000$ events) and global Spotify track outcome data ($N = 952$ cleaned tracks). We conduct exploratory data profiling, parametric One-Way ANOVA, Kruskal-Wallis non-parametric rank tests, and confounder-adjusted multiple Ordinary Least Squares (OLS) regression in R.

Our empirical findings demonstrate:
1. **The Friday Paradox:** Although Friday accounts for **55.25% of commercial releases**, our age-adjusted and playlist-controlled regression reveals that the independent marginal effect of Friday on cumulative streams is **statistically insignificant** ($\beta = 0.0128, p = 0.9167$). Friday releases exhibit the lowest median stream counts ($253.9\text{M}$) due to hyper-competitive clutter.
2. **Real-Time Streaming Velocity:** Global listener streaming activity peaks during **Tuesday through Thursday afternoons (14:00 - 18:00 UTC)**, where listener attention is intense while new release drops drop by up to 75%.
3. **Decision-Support Software:** We engineered and containerized an end-to-end web platform featuring a Next.js 14 App Router frontend and an R Plumber REST API. Uploaded artist catalogs undergo in-memory statistical evaluation, sample size gating ($N < 5$ descriptive only, $5 \le N < 20$ non-parametric medians, $N \ge 20$ full parametric CIs), and multi-criteria window ranking with zero row persistence.

---

## 1. Introduction & Problem Formulation

### 1.1 The Industry Dilemma
For over a decade, commercial music distribution has adhered to a rigid temporal norm: "Drop on Friday at midnight." For major label artists with guaranteed placement on high-impact editorial playlists (e.g., *Today's Top Hits*, *New Music Friday*), this strategy maximizes the 7-day tracking window for national charts (such as the Billboard Hot 100 or UK Official Singles Chart).

However, for independent artists, unsigned creators, and emerging catalog owners, Friday release scheduling presents severe unmitigated risks:
- **Severe Attention Bottleneck:** Thousands of global singles drop within the same 60-minute window, saturating playlist editor inboxes and social media feeds.
- **Algorithmic Drowning:** Recommendation systems (Release Radar, algorithmic radio) must distribute impression bandwidth across an extraordinarily concentrated batch of competing tracks.

### 1.2 Core Research Hypotheses
- **Hypothesis 1 ($H_1$):** Real-time listener streaming activity does not concentrate exclusively on weekends; sustained high-velocity consumption occurs mid-week during working/daytime hours.
- **Hypothesis 2 ($H_2$):** The historical streaming superiority commonly attributed to Friday releases is mediated by catalog age and editorial playlist placement rather than an inherent day-of-week demand phenomenon.
- **Hypothesis 3 ($H_3$):** Combining empirical listening activity, historical performance distributions, and release congestion penalties into a transparent decision-support heuristic yields superior release timing alternatives.

---

## 2. Dataset Provenance & Data Hygiene Audit

### 2.1 Raw Datasets Audited
The research pipeline relies on three empirical datasets audited in R (`analysis/01_audit_data.R`):
1. **Spotify Most Streamed Songs 2023 (`spotify_2023_tracks.csv`):** 953 raw tracks with release dates, cumulative streams, playlist appearances, and audio descriptors.
2. **Spotify Historical Daily Charts (`spotify_chart_historical.csv`):** Multi-market daily chart positions and streaming volume.
3. **Last.fm 1K User Listening Corpus (`lastfm_listening_sample.parquet`):** 500,000 real timestamped listening events with microsecond UTC precision.

### 2.2 Data Cleaning & Anomaly Resolution
During rigorous profiling in `analysis/02_clean_data.R`, we discovered a critical data corruption issue in the raw Spotify 2023 dataset:
- **Outlier Detection:** Track 575 (*Love Grows (Where My Rosemary Goes)*) contained concatenated text attributes (`BPM110KeyAModeMajor...`) inside the `streams` column. Naive regex digit-stripping produced an astronomical stream count of $71,812,624,203$ ($71.8\text{B}$), distorting the Thursday parametric mean.
- **Hygiene Resolution:** We implemented strict numerical coercion (`suppressWarnings(as.numeric(streams))`), correctly dropping this corrupted record ($N = 952$ clean tracks).
- **Date Standardization:** Reconstructed ISO dates from `released_year`, `released_month`, and `released_day`, deriving ordered weekday factors and catalog age relative to the year-end snapshot (December 31, 2023).

---

## 3. Exploratory Data Analysis & Empirical Listening Dynamics

### 3.1 The 168-Hour Activity Matrix
Analyzing 500,000 Last.fm timestamped events across the 168 hours of the weekly calendar (`analysis/03_listening_analysis.R`) revealed:
- **Baseline Cell Share:** Under a uniform distribution, each hour accounts for $1/168 \approx 0.595\%$ of weekly activity.
- **Peak Window:** The global maximum occurs on **Wednesday at 16:00 UTC** ($0.887\%$ share, Activity Index = $149.1$).
- **Mid-Week Sustained Velocity:** Tuesdays, Wednesdays, and Thursdays exhibit continuous elevated listening between **13:00 and 19:00 UTC** (Activity Index $> 125$).
- **Trough Window:** Minimum activity occurs consistently across weekdays between **04:00 and 07:00 UTC** (Activity Index $< 65$).

### 3.2 Release Concentration vs. Performance Reality
Cross-tabulating track release frequencies against streaming totals in `analysis/04_release_performance.R`:

| Weekday | Track Count ($N$) | Share of Drops (%) | Mean Streams | Median Streams | 95% Confidence Interval (Mean) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Monday** | 60 | 6.30% | 575.5M | 305.5M | [416.5M - 734.5M] |
| **Tuesday** | 65 | 6.83% | 772.7M | 429.8M | [587.1M - 958.3M] |
| **Wednesday** | 87 | 9.14% | 583.7M | 374.2M | [456.2M - 711.2M] |
| **Thursday** | 154 | 16.18% | 501.3M | 278.4M | [412.0M - 590.6M] |
| **Friday** | **526** | **55.25%** | **447.7M** | **253.9M** | **[403.9M - 491.6M]** |
| **Saturday** | 23 | 2.42% | 568.1M | 372.5M | [376.3M - 759.9M] |
| **Sunday** | 37 | 3.89% | 760.8M | 520.0M | [532.9M - 988.7M] |

**Observation:** Friday commands the majority of release traffic ($55.25\%$) but records the **lowest median stream total ($253.9\text{M}$)** among all weekdays, illustrating the drag of hyper-competitive tail tracks.

---

## 4. Statistical Modeling & Hypothesis Testing

### 4.1 Parametric & Non-Parametric Tests
To evaluate whether raw streaming totals differ significantly across release weekdays:
1. **One-Way ANOVA:**
   $$F(6, 945) = 5.1389, \quad p = 2.98 \times 10^{-5} \quad (\text{Reject } H_0 \text{ at } \alpha = 0.01)$$
2. **Kruskal-Wallis Rank Sum Test:**
   $$\chi^2(6) = 26.9603, \quad p = 0.0001 \quad (\text{Reject } H_0 \text{ at } \alpha = 0.01)$$

Both unadjusted tests confirm statistically significant differences in raw streaming volume by weekday. However, this preliminary result is highly susceptible to omitted variable bias (confounding).

### 4.2 Confounder-Adjusted Multiple OLS Regression
To test Hypothesis 2, we specified a multiple linear regression controlling for track age and playlist inclusion:
$$\log(\text{streams}_i) = \beta_0 + \sum_{k} \beta_k \cdot \mathbb{I}(\text{weekday}_i = k) + \gamma_1 \cdot \text{track\_age\_days}_i + \gamma_2 \cdot \text{playlists}_i + \epsilon_i$$

**Model Summary:**
- Sample Size: $N = 952$
- $R^2 = 0.4053$, Adjusted $R^2 = 0.4002$
- Overall Model $F(8, 943) = 80.32, p = 4.64 \times 10^{-101}$

**Selected Parameter Estimates:**
- `in_spotify_playlists` ($\gamma_2$): $\beta = 0.00021, t = 17.65, p < 10^{-16}$ (Extremely Significant)
- `track_age_days` ($\gamma_1$): $\beta = 0.00015, t = 11.22, p < 10^{-16}$ (Extremely Significant)
- `weekdayFriday`: **$\beta = 0.0128, t = 0.105, p = 0.9167$ (Not Significant)**
- `weekdayTuesday`: $\beta = -0.1710, t = -1.070, p = 0.2851$
- `weekdayWednesday`: $\beta = 0.2347, t = 1.574, p = 0.1157$

**Statistical Conclusion:** Once catalog accumulation time and Spotify playlist placements are held constant, **the release weekday dummy variables lose all explanatory power**. The perceived Friday advantage is an artifact of playlist placement and marketing budget rather than an intrinsic day effect.

---

## 5. Software Architecture & Implementation

### 5.1 System Architecture
The application is structured as a professional Git monorepo:
- **`apps/web`:** Next.js 14 App Router, TypeScript, Tailwind CSS, Lucide React, and Recharts. Deployed to Vercel.
- **`services/r-api`:** R Plumber REST API, containerized via Docker (`rocker/r-ver:4.3.3`) for deployment to Render.
- **`analysis/`:** Modular, reproducible R analysis scripts producing verifiable summaries in `data/processed/`.
- **`reports/`:** Formal academic deliverables and presentation slide decks.
- **`.github/workflows/`:** Automated CI pipelines running R `testthat` suites and Next.js production builds on every push.

### 5.2 Resilient Route Proxy & Zero-Storage Privacy
- Browser clients interact exclusively with the Next.js Route Handler `/api/analyze`.
- The Next.js server proxies JSON payloads to the R Plumber API with `X-API-KEY` authentication and 60-second timeout handling.
- **Zero-Storage Privacy:** In strict accordance with user data privacy standards, uploaded CSV rows are processed purely in-memory in R and never written to disk or permanent databases.

---

## 6. Recommendations & Practical Industry Guidelines

1. **Major Label / High-Pitch Artists:** Retain Friday 00:00 UTC releases only when confirmed editorial playlist placement (e.g., *New Music Friday*, *Today's Top Hits*) has been secured.
2. **Independent & Emerging Artists:** Pivot to **Tuesday or Wednesday afternoon windows (14:00 - 17:00 UTC)**. These windows capture high global listener traffic while avoiding 75% of global drop competition.
3. **Transparent Decision Support:** Respect sample size gates ($N < 5$ descriptive only, $5 \le N < 20$ non-parametric medians with uncertainty penalty, $N \ge 20$ full parametric inference).

---

## References

1. International Federation of the Phonographic Industry (IFPI). "New Music Fridays: Global Release Day Initiative." *IFPI Industry Report*, 2015.
2. Celma, Òscar. *Music Recommendation and Discovery in the Long Tail*. Springer, 2010.
3. Nelgiriyewithana, N. "Top Spotify Songs 2023." *Kaggle Datasets*, 2023.
4. Freyberg, J. "Spotify Daily Worldwide Chart Data." *Kaggle Datasets*, 2022.
