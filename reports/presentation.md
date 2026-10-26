# Spotify Listener Behaviour Analysis & Optimal Release-Window Advisor
**Case Study Presentation Slides**

- **Course:** B.E. Artificial Intelligence & Data Science, CBIT Hyderabad
- **Lead Researcher:** Karthik Battiprolu (ugs24304_aid.battiprolu@cbit.org.in)
- **Repository:** `https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-.git`
- **Engine:** R Plumber + Next.js 14 App Router

---

## Slide 1: Title & Overview
- **Project Title:** Spotify Listener Behaviour Analysis and Optimal Release-Window Advisor
- **Goal:** Replace music industry superstitions with empirical listener data and transparent heuristics.
- **Core Technology:** Data cleaning, parametric ANOVA, and regression modeling computed in R; web interface built in Next.js 14.

---

## Slide 2: The Core Problem
- **The Friday Standard:** 55.25% of all commercial music drops on Friday at 00:00 UTC.
- **Why?** IFPI standardized Friday in 2015 for physical sales and Billboard tracking.
- **The Consequence:** Saturated curator inboxes, social feed clutter, and algorithmic displacement for independent artists.

---

## Slide 3: Research Hypotheses
1. **$H_1$ (Streaming Activity):** Listener demand is continuous and active mid-week, not solely on weekends.
2. **$H_2$ (Editorial Confounding):** The apparent success of Friday releases is mediated by playlist inclusions, not an intrinsic day advantage.
3. **$H_3$ (Multi-Criteria Heuristic):** A balanced score penalizing release congestion provides safer, high-engagement alternatives.

---

## Slide 4: Data Sources & Hygiene Audit
- **Spotify Top Songs 2023:** 953 tracks profiled via R (`analysis/01_audit_data.R`).
- **Last.fm 1K Listening Events:** 500,000 UTC timestamped streaming records.
- **Data Hygiene Finding:** Outlier in Row 575 (71 Billion streams due to text concatenation) detected and cleaned. Retained $N = 952$ clean records.

---

## Slide 5: The 168-Hour Listening Heatmap
- 7 Weekdays $\times$ 24 Hours evaluated empirically.
- **Peak Listening Window:** Wednesday 16:00 UTC (Activity Index = 149.1).
- **Daytime Velocity:** High sustained streaming from 13:00 to 19:00 UTC across Tuesday–Thursday.
- **Trough:** 04:00 to 07:00 UTC across all weekdays.

---

## Slide 6: Release Day Distribution Breakdown
- **Friday Share:** 526 tracks (55.25% of all releases).
- **Thursday Share:** 154 tracks (16.18%).
- **Wednesday Share:** 87 tracks (9.14%).
- **Tuesday Share:** 65 tracks (6.83%).
- **Monday Share:** 60 tracks (6.30%).

---

## Slide 7: The Friday Paradox
- **Parametric Mean:** Friday mean streams = 447.7M (95% CI: [403.9M, 491.6M]).
- **Robust Median:** Friday median streams = 253.9M (lowest among all weekdays!).
- **Interpretation:** Friday is dragged down by an enormous long tail of underperforming releases suffering from hyper-competition.

---

## Slide 8: Statistical Hypothesis Testing (ANOVA & Kruskal-Wallis)
- **One-Way ANOVA:**
  $$F(6, 945) = 5.1389, \quad p = 2.98 \times 10^{-5}$$
- **Kruskal-Wallis Rank Sum:**
  $$\chi^2(6) = 26.9603, \quad p = 0.0001$$
- **Finding:** Raw stream numbers vary significantly by weekday before adjusting for confounders.

---

## Slide 9: Multiple OLS Regression (Controlling Confounders)
- **Model Specification:**
  $$\log(\text{streams}) = \beta_0 + \sum \beta_k \cdot \text{weekday}_k + \gamma_1 \cdot \text{track\_age} + \gamma_2 \cdot \text{playlists}$$
- **Model Statistics:** $R^2 = 0.4053$, Model $F = 80.32, p = 4.64 \times 10^{-101}$.

---

## Slide 10: Regression Parameter Estimates
- **Playlist Inclusions:** $\beta = 0.00021, t = 17.65, p < 10^{-16}$ (High Significance).
- **Catalog Age:** $\beta = 0.00015, t = 11.22, p < 10^{-16}$ (High Significance).
- **Friday Dummy:** **$\beta = 0.0128, t = 0.105, p = 0.9167$ (Not Significant!).**
- **Conclusion:** Friday holds no independent statistical advantage once playlisting is controlled.

---

## Slide 11: Release-Window Scoring Algorithm
- **Formula:**
  $$\text{Score}(h, d) = w_{\text{activity}} \cdot S_{\text{activity}} + w_{\text{perf}} \cdot S_{\text{perf}} - w_{\text{congestion}} \cdot C$$
- **Default Weights:**
  - Activity: 45%
  - Historical Performance: 35%
  - Congestion Penalty: 20%
- Transparent heuristics with evidence cards for each ranked window.

---

## Slide 12: Sample Size Gating Policy
- **$N < 5$ (Insufficient):** Statistical ranking withheld; descriptive summary only.
- **$5 \le N < 20$ (Small Catalog):** Non-parametric medians with a 15% uncertainty discount.
- **$N \ge 20$ (Robust):** Parametric 95% Student's $t$ confidence intervals and ANOVA testing.

---

## Slide 13: Web Application Architecture
- **Monorepo Layout:**
  - `apps/web`: Next.js 14 App Router, TypeScript, Tailwind CSS, Recharts.
  - `services/r-api`: Containerized R Plumber REST API.
  - `analysis/`: Fully reproducible R data science pipeline.
- **Zero-Storage Privacy:** In-memory R execution, no rows saved to disk.

---

## Slide 14: Interactive Features Walkthrough
1. **Research Dashboard:** 168-hour heatmap, 95% CIs chart, ANOVA summaries.
2. **Genre Explorer:** Audio feature distributions and genre tendencies.
3. **Analyze Your Data:** Instant 22-track sample load, column mapping wizard, dynamic weighting sliders.
4. **Release Advisor:** Ranked window candidate cards with one-click CSV export.

---

## Slide 15: Strategic Recommendations
- **When to release on Friday:** When major editorial playlist pitching (*New Music Friday*) has already been confirmed.
- **When to release mid-week (Tuesday/Wednesday):** When targeting algorithmic radio, organic listener velocity, and lower competitor drop saturation.

---

## Slide 16: Quality Assurance & Verification
- 50 R `testthat` assertions passed with 100% success rate.
- Next.js production build compiled with static route optimization.
- GitHub Actions CI workflows for both R and Web frontend.

---

## Slide 17: Conclusion & Links
- **Conclusion:** Empirical data science provides actionable decision support for independent artists, dispelling rigid industry folklore.
- **Repository:** `https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-.git`
- **Department:** AI & Data Science, CBIT Hyderabad.
