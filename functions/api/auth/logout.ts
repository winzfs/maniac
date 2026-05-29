/// <reference types="@cloudflare/workers-types" />

import { clearSessionCookieHeader, getSessionToken, revokeAuthSession } from "../../_shared/auth-session";
import { allowMethods, errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const token = getSessionToken(request);
  await revokeAuthSession(env.DB, token);

  return jsonResponse({ ok: true }, {
    headers: { "set-cookie": clearSessionCookieHeader(env) },
  });
};

export const onRequestOptions = () => allowMethods(["POST", "OPTIONS"]);
