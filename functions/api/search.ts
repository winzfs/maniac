/// <reference types="@cloudflare/workers-types" />

import { errorResponse, jsonResponse } from "../_shared/http";

type Env = { DB: D1Database };

type SearchType = "all" | "equipment" | "post" | "news";

type SearchResult = {
  type: SearchType;
  id: string;
  title: string;
  description: string | null;
  href: string;
  label: string;
  imageUrl?: string | null;
  createdAt?: number | null;
};

type EquipmentSearchRow = {
  id: string;
  category: string;
  brand: string | null;
  model: string | null;
  nickname: string;
  slug: string;
  description: string | null;
  main_image_url: string | null;
  created_at: number;
};

type PostSearchRow = {
  id: string;
  title: string;
  body: string;
  board_title: string;
  author_nickname: string;
  created_at: number;
};

type NewsSearchRow = {
  id: string;
  title: string;
  source: string | null;
  category: string | null;
  link: string;
  published_at_ms: number | null;
};

function normalizeQuery(value: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}

function parseType(value: string | null): SearchType {
  if (value === "equipment" || value === "post" || value === "news") return value;
  return "all";
}

function parseLimit(value: string | null) {
  const parsed = Number(value ?? 8);
  if (!Number.isFinite(parsed)) return 8;
  return Math.min(Math.max(Math.trunc(parsed), 1), 20);
}

function likePattern(query: string) {
  return `%${query.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function searchEquipments(db: D1Database, pattern: string, limit: number): Promise<SearchResult[]> {
  const rows = await db.prepare(
    `SELECT id, category, brand, model, nickname, slug, description, main_image_url, created_at
     FROM equipments
     WHERE deleted_at IS NULL
       AND visibility = 'public'
       AND moderation_status = 'normal'
       AND (
         nickname LIKE ? ESCAPE '\\'
         OR COALESCE(brand, '') LIKE ? ESCAPE '\\'
         OR COALESCE(model, '') LIKE ? ESCAPE '\\'
         OR COALESCE(description, '') LIKE ? ESCAPE '\\'
         OR category LIKE ? ESCAPE '\\'
       )
     ORDER BY created_at DESC
     LIMIT ?`,
  ).bind(pattern, pattern, pattern, pattern, pattern, limit).all<EquipmentSearchRow>();

  return (rows.results ?? []).map((row) => ({
    type: "equipment",
    id: row.id,
    title: row.nickname,
    description: [row.brand, row.model, row.description].filter(Boolean).join(" · ") || row.category,
    href: `/garage/view/?id=${encodeURIComponent(row.id)}`,
    label: "공개 장비",
    imageUrl: row.main_image_url,
    createdAt: row.created_at,
  }));
}

async function searchPosts(db: D1Database, pattern: string, limit: number): Promise<SearchResult[]> {
  const rows = await db.prepare(
    `SELECT
       posts.id,
       posts.title,
       posts.body,
       boards.title AS board_title,
       COALESCE(users.nickname, posts.author_id) AS author_nickname,
       posts.created_at
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     LEFT JOIN users ON users.id = posts.author_id
     WHERE posts.deleted_at IS NULL
       AND posts.status = 'published'
       AND posts.visibility = 'public'
       AND posts.moderation_status = 'normal'
       AND boards.status = 'active'
       AND boards.permission = 'public'
       AND (
         posts.title LIKE ? ESCAPE '\\'
         OR posts.body LIKE ? ESCAPE '\\'
         OR boards.title LIKE ? ESCAPE '\\'
         OR COALESCE(users.nickname, posts.author_id) LIKE ? ESCAPE '\\'
       )
     ORDER BY posts.created_at DESC
     LIMIT ?`,
  ).bind(pattern, pattern, pattern, pattern, limit).all<PostSearchRow>();

  return (rows.results ?? []).map((row) => ({
    type: "post",
    id: row.id,
    title: row.title,
    description: stripHtml(row.body).slice(0, 140) || `${row.board_title} · ${row.author_nickname}`,
    href: `/explore/post/?id=${encodeURIComponent(row.id)}`,
    label: row.board_title,
    createdAt: row.created_at,
  }));
}

async function searchNews(db: D1Database, pattern: string, limit: number): Promise<SearchResult[]> {
  const rows = await db.prepare(
    `SELECT id, title, source, category, link, published_at_ms
     FROM news_items
     WHERE hidden_at IS NULL
       AND (
         title LIKE ? ESCAPE '\\'
         OR COALESCE(source, '') LIKE ? ESCAPE '\\'
         OR COALESCE(category, '') LIKE ? ESCAPE '\\'
       )
     ORDER BY COALESCE(published_at_ms, created_at) DESC
     LIMIT ?`,
  ).bind(pattern, pattern, pattern, limit).all<NewsSearchRow>();

  return (rows.results ?? []).map((row) => ({
    type: "news",
    id: row.id,
    title: row.title,
    description: row.source,
    href: row.link,
    label: row.category ? `뉴스 · ${row.category}` : "장비 뉴스",
    createdAt: row.published_at_ms,
  }));
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const url = new URL(request.url);
  const query = normalizeQuery(url.searchParams.get("q"));
  const type = parseType(url.searchParams.get("type"));
  const limit = parseLimit(url.searchParams.get("limit"));

  if (query.length < 2) {
    return jsonResponse({ ok: true, query, type, results: [], groups: { equipments: [], posts: [], news: [] } });
  }

  const pattern = likePattern(query);
  const [equipments, posts, news] = await Promise.all([
    type === "all" || type === "equipment" ? searchEquipments(env.DB, pattern, limit) : Promise.resolve([]),
    type === "all" || type === "post" ? searchPosts(env.DB, pattern, limit) : Promise.resolve([]),
    type === "all" || type === "news" ? searchNews(env.DB, pattern, limit) : Promise.resolve([]),
  ]);

  const results = [...equipments, ...posts, ...news].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return jsonResponse({
    ok: true,
    query,
    type,
    results,
    groups: { equipments, posts, news },
  });
};
