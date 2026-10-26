library(arrow)
parquet_path <- "C:/Users/Karthik/Downloads/lastfm-dataset-1k.snappy.parquet"
if (file.exists(parquet_path)) {
  message("Opening dataset...")
  ds <- open_dataset(parquet_path)
  message("Collecting sample of 500,000 rows...")
  df <- as.data.frame(head(ds, 500000))
  message("Writing parquet...")
  write_parquet(df, "data/raw/lastfm_listening_sample.parquet")
  message(sprintf("Successfully written %d rows.", nrow(df)))
} else {
  stop("Parquet file does not exist at ", parquet_path)
}
