/// <reference types="@cloudflare/workers-types" />

type Env = { DB?: D1Database };

type NewsRow = {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  published_at: number;
  image_url: string | null;
};

type NewsPage = {
  rows: NewsRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const categoryLabels = new Map([
  ["motorcycle", "바이크"],
  ["pc", "PC"],
  ["keyboard", "키보드"],
  ["bicycle", "자전거"],
  ["camera", "카메라"],
  ["camping", "캠핑"],
  ["audio", "오디오"],
]);

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function parseLimit(request: Request) {
  const value = Number(new URL(request.url).searchParams.get("limit") ?? 12);
  if (!Number.isFinite(value)) return 12;
  return Math.min(Math.max(Math.trunc(value), 1), 50);
}

function parsePage(request: Request) {
  const value = Number(new URL(request.url).searchParams.get("page") ?? 1);
  if (!Number.isFinite(value)) return 1;
  return Math.max(Math.trunc(value), 1);
}

function parseCategory(request: Request) {
  const raw = new URL(request.url).searchParams.get("category")?.trim();
  if (!raw || raw === "all") return null;
  return categoryLabels.get(raw) ?? raw;
}

function dbItem(row: NewsRow) {
  return {
    id: row.id,
    title: row.title,
    link: row.link,
    source: row.source,
    category: row.category,
    publishedAt: new Date(row.published_at).toUTCString(),
    imageUrl: row.image_url,
  };
}

async function ensureReadableNewsSchema(db: D1Database) {
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS news_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      link TEXT NOT NULL UNIQUE,
      source TEXT NOT NULL,
      category TEXT NOT NULL,
      published_at INTEGER NOT NULL,
      image_url TEXT,
      hidden_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`,
  ).run();

  try {
    await db.prepare("ALTER TABLE news_items ADD COLUMN image_url TEXT").run();
  } catch {
    // Column already exists.
  }

  try {
    await db.prepare("ALTER TABLE news_items ADD COLUMN hidden_at INTEGER").run();
  } catch {
    // Column already exists.
  }
}

async function countCachedNews(db: D1Database, category: string | null) {
  const query = category
    ? `SELECT COUNT(*) AS count FROM news_items WHERE hidden_at IS NULL AND category = ?`
    : `SELECT COUNT(*) AS count FROM news_items WHERE hidden_at IS NULL`;
  const row = category
    ? await db.prepare(query).bind(category).first<{ count: number }>()
    : await db.prepare(query).first<{ count: number }>();
  return row?.count ?? 0;
}

async function readCachedNews(db: D1Database, limit: number, page: number, category: string | null): Promise<NewsPage> {
  await ensureReadableNewsSchema(db);

  const total = await countCachedNews(db, category);
  const totalPages = Math.max(Math.ceil(total / limit), 1);
  const normalizedPage = Math.min(page, totalPages);
  const offset = (normalizedPage - 1) * limit;

  if (category) {
    const rows = await db.prepare(
      `SELECT id, title, link, source, category, published_at, image_url
       FROM news_items
       WHERE hidden_at IS NULL AND category = ?
       ORDER BY published_at DESC
       LIMIT ? OFFSET ?`,
    ).bind(category, limit, offset).all<NewsRow>();
    return { rows: rows.results ?? [], total, page: normalizedPage, pageSize: limit, totalPages };
  }

  const rows = await db.prepare(
    `SELECT id, title, link, source, category, published_at, image_url
     FROM news_items
     WHERE hidden_at IS NULL
     ORDER BY published_at DESC
     LIMIT ? OFFSET ?`,
  ).bind(limit, offset).all<NewsRow>();
  return { rows: rows.results ?? [], total, page: normalizedPage, pageSize: limit, totalPages };
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const limit = parseLimit(request);
  const page = parsePage(request);
  const category = parseCategory(request);

  if (!env.DB) return json({ ok: true, source: "db", category, page, pageSize: limit, total: 0, totalPages: 1, items: [], errors: ["D1 binding DB is not configured."] });

  try {
    const cached = await readCachedNews(env.DB, limit, page, category);
    return json({
      ok: true,
      source: "db",
      category,
      page: cached.page,
      pageSize: cached.pageSize,
      total: cached.total,
      totalPages: cached.totalPages,
      hasPreviousPage: cached.page > 1,
      hasNextPage: cached.page < cached.totalPages,
      items: cached.rows.map(dbItem),
      errors: [],
    });
  } catch (error) {
    return json({ ok: true, source: "db", category, page, pageSize: limit, total: 0, totalPages: 1, items: [], errors: [error instanceof Error ? error.message : "news_items table is not ready"] });
  }
};
