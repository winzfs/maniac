/// <reference types="@cloudflare/workers-types" />

import { errorResponse, jsonResponse } from "../_shared/http";

type Env = { DB: D1Database };

type SearchType = "all" | "equipment" | "post" | "news";

type SearchResult = {
  type: "equipment" | "post" | "news";
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
  description: string | null;
  main_image_url: string | null;
  created_at: number;
};

type PostSearchRow = {
  id: string;
  title: string;
  body: string;
  board_title: string;
  created_at: number;
};

type NewsSearchRow = {
  id: string;
  title: string;
  source: string | null;
  category: string | null;
  link: string;
  published_at: number | null;
};

type SearchBucket = "equipment" | "post" | "news";

function normalizeQuery(value: string | null) {
  return (value ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
}

function parseType(value: string | null): SearchType {
  if (value === "equipment" || value === "post" || value === "news") return value;
  return "all";
}

function parseLimit(value: string | null) {
  const parsed = Number(value ?? 20);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(Math.max(Math.trunc(parsed), 1), 30);
}

function pattern(query: string) {
  return `%${query.toLowerCase()}%`;
}

function orClause(columns: string[]) {
  return columns.map((column) => `LOWER(COALESCE(${column}, '')) LIKE ?`).join(" OR ");
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function safeSearch(bucket: SearchBucket, task: () => Promise<SearchResult[]>) {
  try {
    return { bucket, results: await task(), warning: null as string | null };
  } catch (error) {
    const message = error instanceof Error ? error.message : "검색 중 오류가 발생했습니다.";
    return { bucket, results: [] as SearchResult[], warning: `${bucket}: ${message}` };
  }
}

async function searchEquipments(db: D1Database, searchPattern: string, limit: number): Promise<SearchResult[]> {
  const columns = ["nickname", "brand", "model", "description"];
  const rows = await db.prepare(
    `SELECT id, category, brand, model, nickname, description, main_image_url, created_at
     FROM equipments
     WHERE deleted_at IS NULL
       AND visibility = 'public'
       AND moderation_status = 'normal'
       AND (${orClause(columns)})
     ORDER BY created_at DESC
     LIMIT ?`,
  ).bind(...columns.map(() => searchPattern), limit).all<EquipmentSearchRow>();

  return (rows.results ?? []).map((row) => ({
    type: "equipment",
    id: row.id,
    title: row.nickname,
    description: [row.brand, row.model, row.description].filter(Boolean).join(" · ") || row.category,
    href: `/gears/${encodeURIComponent(row.id)}/`,
    label: "공개 장비",
    imageUrl: row.main_image_url,
    createdAt: row.created_at,
  }));
}

async function searchPosts(db: D1Database, searchPattern: string, limit: number): Promise<SearchResult[]> {
  const columns = ["posts.title", "posts.body"];
  const rows = await db.prepare(
    `SELECT
       posts.id,
       posts.title,
       posts.body,
       boards.title AS board_title,
       posts.created_at
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     WHERE posts.deleted_at IS NULL
       AND posts.status = 'published'
       AND posts.visibility = 'public'
       AND posts.moderation_status = 'normal'
       AND boards.status = 'active'
       AND boards.permission = 'public'
       AND (${orClause(columns)})
     ORDER BY posts.created_at DESC
     LIMIT ?`,
  ).bind(...columns.map(() => searchPattern), limit).all<PostSearchRow>();

  return (rows.results ?? []).map((row) => ({
    type: "post",
    id: row.id,
    title: row.title,
    description: stripHtml(row.body).slice(0, 140) || row.board_title,
    href: `/posts/${encodeURIComponent(row.id)}/`,
    label: row.board_title,
    createdAt: row.created_at,
  }));
}

async function searchNews(db: D1Database, searchPattern: string, limit: number): Promise<SearchResult[]> {
  const columns = ["title"];
  const rows = await db.prepare(
    `SELECT id, title, source, category, link, published_at
     FROM news_items
     WHERE hidden_at IS NULL
       AND (${orClause(columns)})
     ORDER BY COALESCE(published_at, created_at) DESC
     LIMIT ?`,
  ).bind(...columns.map(() => searchPattern), limit).all<NewsSearchRow>();

  return (rows.results ?? []).map((row) => ({
    type: "news",
    id: row.id,
    title: row.title,
    description: row.source,
    href: row.link,
    label: row.category ? `뉴스 · ${row.category}` : "장비 뉴스",
    createdAt: row.published_at,
  }));
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const url = new URL(request.url);
  const query = normalizeQuery(url.searchParams.get("q"));
  const type = parseType(url.searchParams.get("type"));
  const limit = parseLimit(url.searchParams.get("limit"));

  if (query.length < 1) {
    return jsonResponse({ ok: true, query, type, results: [], groups: { equipments: [], posts: [], news: [] }, warnings: [] });
  }

  const searchPattern = pattern(query);
  const tasks = [
    type === "all" || type === "equipment" ? safeSearch("equipment", () => searchEquipments(env.DB, searchPattern, limit)) : null,
    type === "all" || type === "post" ? safeSearch("post", () => searchPosts(env.DB, searchPattern, limit)) : null,
    type === "all" || type === "news" ? safeSearch("news", () => searchNews(env.DB, searchPattern, limit)) : null,
  ].filter((task): task is Promise<{ bucket: SearchBucket; results: SearchResult[]; warning: string | null }> => Boolean(task));

  const settled = await Promise.all(tasks);
  const equipments = settled.find((item) => item.bucket === "equipment")?.results ?? [];
  const posts = settled.find((item) => item.bucket === "post")?.results ?? [];
  const news = settled.find((item) => item.bucket === "news")?.results ?? [];
  const warnings = settled.map((item) => item.warning).filter(Boolean);
  const results = [...equipments, ...posts, ...news].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

  return jsonResponse({
    ok: true,
    query,
    type,
    results,
    groups: { equipments, posts, news },
    warnings,
  });
};
