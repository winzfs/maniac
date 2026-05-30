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
      "cache-control": "public, max-age=300",
    },
  });
}

function parseLimit(request: Request) {
  const url = new URL(request.url);
  const value = Number(url.searchParams.get("limit") ?? 12);
  if (!Number.isFinite(value)) return 12;
  return Math.min(Math.max(Math.trunc(value), 1), 50);
}

function parseCategory(request: Request) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("category")?.trim();
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
  };
}

async function readCachedNews(db: D1Database, limit: number, category: string | null) {
  if (category) {
    const rows = await db.prepare(
      `SELECT id, title, link, source, category, published_at
       FROM news_items
       WHERE hidden_at IS NULL AND category = ?
       ORDER BY published_at DESC
       LIMIT ?`,
    ).bind(category, limit).all<NewsRow>();

    return rows.results ?? [];
  }

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
  const category = parseCategory(request);

  if (env.DB) {
    try {
      const cached = await readCachedNews(env.DB, limit, category);
      if (cached.length > 0) {
        return json({ ok: true, source: "db", category, items: cached.map(dbItem), errors: [] });
      }
    } catch {
      // news_items migration may not be applied yet. Fall back to external RSS.
    }
  }

  const external = await fetchExternalNews(limit);
  const items = category ? external.items.filter((item) => item.category === category) : external.items;
  return json({ ok: true, source: "rss", category, items, errors: external.errors });
};
