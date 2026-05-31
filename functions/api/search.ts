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
  board_slug: string;
  category: string;
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

const categoryAliases: Record<string, string[]> = {
  motorcycle: ["motorcycle", "bike", "바이크", "오토바이", "이륜차", "모터사이클"],
  pc: ["pc", "컴퓨터", "피씨", "커스텀pc", "커스텀 pc", "그래픽카드", "rtx", "cpu"],
  keyboard: ["keyboard", "키보드", "기계식", "기계식키보드", "기계식 키보드", "키캡", "스위치", "윤활"],
  bicycle: ["bicycle", "cycle", "자전거", "로드", "그래블"],
  camera: ["camera", "카메라", "미러리스", "렌즈", "촬영", "소니", "캐논", "후지"],
  camping: ["camping", "캠핑", "텐트", "랜턴", "아웃도어"],
  audio: ["audio", "오디오", "헤드폰", "스피커", "dac", "앰프", "이어폰"],
};

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

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function matchedCategorySlugs(query: string) {
  const compactQuery = query.toLowerCase().replace(/\s+/g, "");

  return Object.entries(categoryAliases)
    .filter(([slug, aliases]) => {
      if (compactQuery === slug) return true;
      return aliases.some((alias) => compactQuery === alias.toLowerCase().replace(/\s+/g, ""));
    })
    .map(([slug]) => slug);
}

function searchTerms(query: string) {
  const loweredQuery = query.toLowerCase();
  const compactQuery = loweredQuery.replace(/\s+/g, "");
  const terms = [loweredQuery, compactQuery, ...loweredQuery.split(" ")];

  for (const slug of matchedCategorySlugs(query)) {
    terms.push(slug, ...categoryAliases[slug]);
  }

  return unique(terms.map((term) => term.toLowerCase().trim()).filter(Boolean)).slice(0, 16);
}

function patterns(query: string) {
  return searchTerms(query).map((term) => `%${term}%`);
}

function orClause(columns: string[], patternCount: number) {
  return columns.map((column) => `LOWER(COALESCE(${column}, '')) LIKE ?`).flatMap((clause) => Array(patternCount).fill(clause)).join(" OR ");
}

function bindValues(columns: string[], searchPatterns: string[]) {
  return columns.flatMap(() => searchPatterns);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function postCategoryExpression() {
  return "COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1))";
}

async function searchEquipments(db: D1Database, searchPatterns: string[], limit: number): Promise<SearchResult[]> {
  const columns = ["category", "brand", "model", "nickname", "description", "slug"];
  const rows = await db.prepare(
    `SELECT id, category, brand, model, nickname, description, main_image_url, created_at
     FROM equipments
     WHERE deleted_at IS NULL
       AND visibility = 'public'
       AND moderation_status = 'normal'
       AND (${orClause(columns, searchPatterns.length)})
     ORDER BY created_at DESC
     LIMIT ?`,
  ).bind(...bindValues(columns, searchPatterns), limit).all<EquipmentSearchRow>();

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

async function searchPosts(db: D1Database, searchPatterns: string[], limit: number): Promise<SearchResult[]> {
  const categoryExpr = postCategoryExpression();
  const columns = ["posts.title", "posts.body", "boards.title", "boards.slug", categoryExpr, "users.nickname", "posts.author_id"];
  const rows = await db.prepare(
    `SELECT
       posts.id,
       posts.title,
       posts.body,
       boards.title AS board_title,
       boards.slug AS board_slug,
       ${categoryExpr} AS category,
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
       AND (${orClause(columns, searchPatterns.length)})
     ORDER BY posts.created_at DESC
     LIMIT ?`,
  ).bind(...bindValues(columns, searchPatterns), limit).all<PostSearchRow>();

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

async function searchNews(db: D1Database, searchPatterns: string[], limit: number): Promise<SearchResult[]> {
  const columns = ["title", "source", "category", "link"];
  const rows = await db.prepare(
    `SELECT id, title, source, category, link, published_at_ms
     FROM news_items
     WHERE hidden_at IS NULL
       AND (${orClause(columns, searchPatterns.length)})
     ORDER BY COALESCE(published_at_ms, created_at) DESC
     LIMIT ?`,
  ).bind(...bindValues(columns, searchPatterns), limit).all<NewsSearchRow>();

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

  if (query.length < 1) {
    return jsonResponse({ ok: true, query, type, results: [], groups: { equipments: [], posts: [], news: [] } });
  }

  const searchPatterns = patterns(query);
  const [equipments, posts, news] = await Promise.all([
    type === "all" || type === "equipment" ? searchEquipments(env.DB, searchPatterns, limit) : Promise.resolve([]),
    type === "all" || type === "post" ? searchPosts(env.DB, searchPatterns, limit) : Promise.resolve([]),
    type === "all" || type === "news" ? searchNews(env.DB, searchPatterns, limit) : Promise.resolve([]),
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
