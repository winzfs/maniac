/// <reference types="@cloudflare/workers-types" />

type Env = {
  DB: D1Database;
  APP_ENV?: string;
  DEV_TOOLS_ENABLED?: string;
  DEV_TOOLS_SECRET?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function isEnabled(env: Env) {
  return env.DEV_TOOLS_ENABLED === "true" || env.APP_ENV !== "production";
}

function isAuthorized(request: Request, env: Env) {
  if (!env.DEV_TOOLS_SECRET) return env.APP_ENV !== "production";

  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  const headerSecret = request.headers.get("x-dev-tools-secret");
  return querySecret === env.DEV_TOOLS_SECRET || headerSecret === env.DEV_TOOLS_SECRET;
}

async function ensureNewsSchema(db: D1Database) {
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
    await db.prepare("ALTER TABLE news_items ADD COLUMN hidden_at INTEGER").run();
  } catch {
    // Column already exists.
  }
}

function getTarget(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id")?.trim();
  const link = url.searchParams.get("link")?.trim();

  if (id) return { key: "id", value: id } as const;
  if (link) return { key: "link", value: link } as const;
  return null;
}

async function hideNews(request: Request, env: Env) {
  if (!isEnabled(env)) return json({ ok: false, error: "Dev tools are disabled." }, 404);
  if (!isAuthorized(request, env)) return json({ ok: false, error: "Unauthorized." }, 401);
  if (!env.DB) return json({ ok: false, error: "D1 binding DB is not configured." }, 500);

  await ensureNewsSchema(env.DB);

  const target = getTarget(request);
  if (!target) return json({ ok: false, error: "id or link query parameter is required." }, 400);

  const now = Date.now();
  const result = target.key === "id"
    ? await env.DB.prepare("UPDATE news_items SET hidden_at = ?, updated_at = ? WHERE id = ?").bind(now, now, target.value).run()
    : await env.DB.prepare("UPDATE news_items SET hidden_at = ?, updated_at = ? WHERE link = ?").bind(now, now, target.value).run();

  return json({
    ok: true,
    hidden: result.meta.changes,
    target,
  });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => hideNews(request, env);
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => hideNews(request, env);
