-- Maniac Garage D1 migration
-- Adds maintenance logs and parts tables used by the garage MVP.

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id TEXT PRIMARY KEY NOT NULL,
  equipment_id TEXT NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'custom',
  title TEXT NOT NULL,
  description TEXT,
  performed_at INTEGER NOT NULL,
  usage_metric_value INTEGER,
  cost INTEGER,
  shop_name TEXT,
  is_public INTEGER NOT NULL DEFAULT 1,
  visibility TEXT NOT NULL DEFAULT 'public',
  moderation_status TEXT NOT NULL DEFAULT 'normal',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS maintenance_logs_equipment_performed_idx
  ON maintenance_logs (equipment_id, performed_at);

CREATE INDEX IF NOT EXISTS maintenance_logs_type_idx
  ON maintenance_logs (type);

CREATE TABLE IF NOT EXISTS parts (
  id TEXT PRIMARY KEY NOT NULL,
  equipment_id TEXT NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  category TEXT NOT NULL DEFAULT 'custom',
  brand TEXT,
  name TEXT NOT NULL,
  price INTEGER,
  installed_at INTEGER,
  purchase_url TEXT,
  image_url TEXT,
  memo TEXT,
  visibility TEXT NOT NULL DEFAULT 'public',
  moderation_status TEXT NOT NULL DEFAULT 'normal',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS parts_equipment_idx
  ON parts (equipment_id);

CREATE INDEX IF NOT EXISTS parts_category_idx
  ON parts (category);
