/// <reference types="@cloudflare/workers-types" />

import { requireAdminUser } from "../../_shared/require-admin";
import { errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

type AdminPostRow = {
  id: string;
  title: string;
  body: string;
  board_title: string;
  board_slug: string;
  category: string;
  author_nickname: string | null;
  author_email: string | null;
  created_at: number;
  comment_count: number;
};

type AdminCommentRow = {
  id: string;
  post_id: string;
  post_title: string;
  body: string;
  author_nickname: string | null;
  author_email: string | null;
  created_at: number;
};

type AdminNewsRow = {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  published_at: number;
  image_url: string | null;
};

function safeLimit(value: string | null) {
  const parsed = Number(value ?? 30);
  if (!Number.isFinite(parsed)) return 30;
  return Math.min(Math.max(Math.trunc(parsed), 1), 100);
}

async function listPosts(db: D1Database, limit: number) {
  const rows = await db.prepare(
    `SELECT
       posts.id,
       posts.title,
       posts.body,
       boards.title AS board_title,
       boards.slug AS board_slug,
       COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1)) AS category,
       users.nickname AS author_nickname,
       users.email AS author_email,
       posts.created_at,
       COUNT(comments.id) AS comment_count
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     LEFT JOIN users ON users.id = posts.author_id
     LEFT JOIN comments ON comments.post_id = posts.id AND comments.deleted_at IS NULL
     WHERE posts.deleted_at IS NULL
     GROUP BY posts.id
     ORDER BY posts.created_at DESC
     LIMIT ?`,
  ).bind(limit).all<AdminPostRow>();
  return rows.results ?? [];
}

async function listComments(db: D1Database, limit: number) {
  const rows = await db.prepare(
    `SELECT
       comments.id,
       comments.post_id,
       posts.title AS post_title,
       comments.body,
       users.nickname AS author_nickname,
       users.email AS author_email,
       comments.created_at
     FROM comments
     LEFT JOIN posts ON posts.id = comments.post_id
     LEFT JOIN users ON users.id = comments.author_id
     WHERE comments.deleted_at IS NULL
     ORDER BY comments.created_at DESC
     LIMIT ?`,
  ).bind(limit).all<AdminCommentRow>();
  return rows.results ?? [];
}

async function listNews(db: D1Database, limit: number) {
  const rows = await db.prepare(
    `SELECT id, title, link, source, category, published_at, image_url
     FROM news_items
     WHERE hidden_at IS NULL
     ORDER BY published_at DESC
     LIMIT ?`,
  ).bind(limit).all<AdminNewsRow>();
  return rows.results ?? [];
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireAdminUser(request, env);
  if (auth.response) return auth.response;

  const limit = safeLimit(new URL(request.url).searchParams.get("limit"));

  try {
    const [posts, comments, news] = await Promise.all([
      listPosts(env.DB, limit),
      listComments(env.DB, limit),
      listNews(env.DB, limit),
    ]);

    return jsonResponse({ ok: true, user: auth.user, posts, comments, news });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "관리자 데이터를 불러오지 못했습니다.", 500);
  }
};
