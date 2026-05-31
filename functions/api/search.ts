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
  maintenance_text: string | null;
  part_text: string | null;
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
  motorcycle: ["motorcycle", "bike", "바이크", "오토바이", "이륜차", "모터사이클", "라이딩"],
  pc: ["pc", "컴퓨터", "커스텀 pc", "커스텀피씨", "피씨", "게이밍", "그래픽카드", "rtx", "cpu"],
  keyboard: ["keyboard", "키보드", "기계식 키보드", "기계식", "키캡", "스위치", "윤활", "타건"],
  bicycle: ["bicycle", "cycle", "자전거", "로드", "그래블", "라이딩", "타이어"],
  camera: ["camera", "카메라", "미러리스", "렌즈", "촬영", "바디", "후지", "소니", "캐논"],
  camping: ["camping", "캠핑", "캠핑 장비", "텐트", "랜턴", "아웃도어"],
  audio: ["audio", "오디오", "헤드폰", "스피커", "dac", "앰프", "이어폰"],
  custom: ["custom", "기타", "기타 장비", "취미", "장비"],
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

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function expandSearchTerms(query: string) {
  const loweredQuery = query.toLowerCase();
  const tokens = loweredQuery.split(" ").map((token) => token.trim()).filter((token) => token.length >= 2);
  const expanded = [loweredQuery, ...tokens];

  for (const [slug, aliases] of Object.entries(categoryAliases)) {
    if (aliases.some((alias) => loweredQuery.includes(alias.toLowerCase()))) {
      expanded.push(slug, ...aliases.map((alias) => alias.toLowerCase()));
    }
  }

  return unique(expanded).slice(0, 12);
}

function likePatterns(query: string) {
  return expandSearchTerms(query).map((term) => `%${term}%`);
}

function orLikeClause(columns: string[], patternCount: number) {
  return columns.map((column) => `LOWER(COALESCE(${column}, '')) LIKE ?`).flatMap((clause) => Array(patternCount).fill(clause)).join(" OR ");
}

function bindSearchValues(columns: string[], patterns: string[]) {
  return columns.flatMap(() => patterns);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function searchEquipments(db: D1Database, patterns: string[], limit: number): Promise<SearchResult[]> {
  const searchableColumns = [
    "equipments.nickname",
    "equipments.brand",
    "equipments.model",
    "equipments.description",
    "equipments.category",
    "equipments.slug",
    "maintenance_text",
    "part_text",
  ];
  const values = bindSearchValues(searchableColumns, patterns);

  const rows = await db.prepare(
    `SELECT
       equipments.id,
       equipments.category,
       equipments.brand,
       equipments.model,
       equipments.nickname,
       equipments.slug,
       equipments.description,
       equipments.main_image_url,
       equipments.created_at,
       GROUP_CONCAT(DISTINCT maintenance_logs.title) AS maintenance_text,
       GROUP_CONCAT(DISTINCT parts.name || ' ' || COALESCE(parts.brand, '')) AS part_text
     FROM equipments
     LEFT JOIN maintenance_logs
       ON maintenance_logs.equipment_id = equipments.id
      AND maintenance_logs.deleted_at IS NULL
      AND maintenance_logs.visibility = 'public'
      AND maintenance_logs.moderation_status = 'normal'
     LEFT JOIN parts
       ON parts.equipment_id = equipments.id
      AND parts.deleted_at IS NULL
      AND parts.visibility = 'public'
      AND parts.moderation_status = 'normal'
     WHERE equipments.deleted_at IS NULL
       AND equipments.visibility = 'public'
       AND equipments.moderation_status = 'normal'
     GROUP BY equipments.id
     HAVING ${orLikeClause(searchableColumns, patterns.length)}
     ORDER BY equipments.created_at DESC
     LIMIT ?`,
  ).bind(...values, limit).all<EquipmentSearchRow>();

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

async function searchPosts(db: D1Database, patterns: string[], limit: number): Promise<SearchResult[]> {
  const derivedCategory = "COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1))";
  const searchableColumns = [
    "posts.title",
    "posts.body",
    "boards.title",
    "boards.slug",
    derivedCategory,
    "users.nickname",
    "posts.author_id",
  ];
  const values = bindSearchValues(searchableColumns, patterns);

  const rows = await db.prepare(
    `SELECT
       posts.id,
       posts.title,
       posts.body,
       boards.title AS board_title,
       boards.slug AS board_slug,
       ${derivedCategory} AS category,
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
       AND (${orLikeClause(searchableColumns, patterns.length)})
     ORDER BY posts.created_at DESC
     LIMIT ?`,
  ).bind(...values, limit).all<PostSearchRow>();

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

async function searchNews(db: D1Database, patterns: string[], limit: number): Promise<SearchResult[]> {
  const searchableColumns = ["title", "source", "category", "link"];
  const values = bindSearchValues(searchableColumns, patterns);

  const rows = await db.prepare(
    `SELECT id, title, source, category, link, published_at_ms
     FROM news_items
     WHERE hidden_at IS NULL
       AND (${orLikeClause(searchableColumns, patterns.length)})
     ORDER BY COALESCE(published_at_ms, created_at) DESC
     LIMIT ?`,
  ).bind(...values, limit).all<NewsSearchRow>();

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

  const patterns = likePatterns(query);
  const [equipments, posts, news] = await Promise.all([
    type === "all" || type === "equipment" ? searchEquipments(env.DB, patterns, limit) : Promise.resolve([]),
    type === "all" || type === "post" ? searchPosts(env.DB, patterns, limit) : Promise.resolve([]),
    type === "all" || type === "news" ? searchNews(env.DB, patterns, limit) : Promise.resolve([]),
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
