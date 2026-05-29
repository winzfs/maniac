/// <reference types="@cloudflare/workers-types" />

import { requireCurrentUser } from "../../../_shared/auth";
import { allowMethods, errorResponse, jsonResponse, paramValue } from "../../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  const id = paramValue(params, "id");
  if (!id) return errorResponse("Comment id is required.", 400);

  const comment = await env.DB.prepare(
    `SELECT id
     FROM comments
     WHERE id = ?
       AND author_id = ?
       AND deleted_at IS NULL
     LIMIT 1`,
  ).bind(id, auth.user.id).first<{ id: string }>();

  if (!comment) return errorResponse("Comment not found.", 404);

  const now = Date.now();
  await env.DB.prepare(
    `UPDATE comments
     SET deleted_at = ?, updated_at = ?
     WHERE id = ?
       AND author_id = ?
       AND deleted_at IS NULL`,
  ).bind(now, now, id, auth.user.id).run();

  return jsonResponse({ ok: true, deletedId: id });
};

export const onRequestOptions = () => allowMethods(["DELETE", "OPTIONS"]);
