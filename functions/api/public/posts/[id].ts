/// <reference types="@cloudflare/workers-types" />

import { getPublicPostDetail } from "../../../_shared/db-posts";
import { errorResponse, jsonResponse, paramValue } from "../../../_shared/http";

type Env = { DB: D1Database };

type CommentRow = {
  id: string;
  post_id: string;
  body: string;
  author_id: string;
  author_nickname: string;
  created_at: number;
  updated_at: number;
};

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const id = paramValue(params, "id");
  if (!id) return errorResponse("Post id is required.", 400);

  const post = await getPublicPostDetail(env.DB, id);
  if (!post) return errorResponse("Post not found.", 404);

  const comments = await env.DB.prepare(
    `SELECT
       comments.id,
       comments.post_id,
       comments.body,
       comments.author_id,
       comments.author_id AS author_nickname,
       comments.created_at,
       comments.updated_at
     FROM comments
     WHERE comments.post_id = ?
       AND comments.deleted_at IS NULL
       AND comments.status = 'published'
       AND comments.moderation_status = 'normal'
     ORDER BY comments.created_at ASC
     LIMIT 100`,
  ).bind(id).all<CommentRow>();

  return jsonResponse({ ok: true, post, comments: comments.results ?? [] });
};
