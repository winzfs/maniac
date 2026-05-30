/// <reference types="@cloudflare/workers-types" />

async function ignoreAlreadyExists(operation: Promise<unknown>) {
  try {
    await operation;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    if (!message.includes("duplicate column") && !message.includes("already exists")) throw error;
  }
}

export async function ensureGarageSchema(db: D1Database) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS equipments (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      category TEXT NOT NULL DEFAULT 'motorcycle',
      brand TEXT,
      model TEXT,
      nickname TEXT NOT NULL,
      slug TEXT NOT NULL,
      year INTEGER,
      description TEXT,
      main_image_url TEXT,
      main_image_asset_id TEXT,
      usage_metric_type TEXT NOT NULL DEFAULT 'km',
      usage_metric_value INTEGER,
      visibility TEXT NOT NULL DEFAULT 'private',
      moderation_status TEXT NOT NULL DEFAULT 'normal',
      created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
      deleted_at INTEGER
    )`,
  ).run();

  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN category TEXT NOT NULL DEFAULT 'motorcycle'").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN brand TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN model TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN slug TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN year INTEGER").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN description TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN main_image_url TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN main_image_asset_id TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN usage_metric_type TEXT NOT NULL DEFAULT 'km'").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN usage_metric_value INTEGER").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'normal'").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE equipments ADD COLUMN deleted_at INTEGER").run());

  await db.prepare("CREATE INDEX IF NOT EXISTS equipments_user_idx ON equipments (user_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS equipments_category_idx ON equipments (category)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS equipments_public_idx ON equipments (visibility, moderation_status)").run();
  await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS equipments_user_slug_unique ON equipments (user_id, slug)").run();

  await db.prepare(
    `CREATE TABLE IF NOT EXISTS maintenance_logs (
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
    )`,
  ).run();

  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN type TEXT NOT NULL DEFAULT 'custom'").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN title TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN description TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN performed_at INTEGER").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN usage_metric_value INTEGER").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN cost INTEGER").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN shop_name TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN is_public INTEGER NOT NULL DEFAULT 1").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'normal'").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE maintenance_logs ADD COLUMN deleted_at INTEGER").run());

  await db.prepare("CREATE INDEX IF NOT EXISTS maintenance_logs_equipment_performed_idx ON maintenance_logs (equipment_id, performed_at)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS maintenance_logs_type_idx ON maintenance_logs (type)").run();

  await db.prepare(
    `CREATE TABLE IF NOT EXISTS parts (
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
    )`,
  ).run();

  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN category TEXT NOT NULL DEFAULT 'custom'").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN brand TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN name TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN price INTEGER").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN installed_at INTEGER").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN purchase_url TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN image_url TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN memo TEXT").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN visibility TEXT NOT NULL DEFAULT 'public'").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN moderation_status TEXT NOT NULL DEFAULT 'normal'").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)").run());
  await ignoreAlreadyExists(db.prepare("ALTER TABLE parts ADD COLUMN deleted_at INTEGER").run());

  await db.prepare("CREATE INDEX IF NOT EXISTS parts_equipment_idx ON parts (equipment_id)").run();
  await db.prepare("CREATE INDEX IF NOT EXISTS parts_category_idx ON parts (category)").run();
}
