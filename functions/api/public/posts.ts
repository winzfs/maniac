/// <reference types="@cloudflare/workers-types" />

import { listPublicPosts } from "../../_shared/db-posts";
import { errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database };

function safeLimit(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(Math.max(Math.trunc(parsed), 1), 50);
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const url = new URL(request.url);
  const posts = await listPublicPosts(env.DB, {
    board: url.searchParams.get("board"),
    category: url.searchParams.get("category"),
    limit: safeLimit(url.searchParams.get("limit")),
  });

  return jsonResponse({ ok: true, posts });
};
