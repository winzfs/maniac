/// <reference types="@cloudflare/workers-types" />

import { z } from "zod";
import { requireCurrentUser } from "../../_shared/auth";
import { allowMethods, errorResponse, getErrorMessage, jsonResponse, readJsonObject, statusFromError, zodDetails } from "../../_shared/http";

const profileSchema = z.object({
  nickname: z.string().trim().min(2, "닉네임은 2자 이상 입력해 주세요.").max(30, "닉네임은 30자 이하로 입력해 주세요."),
  bio: z.string().trim().max(300, "소개글은 300자 이하로 입력해 주세요.").optional().default(""),
});

type Env = { DB: D1Database; APP_ENV?: string };

type UserRow = {
  id: string;
  email: string;
  nickname: string;
  bio: string | null;
  profile_image_url: string | null;
  provider: string | null;
};

function normalizeBio(value: string) {
  return value.length > 0 ? value : null;
}

async function ignoreDuplicateColumn(operation: Promise<unknown>) {
  try {
    await operation;
  } catch (error) {
    const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
    if (!message.includes("duplicate column") && !message.includes("already exists")) throw error;
  }
}

async function ensureProfileSchema(db: D1Database) {
  await ignoreDuplicateColumn(db.prepare("ALTER TABLE users ADD COLUMN bio TEXT").run());
}

async function getUserProfile(db: D1Database, userId: string) {
  return db.prepare(
    `SELECT id, email, nickname, bio, profile_image_url, provider
     FROM users
     WHERE id = ? AND deleted_at IS NULL
     LIMIT 1`,
  ).bind(userId).first<UserRow>();
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  try {
    await ensureProfileSchema(env.DB);
    const user = await getUserProfile(env.DB, auth.user.id);
    if (!user) return errorResponse("사용자를 찾을 수 없습니다.", 404);

    return jsonResponse({ ok: true, user });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "프로필을 불러오지 못했습니다."), 500);
  }
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  try {
    await ensureProfileSchema(env.DB);

    const body = await readJsonObject(request);
    const input = profileSchema.parse(body);
    const bio = normalizeBio(input.bio);
    const now = Date.now();

    const duplicate = await env.DB.prepare(
      `SELECT id
       FROM users
       WHERE lower(nickname) = lower(?)
         AND id <> ?
         AND deleted_at IS NULL
       LIMIT 1`,
    ).bind(input.nickname, auth.user.id).first<{ id: string }>();

    if (duplicate) {
      return errorResponse("이미 사용 중인 닉네임입니다.", 409);
    }

    await env.DB.prepare(
      `UPDATE users
       SET nickname = ?, bio = ?, updated_at = ?
       WHERE id = ? AND deleted_at IS NULL`,
    ).bind(input.nickname, bio, now, auth.user.id).run();

    const user = await getUserProfile(env.DB, auth.user.id);
    if (!user) return errorResponse("사용자를 찾을 수 없습니다.", 404);

    return jsonResponse({ ok: true, user });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "프로필 저장에 실패했습니다."), statusFromError(error), zodDetails(error));
  }
};

export const onRequestOptions = () => allowMethods(["GET", "PATCH", "OPTIONS"]);
