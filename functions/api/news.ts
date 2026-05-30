/// <reference types="@cloudflare/workers-types" />

import { fetchExternalNews } from "../_shared/news";

type Env = { DB?: D1Database };

type NewsRow = {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  published_at: number;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300",
    },
  });
}

function parseLimit(request: Request) {
  const url = new URL(request.url);
  const value = Number(url.searchParams.get("limit") ?? 12);
  if (!Number.isFinite(value)) return 12;
  return Math.min(Math.max(Math.trunc(value), 1), 24);
}

function dbItem(row: NewsRow) {
  return {
    id: row.id,
    title: row.title,
    link: row.link,
    source: row.source,
    category: row.category,
    publishedAt: new Date(row.published_at).toUTCString(),
  };
}

async function readCachedNews(db: D1Database, limit: number) {
  const rows = await db.prepare(
    `SELECT id, title, link, source, category, published_at
     FROM news_items
     WHERE hidden_at IS NULL
     ORDER BY published_at DESC
     LIMIT ?`,
  ).bind(limit).all<NewsRow>();

  return rows.results ?? [];
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const limit = parseLimit(request);

  if (env.DB) {
    try {
      const cached = await readCachedNews(env.DB, limit);
      if (cached.length > 0) {
        return json({ ok: true, source: "db", items: cached.map(dbItem), errors: [] });
      }
    } catch {
      // news_items migration may not be applied yet. Fall back to external RSS.
    }
  }

  const external = await fetchExternalNews(limit);
  return json({ ok: true, source: "rss", items: external.items, errors: external.errors });
};
