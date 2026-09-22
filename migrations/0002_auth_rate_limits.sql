CREATE TABLE auth_rate_limits (
  bucket_key TEXT PRIMARY KEY,
  window_started_at INTEGER NOT NULL,
  attempt_count INTEGER NOT NULL CHECK (attempt_count > 0)
);

CREATE INDEX auth_rate_limits_window_idx ON auth_rate_limits(window_started_at);

