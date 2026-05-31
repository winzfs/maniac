/// <reference types="@cloudflare/workers-types" />

import { requireAdminUser } from "../../../_shared/require-admin";
import { errorResponse, jsonResponse, paramValue } from "../../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireAdminUser(request, env);
  if (auth.response) return auth.response;

  const id = paramValue(params, "id");
  if (!id) return errorResponse("게시글 id가 필요합니다.", 400);

  await env.DB.batch([
    env.DB.prepare("DELETE FROM comments WHERE post_id = ?").bind(id),
    env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(id),
  ]);

  return jsonResponse({ ok: true });
};
