/// <reference types="@cloudflare/workers-types" />

import { z } from "zod";
import { hashPassword } from "../../_shared/auth-crypto";
import { createAuthSession, setSessionCookieHeader } from "../../_shared/auth-session";
import { allowMethods, errorResponse, getErrorMessage, jsonResponse, readJsonObject, statusFromError, zodDetails } from "../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

type UserRow = {
  id: string;
  email: string;
  nickname: string;
};

const signupSchema = z.object({
  email: z.string().trim().email().max(255),
  nickname: z.string().trim().min(2).max(40),
  password: z.string().min(8).max(100),
});

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  try {
    const input = signupSchema.parse(await readJsonObject(request));
    const email = normalizeEmail(input.email);

    const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1").bind(email).first<{ id: string }>();
    if (existing) return errorResponse("이미 가입된 이메일입니다.", 409);

    const id = `user_${crypto.randomUUID()}`;
    const now = Date.now();
    const credentialHash = await hashPassword(input.password);

    await env.DB.prepare(
      `INSERT INTO users (id, email, nickname, provider, credential_hash, created_at, updated_at)
       VALUES (?, ?, ?, 'email', ?, ?, ?)`,
    ).bind(id, email, input.nickname, credentialHash, now, now).run();

    const session = await createAuthSession(env.DB, id);
    const user: UserRow = { id, email, nickname: input.nickname };

    return jsonResponse({ ok: true, user }, {
      status: 201,
      headers: { "set-cookie": setSessionCookieHeader(session.token, env) },
    });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "회원가입에 실패했습니다."), statusFromError(error), zodDetails(error));
  }
};

export const onRequestOptions = () => allowMethods(["POST", "OPTIONS"]);
