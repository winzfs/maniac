/// <reference types="@cloudflare/workers-types" />

import { requireCurrentUser } from "../../_shared/auth";
import { errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

type MyPostRow = {
  id: string;
  title: string;
  body: string;
  board_slug: string;
  board_title: string;
  category: string;
  status: string;
  visibility: string;
  moderation_status: string;
  created_at: number;
  updated_at: number;
  comment_count: number;
};

const derivedCategory = "COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1))";

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  const rows = await env.DB.prepare(
    `SELECT
       posts.id,
       posts.title,
       posts.body,
       boards.slug AS board_slug,
       boards.title AS board_title,
       ${derivedCategory} AS category,
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
     WHERE posts.author_id = ?
       AND posts.deleted_at IS NULL
     GROUP BY posts.id
     ORDER BY posts.created_at DESC
     LIMIT 100`,
  ).bind(auth.user.id).all<MyPostRow>();

  return jsonResponse({ ok: true, posts: rows.results ?? [] });
};
