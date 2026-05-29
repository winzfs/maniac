/// <reference types="@cloudflare/workers-types" />

import { allowMethods, errorResponse, getErrorMessage, isRecord, jsonResponse, readJsonObject } from "../_shared/http";
import { MOCK_USER_ID } from "../_shared/dev-user";

type Env = { DB: D1Database };

type BoardRow = {
  id: string;
  slug: string;
  category: string | null;
};

type CreatedPostRow = {
  id: string;
  board_id: string;
  title: string;
  body: string;
  created_at: number;
};

function textField(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

function postDetailPath(id: string) {
  return `/explore/post/?id=${encodeURIComponent(id)}`;
}

async function ensureDevUser(db: D1Database) {
  await db.prepare(
    `INSERT OR IGNORE INTO users (id, email, nickname, provider)
     VALUES (?, ?, ?, ?)`,
  ).bind(MOCK_USER_ID, "dev@maniac-garage.local", "Dev Maniac", "mock").run();
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  try {
    const body = await readJsonObject(request);
    if (!isRecord(body)) return errorResponse("Invalid request body.", 400);

    const boardSlug = textField(body, "boardSlug");
    const title = textField(body, "title");
    const postBody = textField(body, "bodyHtml") || textField(body, "body");

    if (!boardSlug) return errorResponse("Board slug is required.", 400);
    if (title.length < 2) return errorResponse("제목은 2자 이상 입력해 주세요.", 422);
    if (postBody.length < 5) return errorResponse("본문은 5자 이상 입력해 주세요.", 422);

    const board = await env.DB.prepare(
      `SELECT id, slug, category
       FROM boards
       WHERE slug = ?
         AND status = 'active'
         AND permission = 'public'
       LIMIT 1`,
    ).bind(boardSlug).first<BoardRow>();

    if (!board) return errorResponse("게시판을 찾을 수 없습니다.", 404);

    await ensureDevUser(env.DB);

    const id = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO posts (
         id,
         board_id,
         author_id,
         title,
         body,
         status,
         visibility,
         moderation_status
       ) VALUES (?, ?, ?, ?, ?, 'published', 'public', 'normal')`,
    ).bind(id, board.id, MOCK_USER_ID, title, postBody).run();

    const post = await env.DB.prepare(
      `SELECT id, board_id, title, body, created_at
       FROM posts
       WHERE id = ?
       LIMIT 1`,
    ).bind(id).first<CreatedPostRow>();

    return jsonResponse({
      ok: true,
      post,
      nextPath: postDetailPath(id),
      authMode: "mock-user",
    }, { status: 201 });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "게시글 저장에 실패했습니다."), 400);
  }
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === "OPTIONS") return allowMethods(["POST", "OPTIONS"]);
  return errorResponse("Method not allowed.", 405);
};
