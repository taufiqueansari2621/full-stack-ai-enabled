PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL CHECK (length(full_name) BETWEEN 2 AND 80),
  username TEXT NOT NULL UNIQUE COLLATE NOCASE,
  learning_goal TEXT,
  framework_path TEXT CHECK (framework_path IN ('react', 'angular', 'both') OR framework_path IS NULL),
  daily_minutes INTEGER CHECK (daily_minutes BETWEEN 15 AND 480 OR daily_minutes IS NULL),
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced') OR difficulty IS NULL),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  revoked_at TEXT
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);

CREATE TABLE progress_snapshots (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  state_json TEXT NOT NULL CHECK (length(state_json) <= 524288),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_at TEXT NOT NULL
);

CREATE TABLE activity_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  entity_id TEXT,
  occurred_at TEXT NOT NULL,
  metadata_json TEXT CHECK (metadata_json IS NULL OR length(metadata_json) <= 8192)
);

CREATE INDEX activity_events_user_time_idx ON activity_events(user_id, occurred_at DESC);

