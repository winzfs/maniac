/// <reference types="@cloudflare/workers-types" />

import { getPublicPostDetail, listPublicComments } from "../../../_shared/db-posts";
import { errorResponse, jsonResponse, paramValue } from "../../../_shared/http";

type Env = { DB: D1Database };

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const id = paramValue(params, "id");
  if (!id) return errorResponse("Post id is required.", 400);

  const post = await getPublicPostDetail(env.DB, id);
  if (!post) return errorResponse("Post not found.", 404);

  const comments = await listPublicComments(env.DB, id);

  return jsonResponse({ ok: true, post, comments });
};
