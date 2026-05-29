/// <reference types="@cloudflare/workers-types" />

import { errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database };

type BoardRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  description: string | null;
  status: string;
  permission: string;
  sort_order: number;
  post_count: number;
};

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const rows = await env.DB.prepare(
    `SELECT
       boards.id,
       boards.slug,
       boards.title,
       boards.category,
       boards.type,
       boards.description,
       boards.status,
       boards.permission,
       boards.sort_order,
       COUNT(posts.id) AS post_count
     FROM boards
     LEFT JOIN posts
       ON posts.board_id = boards.id
      AND posts.deleted_at IS NULL
      AND posts.status = 'published'
      AND posts.visibility = 'public'
      AND posts.moderation_status = 'normal'
     WHERE boards.status = 'active'
       AND boards.permission = 'public'
     GROUP BY boards.id
     ORDER BY boards.category ASC, boards.sort_order ASC, boards.slug ASC`,
  ).all<BoardRow>();

  return jsonResponse({ ok: true, boards: rows.results ?? [] });
};
