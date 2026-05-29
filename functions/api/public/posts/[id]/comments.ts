/// <reference types="@cloudflare/workers-types" />

import { allowMethods, errorResponse, getErrorMessage, isRecord, jsonResponse, paramValue, readJsonObject } from "../../../../_shared/http";
import { MOCK_USER_ID } from "../../../../_shared/dev-user";

type Env = { DB: D1Database };

type PostRow = { id: string };

type CommentRow = {
  id: string;
  post_id: string;
  body: string;
  author_id: string;
  author_nickname: string | null;
  created_at: number;
  updated_at: number;
};

function textField(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

async function ensureDevUser(db: D1Database) {
  await db.prepare(
    `INSERT OR IGNORE INTO users (id, email, nickname, provider)
     VALUES (?, ?, ?, ?)`,
  ).bind(MOCK_USER_ID, "dev@maniac-garage.local", "Dev Maniac", "mock").run();
}

async function getPublicPost(db: D1Database, id: string) {
  return db.prepare(
    `SELECT posts.id
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
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  try {
    const postId = paramValue(params, "id");
    if (!postId) return errorResponse("Post id is required.", 400);

    const post = await getPublicPost(env.DB, postId);
    if (!post) return errorResponse("Post not found.", 404);

    const body = await readJsonObject(request);
    if (!isRecord(body)) return errorResponse("Invalid request body.", 400);

    const commentBody = textField(body, "body");
    if (commentBody.length < 2) return errorResponse("댓글은 2자 이상 입력해 주세요.", 422);
    if (commentBody.length > 1000) return errorResponse("댓글은 1000자 이하로 입력해 주세요.", 422);

    await ensureDevUser(env.DB);

    const id = crypto.randomUUID();
    const now = Date.now();

    await env.DB.prepare(
      `INSERT INTO comments (
         id,
         post_id,
         author_id,
         body,
         status,
         moderation_status,
         created_at,
         updated_at
       ) VALUES (?, ?, ?, ?, 'published', 'normal', ?, ?)`,
    ).bind(id, postId, MOCK_USER_ID, commentBody, now, now).run();

    const comment = await env.DB.prepare(
      `SELECT
         comments.id,
         comments.post_id,
         comments.body,
         comments.author_id,
         users.nickname AS author_nickname,
         comments.created_at,
         comments.updated_at
       FROM comments
       LEFT JOIN users ON users.id = comments.author_id
       WHERE comments.id = ?
       LIMIT 1`,
    ).bind(id).first<CommentRow>();

    return jsonResponse({ ok: true, comment, authMode: "mock-user" }, { status: 201 });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "댓글 저장에 실패했습니다."), 400);
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  try {
    const postId = paramValue(params, "id");
    if (!postId) return errorResponse("Post id is required.", 400);

    const url = new URL(request.url);
    const commentId = url.searchParams.get("commentId")?.trim();
    if (!commentId) return errorResponse("Comment id is required.", 400);

    const post = await getPublicPost(env.DB, postId);
    if (!post) return errorResponse("Post not found.", 404);

    const comment = await env.DB.prepare(
      `SELECT id, author_id
       FROM comments
       WHERE id = ?
         AND post_id = ?
         AND deleted_at IS NULL
       LIMIT 1`,
    ).bind(commentId, postId).first<{ id: string; author_id: string }>();

    if (!comment) return errorResponse("Comment not found.", 404);
    if (comment.author_id !== MOCK_USER_ID) return errorResponse("댓글을 삭제할 권한이 없습니다.", 403);

    await env.DB.prepare(
      `UPDATE comments
       SET deleted_at = ?, updated_at = ?
       WHERE id = ?
         AND post_id = ?
         AND author_id = ?
         AND deleted_at IS NULL`,
    ).bind(Date.now(), Date.now(), commentId, postId, MOCK_USER_ID).run();

    return jsonResponse({ ok: true, deletedId: commentId });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "댓글 삭제에 실패했습니다."), 400);
  }
};

export const onRequestOptions = () => allowMethods(["POST", "DELETE", "OPTIONS"]);
