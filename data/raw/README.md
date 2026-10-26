# Raw Datasets Directory

This directory holds the raw, uncommitted source data files used in the reproducible R data science pipeline:
1. `spotify_2023_tracks.csv` - Kaggle: `nelgiriyewithana/top-spotify-songs-2023`
2. `spotify_chart_historical.csv` - Kaggle: `jfreyberg/spotify-chart-data`
3. `lastfm-dataset-1k.snappy.parquet` - Timestamped Last.fm 1K user listening events corpus

These files are processed via the R scripts in `analysis/` into reproducible summaries saved in `data/processed/`.
Raw data is excluded from Git to prevent repository bloat and comply with dataset distribution policies.
