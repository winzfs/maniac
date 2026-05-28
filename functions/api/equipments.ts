/// <reference types="@cloudflare/workers-types" />

import { eq } from "drizzle-orm";
import { ZodError } from "zod";
import { createEquipment } from "../../src/features/equipment/actions/mutations";
import { createEquipmentSchema } from "../../src/features/equipment/schemas";
import { createDb, type ManiacDatabase } from "../../src/server/db/client";
import { users } from "../../src/server/db/schema";

type Env = {
  DB: D1Database;
};

type EquipmentListRow = {
  id: string;
  category: string;
  brand: string | null;
  model: string | null;
  nickname: string;
  slug: string;
  year: number | null;
  description: string | null;
  usage_metric_type: string;
  usage_metric_value: number | null;
  visibility: string;
  moderation_status: string;
  created_at: number;
};

const MOCK_USER_ID = "dev_user_maniac";

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...init?.headers,
    },
  });
}

function errorResponse(message: string, status = 400, details?: unknown) {
  return jsonResponse({ ok: false, error: message, details }, { status });
}

function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Invalid equipment input.";
  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}

async function readJson(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Content-Type must be application/json.");
  }

  return request.json();
}

async function ensureDevUser(db: ManiacDatabase) {
  const existingRows = await db.select({ id: users.id }).from(users).where(eq(users.id, MOCK_USER_ID)).limit(1);
  if (existingRows[0]) return existingRows[0];

  await db.insert(users).values({
    id: MOCK_USER_ID,
    email: "dev@maniac-garage.local",
    nickname: "Dev Maniac",
    provider: "mock",
  });

  return { id: MOCK_USER_ID };
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const rows = await env.DB.prepare(
    `SELECT id, category, brand, model, nickname, slug, year, description, usage_metric_type, usage_metric_value, visibility, moderation_status, created_at
     FROM equipments
     WHERE user_id = ? AND deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT 50`,
  ).bind(MOCK_USER_ID).all<EquipmentListRow>();

  return jsonResponse({ ok: true, equipments: rows.results ?? [] });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  try {
    const body = await readJson(request);
    const input = createEquipmentSchema.parse(body);
    const db = createDb(env.DB);

    await ensureDevUser(db);
    const result = await createEquipment(db, MOCK_USER_ID, input);

    return jsonResponse({
      ok: true,
      equipment: result,
      nextPath: `/garage/${result.slug}/`,
      authMode: "mock-user",
    }, { status: 201 });
  } catch (error) {
    const status = error instanceof ZodError ? 422 : 400;
    return errorResponse(getErrorMessage(error), status, error instanceof ZodError ? error.flatten() : undefined);
  }
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        allow: "GET, POST, OPTIONS",
      },
    });
  }

  return errorResponse("Method not allowed.", 405);
};
