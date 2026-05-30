-- Maniac Garage D1 migration
-- Adds cached external news items.

CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  published_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
  hidden_at INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS news_items_link_unique
  ON news_items (link);

CREATE INDEX IF NOT EXISTS news_items_published_idx
  ON news_items (published_at);

CREATE INDEX IF NOT EXISTS news_items_category_published_idx
  ON news_items (category, published_at);
