# Production Dockerfile for R Plumber Analytical API Service
FROM rocker/r-ver:4.3.3

# Install system dependencies required for R networking, JSON, and cryptographic libraries
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libsodium-dev \
    && rm -rf /var/lib/apt/lists/*

# Install required R analytical and API packages
RUN R -e "install.packages(c('plumber', 'jsonlite', 'readr', 'dplyr', 'tidyr', 'lubridate', 'broom', 'testthat'), repos='https://cloud.r-project.org')"

WORKDIR /app

# Copy service code
COPY R/ /app/R/
COPY api.R /app/api.R
COPY run_api.R /app/run_api.R

# Standard Render port environment variable handling
ENV PORT=8000
EXPOSE 8000

CMD ["Rscript", "/app/run_api.R"]
