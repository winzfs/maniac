-- Maniac Garage D1 migration
-- Add first-party email/password auth support.

ALTER TABLE users ADD COLUMN credential_hash TEXT;

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verifier_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  revoked_at INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_sessions_verifier_hash_unique
  ON auth_sessions (verifier_hash);

CREATE INDEX IF NOT EXISTS auth_sessions_user_idx
  ON auth_sessions (user_id);

CREATE INDEX IF NOT EXISTS auth_sessions_expires_idx
  ON auth_sessions (expires_at);
