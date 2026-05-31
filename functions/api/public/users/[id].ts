/// <reference types="@cloudflare/workers-types" />

import { errorResponse, jsonResponse, paramValue } from "../../../_shared/http";

type Env = { DB: D1Database };

type PublicUserRow = {
  id: string;
  nickname: string;
  bio: string | null;
  profile_image_url: string | null;
  created_at: number | null;
};

type UserPostRow = {
  id: string;
  title: string;
  board_title: string;
  board_slug: string;
  category: string;
  created_at: number;
  comment_count: number;
};

async function ignoreDuplicateColumn(operation: Promise<unknown>) {
  try {
    await operation;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    if (!message.includes("duplicate column") && !message.includes("already exists")) throw error;
  }
}

async function ensurePublicProfileColumns(db: D1Database) {
  await ignoreDuplicateColumn(db.prepare("ALTER TABLE users ADD COLUMN bio TEXT").run());
  await ignoreDuplicateColumn(db.prepare("ALTER TABLE users ADD COLUMN profile_image_url TEXT").run());
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const id = paramValue(params, "id");
  if (!id) return errorResponse("User id is required.", 400);

  await ensurePublicProfileColumns(env.DB);

  const user = await env.DB.prepare(
    `SELECT id, nickname, bio, profile_image_url, created_at
     FROM users
     WHERE id = ? AND deleted_at IS NULL
     LIMIT 1`,
  ).bind(id).first<PublicUserRow>();

  if (!user) return errorResponse("User not found.", 404);

  const posts = await env.DB.prepare(
    `SELECT
       posts.id,
       posts.title,
       boards.title AS board_title,
       boards.slug AS board_slug,
       COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1)) AS category,
       posts.created_at,
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
       AND posts.status = 'published'
       AND posts.visibility = 'public'
       AND posts.moderation_status = 'normal'
       AND boards.status = 'active'
       AND boards.permission = 'public'
     GROUP BY posts.id
     ORDER BY posts.created_at DESC
     LIMIT 20`,
  ).bind(id).all<UserPostRow>();

  return jsonResponse({ ok: true, user, posts: posts.results ?? [] });
};
