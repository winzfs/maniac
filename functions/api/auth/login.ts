/// <reference types="@cloudflare/workers-types" />

import { z } from "zod";
import { verifyPassword } from "../../_shared/auth-crypto";
import { createAuthSession, setSessionCookieHeader } from "../../_shared/auth-session";
import { allowMethods, errorResponse, getErrorMessage, jsonResponse, readJsonObject, statusFromError, zodDetails } from "../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

type LoginUserRow = {
  id: string;
  email: string;
  nickname: string;
  credential_hash: string | null;
};

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(100),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  try {
    const input = loginSchema.parse(await readJsonObject(request));
    const email = normalizeEmail(input.email);

    const user = await env.DB.prepare(
      `SELECT id, email, nickname, credential_hash
       FROM users
       WHERE email = ? AND deleted_at IS NULL
       LIMIT 1`,
    ).bind(email).first<LoginUserRow>();

    if (!user?.credential_hash) return errorResponse("이메일 또는 비밀번호가 올바르지 않습니다.", 401);

    const verified = await verifyPassword(input.password, user.credential_hash);
    if (!verified) return errorResponse("이메일 또는 비밀번호가 올바르지 않습니다.", 401);

    const session = await createAuthSession(env.DB, user.id);

    return jsonResponse({ ok: true, user: { id: user.id, email: user.email, nickname: user.nickname } }, {
      headers: { "set-cookie": setSessionCookieHeader(session.token, env) },
    });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "로그인에 실패했습니다."), statusFromError(error), zodDetails(error));
  }
};

export const onRequestOptions = () => allowMethods(["POST", "OPTIONS"]);
