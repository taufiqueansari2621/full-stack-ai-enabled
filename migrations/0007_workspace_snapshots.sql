CREATE TABLE workspace_snapshots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (length(label) BETWEEN 1 AND 80),
  files_json TEXT NOT NULL CHECK (length(files_json) <= 524288),
  active_path TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX workspace_snapshots_user_time_idx ON workspace_snapshots(user_id, created_at DESC);

