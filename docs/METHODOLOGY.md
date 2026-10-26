# Statistical Methodology & Mathematical Formulations

## 1. Multi-Criteria Release-Window Scoring Heuristic
To determine optimal candidate release windows without relying on unverifiable black-box neural networks, we combine three empirical signals:

$$\text{Candidate Score}(h, d) = \Big[ w_{\text{activity}} \cdot S_{\text{activity}}(h, d) + w_{\text{perf}} \cdot S_{\text{perf}}(d) - w_{\text{congestion}} \cdot C(h, d) \Big] \cdot \theta(N)$$

Where:
- $S_{\text{activity}}(h, d) \in [0, 100]$: Normalized empirical share of total weekly listening events observed during hour $h$ and weekday $d$ in the Last.fm 1K user corpus.
- $S_{\text{perf}}(d) \in [0, 100]$: Normalized historical performance achieved on weekday $d$ (derived from user catalog medians when available, or baseline Spotify track outcomes).
- $C(h, d) \in [0, 100]$: Release congestion penalty representing competing industry drop density. Peaks at 100 on Friday 00:00–05:00 UTC and decreases to 15 on off-peak weekdays.
- $\theta(N)$: Uncertainty discount factor. $\theta = 1.0$ for robust samples ($N \ge 20$); $\theta = 0.85$ for small samples ($5 \le N < 20$).
- Default weights: $w_{\text{activity}} = 0.45, w_{\text{perf}} = 0.35, w_{\text{congestion}} = 0.20$.

---

## 2. Parametric Confidence Intervals (Student's $t$-Distribution)
For each weekday group with $N \ge 2$:
$$\text{CI}_{95\%} = \bar{x} \pm t_{0.975, \, N-1} \cdot \frac{s}{\sqrt{N}}$$

Where $\bar{x}$ is the sample mean, $s$ is the sample standard deviation, and $t_{0.975, N-1}$ is the critical value from the Student's $t$-distribution with $N - 1$ degrees of freedom.

---

## 3. Multiple OLS Regression (Confounder Adjustment)
To isolate whether Friday releases hold an inherent causal advantage over other days:
$$\log(\text{streams}_i) = \beta_0 + \sum_{k \neq \text{Mon}} \beta_k \cdot \mathbb{I}(\text{weekday}_i = k) + \gamma_1 \cdot \text{track\_age\_days}_i + \gamma_2 \cdot \text{playlists}_i + \epsilon_i$$

**Empirical Result:**
- Adjusted $R^2 = 0.4002, F = 80.32, p = 4.64 \times 10^{-101}$.
- `in_spotify_playlists` ($\gamma_2$): $p < 10^{-16}$ (Highly significant positive driver).
- `track_age_days` ($\gamma_1$): $p < 10^{-16}$ (Highly significant positive driver).
- `weekdayFriday`: $\beta = 0.0128, t = 0.105, p = 0.9167$ (Not statistically significant).

---

## 4. Sample Size Gating Policy
- **$N < 5$:** Rejects statistical ranking. Displays descriptive summaries and a prominent notice of insufficient sample size.
- **$5 \le N < 20$:** Calculates robust non-parametric statistics (Medians, IQRs) with an uncertainty penalty.
- **$N \ge 20$:** Computes full parametric confidence intervals and One-Way ANOVA / Kruskal-Wallis tests.
