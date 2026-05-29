/// <reference types="@cloudflare/workers-types" />

import { errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database };

type PostRow = {
  id: string;
  board_id: string;
  board_slug: string;
  board_title: string;
  category: string;
  title: string;
  body: string;
  author_id: string;
  author_nickname: string;
  status: string;
  visibility: string;
  moderation_status: string;
  created_at: number;
  updated_at: number;
  comment_count: number;
};

function safeLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(Math.max(Math.trunc(parsed), 1), 50);
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const url = new URL(request.url);
  const board = url.searchParams.get("board");
  const category = url.searchParams.get("category");
  const limit = safeLimit(url.searchParams.get("limit"));

  const derivedCategory = "COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1))";
  const conditions = [
    "posts.deleted_at IS NULL",
    "posts.status = 'published'",
    "posts.visibility = 'public'",
    "posts.moderation_status = 'normal'",
    "boards.status = 'active'",
    "boards.permission = 'public'",
  ];
  const values: unknown[] = [];

  if (board) {
    conditions.push("boards.slug = ?");
    values.push(board);
  }

  if (category) {
    conditions.push(`${derivedCategory} = ?`);
    values.push(category);
  }

  values.push(limit);

  const rows = await env.DB.prepare(
    `SELECT
       posts.id,
       posts.board_id,
       boards.slug AS board_slug,
       boards.title AS board_title,
       ${derivedCategory} AS category,
       posts.title,
       posts.body,
       posts.author_id,
       posts.author_id AS author_nickname,
       posts.status,
       posts.visibility,
       posts.moderation_status,
       posts.created_at,
       posts.updated_at,
       COUNT(comments.id) AS comment_count
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     LEFT JOIN comments
       ON comments.post_id = posts.id
      AND comments.deleted_at IS NULL
      AND comments.status = 'published'
      AND comments.moderation_status = 'normal'
     WHERE ${conditions.join(" AND ")}
     GROUP BY posts.id
     ORDER BY posts.created_at DESC
     LIMIT ?`,
  ).bind(...values).all<PostRow>();

  return jsonResponse({ ok: true, posts: rows.results ?? [] });
};
