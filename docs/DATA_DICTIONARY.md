# Data Dictionary: Spotify Listener Behaviour and Release Window Datasets

**Generated automatically by:** `analysis/01_audit_data.R`  
**Timestamp:** 2026-10-26 05:09:40 UTC

---

## 1. Spotify Most Streamed Songs 2023 (`spotify_2023_tracks.csv`)

- **Source:** Kaggle (`nelgiriyewithana/top-spotify-songs-2023`)
- **Total Records:** 953
- **Total Columns:** 24

| Column Name | Data Type | NA Count | NA % | Sample Values | Description / Operational Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `track_name` | `character` | 0 | 0.0% | `Seven (feat. Latto) (Explicit ` | Track title as listed on Spotify. |
| `artist(s)_name` | `character` | 0 | 0.0% | `Latto, Jung Kook, Myke Towers,` | Name of performing artist(s). |
| `artist_count` | `numeric` | 0 | 0.0% | `2, 1, 3` | Number of contributing artists. |
| `released_year` | `numeric` | 0 | 0.0% | `2023, 2019, 2022` | Year track was released. |
| `released_month` | `numeric` | 0 | 0.0% | `7, 3, 6` | Month track was released (1-12). |
| `released_day` | `numeric` | 0 | 0.0% | `14, 23, 30` | Day of the month track was released (1-31). |
| `in_spotify_playlists` | `numeric` | 0 | 0.0% | `553, 1474, 1397` | Number of Spotify playlists featuring the song. |
| `in_spotify_charts` | `numeric` | 0 | 0.0% | `147, 48, 113` | Rank/presence in Spotify charts. |
| `streams` | `character` | 0 | 0.0% | `141381703, 133716286, 14000397` | Total cumulative stream count (requires type cleaning). |
| `in_apple_playlists` | `numeric` | 0 | 0.0% | `43, 48, 94` | Primary feature / audio descriptor. |
| `in_apple_charts` | `numeric` | 0 | 0.0% | `263, 126, 207` | Primary feature / audio descriptor. |
| `in_deezer_playlists` | `numeric` | 0 | 0.0% | `45, 58, 91` | Primary feature / audio descriptor. |
| `in_deezer_charts` | `numeric` | 0 | 0.0% | `10, 14, 12` | Primary feature / audio descriptor. |
| `in_shazam_charts` | `numeric` | 50 | 5.2% | `826, 382, 949` | Primary feature / audio descriptor. |
| `bpm` | `numeric` | 0 | 0.0% | `125, 92, 138` | Tempo in beats per minute. |
| `key` | `character` | 95 | 10.0% | `B, C#, F` | Primary feature / audio descriptor. |
| `mode` | `character` | 0 | 0.0% | `Major, Minor` | Primary feature / audio descriptor. |
| `danceability_%` | `numeric` | 0 | 0.0% | `80, 71, 51` | Danceability index (0-100%). |
| `valence_%` | `numeric` | 0 | 0.0% | `89, 61, 32` | Musical positiveness/valence (0-100%). |
| `energy_%` | `numeric` | 0 | 0.0% | `83, 74, 53` | Energy level of audio (0-100%). |
| `acousticness_%` | `numeric` | 0 | 0.0% | `31, 7, 17` | Primary feature / audio descriptor. |
| `instrumentalness_%` | `numeric` | 0 | 0.0% | `0, 63, 17` | Primary feature / audio descriptor. |
| `liveness_%` | `numeric` | 0 | 0.0% | `8, 10, 31` | Primary feature / audio descriptor. |
| `speechiness_%` | `numeric` | 0 | 0.0% | `4, 6, 15` | Primary feature / audio descriptor. |

### Important Caveats for `spotify_2023_tracks.csv`:
1. **No Hourly Release Stamp:** Only `released_year`, `released_month`, and `released_day` are present.
2. **No Genre Column:** The dataset does not contain an explicit genre classification.
3. **Streams String Coercion:** Some rows contain invalid characters in `streams` requiring regex cleaning.

---

## 2. Spotify Historical Charts (`spotify_chart_historical.csv`)

- **Source:** Kaggle (`jfreyberg/spotify-chart-data`)
- **Sampled Records:** 100000
- **Total Columns:** 10

| Column Name | Data Type | NA Count | NA % | Sample Values |
| :--- | :--- | :--- | :--- | :--- |
| `date` | `Date` | 0 | 0.0% | `2021-04-15, 2019-01-31, 2018-1` |
| `country` | `character` | 0 | 0.0% | `de, jp, tr` |
| `position` | `numeric` | 0 | 0.0% | `82, 171, 59` |
| `streams` | `numeric` | 0 | 0.0% | `625718, 50896, 185439` |
| `track_id` | `character` | 0 | 0.0% | `20IvMlpi4U5RuDnAlXSRiV, 0V1K6M` |
| `artists` | `character` | 0 | 0.0% | `['Haftbefehl'], ['Suchmos'], [` |
| `artist_genres` | `character` | 0 | 0.0% | `['german hip hop'], ['japanese` |
| `duration` | `numeric` | 0 | 0.0% | `198746, 408320, 257142` |
| `explicit` | `logical` | 0 | 0.0% | `FALSE, TRUE` |
| `name` | `character` | 0 | 0.0% | `Crackküche, WATER, Gözleri Aşk` |

---

## 3. Last.fm 1K User Listening Events (`lastfm_listening_sample.parquet`)

- **Source:** Last.fm 1K User Listening Corpus
- **Sampled Events:** 500000
- **Total Columns:** 6

| Column Name | Data Type | NA Count | NA % | Sample Values | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `character` | 0 | 0.0% | `user_000001, user_000002, user` | Anonymized user identifier. |
| `timestamp` | `POSIXct` | 0 | 0.0% | `2006-08-13 13:59:20, 2006-08-1` | Timestamp in UTC timezone (microsecond precision). |
| `artist_id` | `character` | 17320 | 3.5% | `09a114d9-7723-4e14-b524-379697` | MusicBrainz Artist ID if matched. |
| `artist_name` | `character` | 0 | 0.0% | `Plaid & Bob Jaroc, Tommy Guerr` | Artist name string. |
| `track_id` | `character` | 58664 | 11.7% | `c4633ab1-e715-477f-8685-afa5f2` | MusicBrainz Track ID if matched. |
| `track_name` | `character` | 0 | 0.0% | `The Launching Of Big Face, Zn ` | Track title string. |
