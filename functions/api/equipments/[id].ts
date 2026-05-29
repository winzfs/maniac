/// <reference types="@cloudflare/workers-types" />

import { ZodError } from "zod";
import { updateEquipmentSchema } from "../../../src/features/equipment/schemas";

type Env = {
  DB: D1Database;
};

type EquipmentRow = {
  id: string;
  user_id: string;
  category: string;
  brand: string | null;
  model: string | null;
  nickname: string;
  slug: string;
  year: number | null;
  description: string | null;
  main_image_url: string | null;
  usage_metric_type: string;
  usage_metric_value: number | null;
  visibility: string;
  moderation_status: string;
  created_at: number;
  updated_at: number;
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

function getEquipmentId(params: EventContext<Env, string, unknown>["params"]) {
  const value = params.id;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : "";
}

function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Invalid equipment input.";
  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readJsonObject(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("Content-Type must be application/json.");
  }

  const body: unknown = await request.json();
  if (!isRecord(body)) throw new Error("JSON body must be an object.");
  return body;
}

async function findEquipment(env: Env, id: string) {
  return env.DB.prepare(
    `SELECT id, user_id, category, brand, model, nickname, slug, year, description, main_image_url, usage_metric_type, usage_metric_value, visibility, moderation_status, created_at, updated_at
     FROM equipments
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL
     LIMIT 1`,
  ).bind(id, MOCK_USER_ID).first<EquipmentRow>();
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const id = getEquipmentId(params);
  if (!id) return errorResponse("Equipment id is required.", 400);

  const equipment = await findEquipment(env, id);
  if (!equipment) return errorResponse("Equipment not found.", 404);

  return jsonResponse({ ok: true, equipment });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const id = getEquipmentId(params);
  if (!id) return errorResponse("Equipment id is required.", 400);

  try {
    const existing = await findEquipment(env, id);
    if (!existing) return errorResponse("Equipment not found.", 404);

    const body = await readJsonObject(request);
    const input = updateEquipmentSchema.parse({ ...body, id });
    const now = Date.now();

    await env.DB.prepare(
      `UPDATE equipments
       SET category = ?, brand = ?, model = ?, nickname = ?, slug = ?, year = ?, description = ?, main_image_url = ?, usage_metric_type = ?, usage_metric_value = ?, visibility = ?, moderation_status = ?, updated_at = ?
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    ).bind(
      input.category ?? existing.category,
      input.brand ?? existing.brand,
      input.model ?? existing.model,
      input.nickname ?? existing.nickname,
      input.slug ?? existing.slug,
      input.year ?? existing.year,
      input.description ?? existing.description,
      input.mainImageUrl ?? existing.main_image_url,
      input.usageMetricType ?? existing.usage_metric_type,
      input.usageMetricValue ?? existing.usage_metric_value,
      input.visibility ?? existing.visibility,
      input.moderationStatus ?? existing.moderation_status,
      now,
      id,
      MOCK_USER_ID,
    ).run();

    const equipment = await findEquipment(env, id);
    return jsonResponse({ ok: true, equipment, nextPath: equipment ? `/garage/${equipment.slug}/` : undefined });
  } catch (error) {
    const status = error instanceof ZodError ? 422 : 400;
    return errorResponse(getErrorMessage(error), status, error instanceof ZodError ? error.flatten() : undefined);
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const id = getEquipmentId(params);
  if (!id) return errorResponse("Equipment id is required.", 400);

  const existing = await findEquipment(env, id);
  if (!existing) return errorResponse("Equipment not found.", 404);

  const now = Date.now();
  await env.DB.prepare(
    `UPDATE equipments
     SET deleted_at = ?, updated_at = ?
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
  ).bind(now, now, id, MOCK_USER_ID).run();

  return jsonResponse({ ok: true, id });
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { allow: "GET, PATCH, DELETE, OPTIONS" },
    });
  }

  return errorResponse("Method not allowed.", 405);
};
