/// <reference types="@cloudflare/workers-types" />

import { requireCurrentUser } from "../../_shared/auth";
import { errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

type CountRow = { count: number };

type RecentPostRow = {
  id: string;
  title: string;
  board_slug: string;
  board_title: string;
  category: string;
  created_at: number;
  comment_count: number;
};

const derivedCategory = "COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1))";

async function countByQuery(db: D1Database, sql: string, userId: string) {
  const row = await db.prepare(sql).bind(userId).first<CountRow>();
  return row?.count ?? 0;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  const userId = auth.user.id;

  const [equipmentCount, postCount, commentCount] = await Promise.all([
    countByQuery(env.DB, "SELECT COUNT(*) AS count FROM equipments WHERE user_id = ? AND deleted_at IS NULL", userId),
    countByQuery(env.DB, "SELECT COUNT(*) AS count FROM posts WHERE author_id = ? AND deleted_at IS NULL", userId),
    countByQuery(env.DB, "SELECT COUNT(*) AS count FROM comments WHERE author_id = ? AND deleted_at IS NULL", userId),
  ]);

  const recentPosts = await env.DB.prepare(
    `SELECT
       posts.id,
       posts.title,
       boards.slug AS board_slug,
       boards.title AS board_title,
       ${derivedCategory} AS category,
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
     GROUP BY posts.id
     ORDER BY posts.created_at DESC
     LIMIT 5`,
  ).bind(userId).all<RecentPostRow>();

  return jsonResponse({
    ok: true,
    summary: {
      equipmentCount,
      postCount,
      commentCount,
      recentPosts: recentPosts.results ?? [],
    },
  });
};
