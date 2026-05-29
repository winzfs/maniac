-- Maniac Garage D1 migration
-- Add provider-agnostic image asset metadata.
--
-- The app can start with Supabase Storage and later migrate objects to R2
-- by changing provider/object_key/public_url rows without changing feature tables.

CREATE TABLE IF NOT EXISTS image_assets (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  bucket TEXT,
  object_key TEXT NOT NULL,
  public_url TEXT NOT NULL,
  purpose TEXT NOT NULL,
  mime_type TEXT,
  size_bytes INTEGER,
  width INTEGER,
  height INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS image_assets_owner_idx
  ON image_assets (owner_user_id, purpose);

CREATE INDEX IF NOT EXISTS image_assets_provider_key_idx
  ON image_assets (provider, bucket, object_key);

CREATE INDEX IF NOT EXISTS image_assets_deleted_idx
  ON image_assets (deleted_at);

ALTER TABLE users ADD COLUMN profile_image_asset_id TEXT REFERENCES image_assets(id) ON DELETE SET NULL;
