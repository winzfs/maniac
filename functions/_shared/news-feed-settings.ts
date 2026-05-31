import { newsFeeds, type NewsFeed } from "./news";

export type NewsFeedSettingRow = {
  category: string;
  label: string;
  queries_json: string;
  updated_at: number;
};

function normalizeQueries(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => typeof item === "string" ? item.trim() : "")
    .filter((item) => item.length > 0)
    .slice(0, 10);
}

function parseQueries(value: string) {
  try {
    return normalizeQueries(JSON.parse(value));
  } catch {
    return [];
  }
}

function mergeWithDefaults(rows: NewsFeedSettingRow[]) {
  const rowMap = new Map(rows.map((row) => [row.category, row]));
  return newsFeeds.map((feed) => {
    const row = rowMap.get(feed.category);
    const queries = row ? parseQueries(row.queries_json) : [];
    return {
      category: feed.category,
      label: row?.label || feed.label,
      queries: queries.length > 0 ? queries : feed.queries,
    };
  });
}

export async function ensureNewsFeedSettingsSchema(db: D1Database) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS news_feed_settings (
      category TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      queries_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
  ).run();
}

export async function getNewsFeedSettings(db: D1Database): Promise<NewsFeed[]> {
  await ensureNewsFeedSettingsSchema(db);
  const rows = await db.prepare(
    `SELECT category, label, queries_json, updated_at
     FROM news_feed_settings`,
  ).all<NewsFeedSettingRow>();
  return mergeWithDefaults(rows.results ?? []);
}

export async function saveNewsFeedSettings(db: D1Database, feeds: NewsFeed[]) {
  await ensureNewsFeedSettingsSchema(db);
  const now = Date.now();
  const allowedCategories = new Set(newsFeeds.map((feed) => feed.category));
  const defaultLabels = new Map(newsFeeds.map((feed) => [feed.category, feed.label]));

  const statements = feeds
    .filter((feed) => allowedCategories.has(feed.category))
    .map((feed) => {
      const label = defaultLabels.get(feed.category) ?? feed.label;
      const queries = normalizeQueries(feed.queries);
      return db.prepare(
        `INSERT INTO news_feed_settings (category, label, queries_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(category) DO UPDATE SET
           label = excluded.label,
           queries_json = excluded.queries_json,
           updated_at = excluded.updated_at`,
      ).bind(feed.category, label, JSON.stringify(queries), now, now);
    });

  if (statements.length > 0) await db.batch(statements);
  return getNewsFeedSettings(db);
}
