sp <- read.csv("data/raw/spotify_2023_tracks.csv", stringsAsFactors = FALSE)
bad_idx <- which(is.na(as.numeric(sp$streams)))
cat("Non-numeric stream rows:\n")
print(bad_idx)
for (i in bad_idx) {
  cat(sprintf("Row %d: track='%s', streams='%s'\n", i, sp$track_name[i], sp$streams[i]))
}

numeric_streams <- as.numeric(sp$streams[-bad_idx])
cat("Max numeric streams: ", max(numeric_streams), "\n")
top_idx <- order(numeric_streams, decreasing = TRUE)[1:5]
print(sp[-bad_idx, c("track_name", "artist.s._name", "streams")][top_idx, ])
