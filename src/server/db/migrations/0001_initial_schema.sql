-- Maniac Garage initial D1 schema.
-- Apply this in Cloudflare D1 Console or with Wrangler after creating the D1 database.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  nickname TEXT NOT NULL,
  profile_image_url TEXT,
  provider TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users (email);
CREATE INDEX IF NOT EXISTS users_nickname_idx ON users (nickname);

CREATE TABLE IF NOT EXISTS user_roles (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  granted_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  granted_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  revoked_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE INDEX IF NOT EXISTS user_roles_user_role_idx ON user_roles (user_id, role);

CREATE TABLE IF NOT EXISTS equipments (
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
  usage_metric_type TEXT NOT NULL DEFAULT 'km',
  usage_metric_value INTEGER,
  visibility TEXT NOT NULL DEFAULT 'private',
  moderation_status TEXT NOT NULL DEFAULT 'normal',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS equipments_user_idx ON equipments (user_id);
CREATE INDEX IF NOT EXISTS equipments_category_idx ON equipments (category);
CREATE INDEX IF NOT EXISTS equipments_public_idx ON equipments (visibility, moderation_status);
CREATE UNIQUE INDEX IF NOT EXISTS equipments_user_slug_unique ON equipments (user_id, slug);

CREATE TABLE IF NOT EXISTS equipment_photos (
  id TEXT PRIMARY KEY NOT NULL,
  equipment_id TEXT NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  image_url TEXT,
  storage_key TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  taken_at INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_cover INTEGER NOT NULL DEFAULT 0,
  visibility TEXT NOT NULL DEFAULT 'public',
  moderation_status TEXT NOT NULL DEFAULT 'normal',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS equipment_photos_equipment_order_idx ON equipment_photos (equipment_id, sort_order);
CREATE UNIQUE INDEX IF NOT EXISTS equipment_photos_storage_key_unique ON equipment_photos (storage_key);

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
CREATE INDEX IF NOT EXISTS maintenance_logs_equipment_performed_idx ON maintenance_logs (equipment_id, performed_at);
CREATE INDEX IF NOT EXISTS maintenance_logs_type_idx ON maintenance_logs (type);

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
CREATE INDEX IF NOT EXISTS parts_equipment_idx ON parts (equipment_id);
CREATE INDEX IF NOT EXISTS parts_category_idx ON parts (category);

CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY NOT NULL,
  equipment_id TEXT NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
  maintenance_type TEXT NOT NULL DEFAULT 'custom',
  title TEXT NOT NULL,
  base_usage_metric_value INTEGER,
  interval_usage_metric_value INTEGER,
  next_due_usage_metric_value INTEGER,
  next_due_date INTEGER,
  channel TEXT NOT NULL DEFAULT 'web',
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);
CREATE INDEX IF NOT EXISTS reminders_equipment_idx ON reminders (equipment_id);
CREATE INDEX IF NOT EXISTS reminders_due_date_idx ON reminders (next_due_date);

CREATE TABLE IF NOT EXISTS themes (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  price INTEGER NOT NULL DEFAULT 0,
  preview_image_url TEXT,
  is_premium INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE UNIQUE INDEX IF NOT EXISTS themes_code_unique ON themes (code);

CREATE TABLE IF NOT EXISTS site_pages (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE UNIQUE INDEX IF NOT EXISTS site_pages_slug_unique ON site_pages (slug);

CREATE TABLE IF NOT EXISTS site_sections (
  id TEXT PRIMARY KEY NOT NULL,
  page_id TEXT NOT NULL REFERENCES site_pages(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  image TEXT,
  cta TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS banners (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cta_label TEXT,
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  is_pinned INTEGER NOT NULL DEFAULT 0,
  published_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS faq_items (
  id TEXT PRIMARY KEY NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS boards (
  id TEXT PRIMARY KEY NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  permission TEXT NOT NULL DEFAULT 'public',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
CREATE UNIQUE INDEX IF NOT EXISTS boards_slug_unique ON boards (slug);

CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY NOT NULL,
  board_id TEXT NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  visibility TEXT NOT NULL DEFAULT 'public',
  moderation_status TEXT NOT NULL DEFAULT 'normal',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY NOT NULL,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'published',
  moderation_status TEXT NOT NULL DEFAULT 'normal',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  reporter_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS moderation_actions (
  id TEXT PRIMARY KEY NOT NULL,
  report_id TEXT REFERENCES reports(id) ON DELETE SET NULL,
  moderator_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  note TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  admin_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  before_value_json TEXT,
  after_value_json TEXT,
  reason TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000)
);
