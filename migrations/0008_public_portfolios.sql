CREATE TABLE public_portfolios (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  username TEXT NOT NULL UNIQUE,
  published INTEGER NOT NULL DEFAULT 0 CHECK (published IN (0, 1)),
  about TEXT NOT NULL DEFAULT '',
  skills_json TEXT NOT NULL DEFAULT '[]',
  projects_json TEXT NOT NULL DEFAULT '[]',
  case_studies_json TEXT NOT NULL DEFAULT '[]',
  certificates_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL
);

CREATE INDEX public_portfolios_published_username_idx
  ON public_portfolios(published, username);
