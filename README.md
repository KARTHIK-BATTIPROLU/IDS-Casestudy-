# Spotify Listener Behaviour Analysis and Optimal Release-Window Advisor

[![R CI](https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-/actions/workflows/r-ci.yml/badge.svg)](https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-/actions/workflows/r-ci.yml)
[![Web CI](https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-/actions/workflows/web-ci.yml/badge.svg)](https://github.com/KARTHIK-BATTIPROLU/IDS-Casestudy-/actions/workflows/web-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![R: 4.6.1](https://img.shields.io/badge/R-4.6.1-blue.svg)](https://www.r-project.org/)
[![Next.js: 14.2](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)

A production-quality data science web application that moves beyond music industry folklore by empirically analyzing real timestamped listening distributions, release day anomalies, and artist catalog performance. 

**All analytical computations, Student's $t$ confidence intervals, One-Way ANOVA, Kruskal-Wallis rank tests, multiple OLS regression, and release-window rankings are computed strictly in R.**

---

## 🌟 Core Empirical Findings

1. **The Friday Paradox:**
   - Friday accounts for **55.25% of commercial track drops**, driven by IFPI coordination and Spotify *New Music Friday* scheduling.
   - However, once catalog age and playlist placements are controlled via multiple OLS regression in R, **the Friday coefficient is statistically insignificant ($\beta = 0.0128, p = 0.9167$)**.
   - Friday releases record the lowest median stream totals ($253.9\text{M}$) among all release weekdays due to hyper-competitive clutter.
2. **Real-Time Streaming Velocity:**
   - Global listening activity peaks during **Tuesday through Thursday afternoons (14:00 - 18:00 UTC)**, where listener attention is intense while competing release drops decrease by up to 75%.
3. **Scientific Honesty & Sample Size Gating:**
   - $N < 5$: Statistical ranking is withheld to protect artists from specious inferences.
   - $5 \le N < 20$: Robust non-parametric medians with a 15% uncertainty discount.
   - $N \ge 20$: Parametric 95% confidence intervals and ANOVA testing.

---

## 🏗️ Monorepo Architecture

```
Spotify IDS/
├── .github/workflows/           # CI pipelines for R and Next.js
│   ├── r-ci.yml
│   └── web-ci.yml
├── analysis/                    # Reproducible R research scripts
│   ├── 01_audit_data.R          # Data profiling & missingness audit
│   ├── 02_clean_data.R          # Data hygiene & outlier cleaning
│   ├── 03_listening_analysis.R  # 168-hour activity matrix computation
│   ├── 04_release_performance.R # ANOVA, 95% CIs, and age-adjusted OLS
│   └── 05_advisor_scoring.R     # Multi-criteria candidate ranking
├── apps/web/                    # Next.js 14 App Router (TypeScript, Tailwind, Recharts)
│   ├── public/templates/        # Verified 22-track sample artist catalog (.csv)
│   ├── src/app/                 # 6 responsive pages + /api/analyze route
│   ├── src/components/          # Heatmap, BarChart, and CandidateWindowsTable
│   └── src/types/               # Strongly typed analytical interfaces
├── data/
│   ├── raw/                     # Untracked source data (Last.fm & Spotify)
│   └── processed/               # Reproducibly generated JSON summaries
├── docs/                        # Architecture, Methodology, Data Dictionary, Deployment
├── reports/                     # Academic Case Study Report and 17-slide deck
├── services/r-api/              # Containerized R Plumber REST API
│   ├── Dockerfile               # Production container definition for Render
│   ├── api.R                    # Plumber endpoints (/health, /metadata, /analyze)
│   ├── R/                       # Modular validators, stats, and scoring algorithms
│   └── tests/                   # 50 testthat unit & integration assertions
├── render.yaml                  # Render Blueprint definition
├── vercel.json                  # Vercel configuration
└── README.md
```

---

## 🚀 Quickstart: Running Locally

### Prerequisites
- **R (>= 4.3):** With packages `plumber`, `jsonlite`, `readr`, `dplyr`, `tidyr`, `lubridate`, `broom`, `arrow`, `testthat`.
- **Node.js (>= 20.x) & npm.**

### 1. Run R Analytical Pipeline
```bash
# Execute reproducible R research pipeline
Rscript analysis/01_audit_data.R
Rscript analysis/02_clean_data.R
Rscript analysis/03_listening_analysis.R
Rscript analysis/04_release_performance.R
Rscript analysis/05_advisor_scoring.R
```

### 2. Run R Plumber API Service
```bash
# Start Plumber API on localhost:8000
Rscript services/r-api/run_api.R
```

### 3. Run R Unit Tests
```bash
# Execute all testthat test suites (50 assertions)
Rscript services/r-api/tests/run_tests.R
Rscript services/r-api/tests/test_api_endpoints.R
```

### 4. Run Next.js Web Frontend
```bash
cd apps/web
npm install
npm run build
npm run dev
# Visit http://localhost:3000
```

---

## 🔒 Data Privacy & Zero-Storage Guarantee
Uploaded artist release data is processed **strictly in-memory in R** and is never permanently stored to disk or databases. No row-level personal data is logged.

---

## 🚢 Deployment (Vercel & Render)
- **Frontend:** Deployed to Vercel with root directory `apps/web`.
- **Backend:** Deployed to Render as a Docker web service using `services/r-api/Dockerfile` and `render.yaml`.
- Detailed step-by-step instructions: see [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

---

## 🎓 Academic Context & Attribution
- **Institution:** Chaitanya Bharathi Institute of Technology (CBIT), Hyderabad
- **Department:** Department of Artificial Intelligence & Data Science
- **Lead Author:** Karthik Battiprolu (ugs24304_aid.battiprolu@cbit.org.in)
- **Coursework:** Case Study in Empirical Music Data Science & Platform Analytics
