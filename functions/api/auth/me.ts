/// <reference types="@cloudflare/workers-types" />

import { isAdminUser } from "../../_shared/admin";
import { getCurrentUser } from "../../_shared/auth-session";
import { errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const user = await getCurrentUser(request, env);
  if (!user) return jsonResponse({ ok: true, user: null });

  return jsonResponse({ ok: true, user: { ...user, isAdmin: isAdminUser(user) } });
};
