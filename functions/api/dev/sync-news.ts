/// <reference types="@cloudflare/workers-types" />

import { fetchExternalNews } from "../../_shared/news";

type Env = { DB: D1Database };

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

function message(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function stableNewsId(link: string) {
  let hash = 0;
  for (let index = 0; index < link.length; index += 1) {
    hash = Math.imul(31, hash) + link.charCodeAt(index) | 0;
  }
  return `news_${Math.abs(hash).toString(36)}`;
}

function parseLimit(request: Request) {
  const url = new URL(request.url);
  const value = Number(url.searchParams.get("limit") ?? 30);
  if (!Number.isFinite(value)) return 30;
  return Math.min(Math.max(Math.trunc(value), 1), 50);
}

async function syncNews(request: Request, env: Env) {
  if (!env.DB) return json({ ok: false, error: "D1 binding DB is not configured." }, 500);

  const limit = parseLimit(request);
  const fetched = await fetchExternalNews(limit);
  const now = Date.now();

  const statements = fetched.items.map((item) => env.DB.prepare(
    `INSERT OR IGNORE INTO news_items
       (id, title, link, source, category, published_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    stableNewsId(item.link),
    item.title,
    item.link,
    item.source,
    item.category,
    item.publishedAtMs,
    now,
    now,
  ));

  if (statements.length > 0) await env.DB.batch(statements);

  const total = await env.DB.prepare(
    `SELECT COUNT(*) AS count
     FROM news_items
     WHERE hidden_at IS NULL`,
  ).first<{ count: number }>();

  return json({
    ok: true,
    fetched: fetched.items.length,
    attemptedInsert: statements.length,
    totalStored: total?.count ?? 0,
    errors: fetched.errors,
  });
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    return await syncNews(request, env);
  } catch (error) {
    return json({ ok: false, error: message(error) }, 500);
  }
};

export const onRequestPost = onRequestGet;
