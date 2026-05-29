/// <reference types="@cloudflare/workers-types" />

import { sanitizePostHtml } from "../../../../src/features/boards/utils/html";
import { requireCurrentUser } from "../../../_shared/auth";
import { allowMethods, errorResponse, getErrorMessage, isRecord, jsonResponse, paramValue, readJsonObject } from "../../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

type MyPostRow = {
  id: string;
  board_id: string;
  board_slug: string;
  board_title: string;
  category: string;
  title: string;
  body: string;
  status: string;
  visibility: string;
  moderation_status: string;
  created_at: number;
  updated_at: number;
  comment_count: number;
};

const maxTitleLength = 120;
const maxPostBodyLength = 200_000;
const derivedCategory = "COALESCE(NULLIF(boards.category, ''), substr(boards.slug, 1, instr(boards.slug || '-', '-') - 1))";

function textField(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function postDetailPath(id: string) {
  return `/explore/post/?id=${encodeURIComponent(id)}`;
}

async function findMyPost(db: D1Database, id: string, userId: string) {
  return db.prepare(
    `SELECT
       posts.id,
       posts.board_id,
       boards.slug AS board_slug,
       boards.title AS board_title,
       ${derivedCategory} AS category,
       posts.title,
       posts.body,
       posts.status,
       posts.visibility,
       posts.moderation_status,
       posts.created_at,
       posts.updated_at,
       COUNT(comments.id) AS comment_count
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     LEFT JOIN comments
       ON comments.post_id = posts.id
      AND comments.deleted_at IS NULL
      AND comments.status = 'published'
      AND comments.moderation_status = 'normal'
     WHERE posts.id = ?
       AND posts.author_id = ?
       AND posts.deleted_at IS NULL
     GROUP BY posts.id
     LIMIT 1`,
  ).bind(id, userId).first<MyPostRow>();
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  const id = paramValue(params, "id");
  if (!id) return errorResponse("Post id is required.", 400);

  const post = await findMyPost(env.DB, id, auth.user.id);
  if (!post) return errorResponse("Post not found.", 404);

  return jsonResponse({ ok: true, post });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  try {
    const id = paramValue(params, "id");
    if (!id) return errorResponse("Post id is required.", 400);

    const existing = await findMyPost(env.DB, id, auth.user.id);
    if (!existing) return errorResponse("Post not found.", 404);

    const body = await readJsonObject(request);
    if (!isRecord(body)) return errorResponse("Invalid request body.", 400);

    const title = textField(body, "title");
    const rawPostBody = textField(body, "bodyHtml") || textField(body, "body");
    const postBody = sanitizePostHtml(rawPostBody);

    if (title.length < 2) return errorResponse("제목은 2자 이상 입력해 주세요.", 422);
    if (title.length > maxTitleLength) return errorResponse(`제목은 ${maxTitleLength}자 이하로 입력해 주세요.`, 422);
    if (postBody.length < 5) return errorResponse("본문은 5자 이상 입력해 주세요.", 422);
    if (postBody.length > maxPostBodyLength) return errorResponse("본문이 너무 깁니다. 이미지를 줄이거나 내용을 나눠서 작성해 주세요.", 422);

    const now = Date.now();
    await env.DB.prepare(
      `UPDATE posts
       SET title = ?, body = ?, updated_at = ?
       WHERE id = ?
         AND author_id = ?
         AND deleted_at IS NULL`,
    ).bind(title, postBody, now, id, auth.user.id).run();

    const post = await findMyPost(env.DB, id, auth.user.id);
    return jsonResponse({ ok: true, post, nextPath: postDetailPath(id) });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "게시글 수정에 실패했습니다."), 400);
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  const id = paramValue(params, "id");
  if (!id) return errorResponse("Post id is required.", 400);

  const existing = await findMyPost(env.DB, id, auth.user.id);
  if (!existing) return errorResponse("Post not found.", 404);

  const now = Date.now();
  await env.DB.prepare(
    `UPDATE posts
     SET deleted_at = ?, updated_at = ?
     WHERE id = ?
       AND author_id = ?
       AND deleted_at IS NULL`,
  ).bind(now, now, id, auth.user.id).run();

  return jsonResponse({ ok: true, deletedId: id });
};

export const onRequestOptions = () => allowMethods(["GET", "PATCH", "DELETE", "OPTIONS"]);
