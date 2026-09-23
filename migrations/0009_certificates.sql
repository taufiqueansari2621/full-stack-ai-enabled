CREATE TABLE certificate_credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  certificate_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  evidence_json TEXT NOT NULL,
  issued_at TEXT NOT NULL,
  UNIQUE(user_id, certificate_id)
);

CREATE INDEX certificate_credentials_user_idx ON certificate_credentials(user_id, issued_at DESC);
