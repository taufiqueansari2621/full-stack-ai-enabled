ALTER TABLE users ADD COLUMN email_verified_at TEXT;

CREATE TABLE account_email_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL CHECK(purpose IN ('verify','reset')),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  reset_password_hash TEXT,
  reset_password_salt TEXT,
  recovery_code_hash TEXT,
  CHECK(purpose != 'reset' OR used_at IS NULL OR
    (reset_password_hash IS NOT NULL AND reset_password_salt IS NOT NULL AND recovery_code_hash IS NOT NULL))
);
CREATE INDEX email_tokens_owner ON account_email_tokens(user_id,purpose,expires_at);

CREATE TABLE account_mail_quota (
  day TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL CHECK(attempts BETWEEN 1 AND 100)
);
CREATE TABLE account_mail_limits (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('verify', 'reset')),
  window_started_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL,
  PRIMARY KEY (user_id, purpose)
);

CREATE TRIGGER consume_account_email
AFTER UPDATE OF used_at ON account_email_tokens
WHEN OLD.used_at IS NULL AND NEW.used_at IS NOT NULL
BEGIN
  UPDATE users SET email_verified_at = coalesce(email_verified_at,NEW.used_at)
    WHERE id=NEW.user_id AND NEW.purpose='verify';
  UPDATE users SET password_hash=NEW.reset_password_hash,
    password_salt=NEW.reset_password_salt, updated_at=NEW.used_at
    WHERE id=NEW.user_id AND NEW.purpose='reset';
  UPDATE sessions SET revoked_at=NEW.used_at
    WHERE user_id=NEW.user_id AND revoked_at IS NULL AND NEW.purpose='reset';
  UPDATE recovery_codes SET used_at=NEW.used_at
    WHERE user_id=NEW.user_id AND used_at IS NULL AND NEW.purpose='reset';
  INSERT INTO recovery_codes(id,user_id,code_hash,created_at)
    SELECT NEW.id || '-recovery',NEW.user_id,NEW.recovery_code_hash,NEW.used_at
    WHERE NEW.purpose='reset';
  DELETE FROM account_email_tokens WHERE user_id=NEW.user_id AND id != NEW.id
    AND (purpose=NEW.purpose OR NEW.purpose='reset');
END;
