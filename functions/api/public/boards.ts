/// <reference types="@cloudflare/workers-types" />

import { listPublicBoards } from "../../_shared/db-boards";
import { errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database };

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const boards = await listPublicBoards(env.DB);

  return jsonResponse({ ok: true, boards });
};
