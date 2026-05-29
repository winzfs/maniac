/// <reference types="@cloudflare/workers-types" />

import { requireCurrentUser } from "../../_shared/auth";
import { errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

type MyCommentRow = {
  id: string;
  body: string;
  post_id: string;
  post_title: string;
  board_slug: string;
  board_title: string;
  created_at: number;
  updated_at: number;
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  const rows = await env.DB.prepare(
    `SELECT
       comments.id,
       comments.body,
       comments.post_id,
       posts.title AS post_title,
       boards.slug AS board_slug,
       boards.title AS board_title,
       comments.created_at,
       comments.updated_at
     FROM comments
     INNER JOIN posts ON posts.id = comments.post_id
     INNER JOIN boards ON boards.id = posts.board_id
     WHERE comments.author_id = ?
       AND comments.deleted_at IS NULL
       AND posts.deleted_at IS NULL
     ORDER BY comments.created_at DESC
     LIMIT 100`,
  ).bind(auth.user.id).all<MyCommentRow>();

  return jsonResponse({ ok: true, comments: rows.results ?? [] });
};
