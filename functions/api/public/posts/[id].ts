/// <reference types="@cloudflare/workers-types" />

import { errorResponse, jsonResponse, paramValue } from "../../../_shared/http";

type Env = { DB: D1Database };

type PostRow = {
  id: string;
  board_id: string;
  board_slug: string;
  board_title: string;
  board_description: string | null;
  board_type: string;
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
};

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

  const derivedCategory = "COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1))";

  const post = await env.DB.prepare(
    `SELECT
       posts.id,
       posts.board_id,
       boards.slug AS board_slug,
       boards.title AS board_title,
       boards.description AS board_description,
       boards.type AS board_type,
       ${derivedCategory} AS category,
       posts.title,
       posts.body,
       posts.author_id,
       posts.author_id AS author_nickname,
       posts.status,
       posts.visibility,
       posts.moderation_status,
       posts.created_at,
       posts.updated_at
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     WHERE posts.id = ?
       AND posts.deleted_at IS NULL
       AND posts.status = 'published'
       AND posts.visibility = 'public'
       AND posts.moderation_status = 'normal'
       AND boards.status = 'active'
       AND boards.permission = 'public'
     LIMIT 1`,
  ).bind(id).first<PostRow>();

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
