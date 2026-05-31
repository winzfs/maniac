/// <reference types="@cloudflare/workers-types" />

import { updateEquipmentSchema } from "../../../src/features/equipment/schemas";
import { requireCurrentUser } from "../../_shared/auth";
import { allowMethods, errorResponse, getErrorMessage, jsonResponse, paramValue, readJsonObject, statusFromError, zodDetails } from "../../_shared/http";

type Env = {
  DB: D1Database;
  APP_ENV?: string;
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

type SlugRow = { id: string };

function getEquipmentId(params: EventContext<Env, string, unknown>["params"]) {
  return paramValue(params, "id");
}

function publicViewPath(id: string) {
  return `/garage/view/?id=${encodeURIComponent(id)}`;
}

function slugify(input: string) {
  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return slug || "equipment";
}

async function isSlugAvailable(env: Env, userId: string, slug: string, ignoreEquipmentId: string) {
  const existing = await env.DB.prepare(
    `SELECT id
     FROM equipments
     WHERE user_id = ? AND slug = ?
     LIMIT 1`,
  ).bind(userId, slug).first<SlugRow>();

  return !existing || existing.id === ignoreEquipmentId;
}

async function createAvailableSlug(env: Env, userId: string, baseSlug: string, ignoreEquipmentId: string) {
  const normalizedBase = slugify(baseSlug);

  for (let suffix = 0; suffix < 50; suffix += 1) {
    const slug = suffix === 0 ? normalizedBase : `${normalizedBase}-${suffix + 1}`;
    if (await isSlugAvailable(env, userId, slug, ignoreEquipmentId)) return slug;
  }

  return `${normalizedBase}-${Date.now().toString(36)}`;
}

async function findEquipment(env: Env, id: string, userId: string) {
  return env.DB.prepare(
    `SELECT id, user_id, category, brand, model, nickname, slug, year, description, main_image_url, usage_metric_type, usage_metric_value, visibility, moderation_status, created_at, updated_at
     FROM equipments
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL
     LIMIT 1`,
  ).bind(id, userId).first<EquipmentRow>();
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  const id = getEquipmentId(params);
  if (!id) return errorResponse("Equipment id is required.", 400);

  const equipment = await findEquipment(env, id, auth.user.id);
  if (!equipment) return errorResponse("Equipment not found.", 404);

  return jsonResponse({ ok: true, equipment });
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  const id = getEquipmentId(params);
  if (!id) return errorResponse("Equipment id is required.", 400);

  try {
    const existing = await findEquipment(env, id, auth.user.id);
    if (!existing) return errorResponse("Equipment not found.", 404);

    const body = await readJsonObject(request);
    const input = updateEquipmentSchema.parse({ ...body, id });
    const now = Date.now();
    const nextSlug = input.slug ? await createAvailableSlug(env, auth.user.id, input.slug, id) : existing.slug;

    await env.DB.prepare(
      `UPDATE equipments
       SET category = ?, brand = ?, model = ?, nickname = ?, slug = ?, year = ?, description = ?, main_image_url = ?, usage_metric_type = ?, usage_metric_value = ?, visibility = ?, moderation_status = ?, updated_at = ?
       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
    ).bind(
      input.category ?? existing.category,
      input.brand ?? existing.brand,
      input.model ?? existing.model,
      input.nickname ?? existing.nickname,
      nextSlug,
      input.year ?? existing.year,
      input.description ?? existing.description,
      input.mainImageUrl ?? existing.main_image_url,
      input.usageMetricType ?? existing.usage_metric_type,
      input.usageMetricValue ?? existing.usage_metric_value,
      input.visibility ?? existing.visibility,
      existing.moderation_status,
      now,
      id,
      auth.user.id,
    ).run();

    const equipment = await findEquipment(env, id, auth.user.id);
    return jsonResponse({ ok: true, equipment, nextPath: publicViewPath(id) });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "Invalid equipment input."), statusFromError(error), zodDetails(error));
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  const id = getEquipmentId(params);
  if (!id) return errorResponse("Equipment id is required.", 400);

  const existing = await findEquipment(env, id, auth.user.id);
  if (!existing) return errorResponse("Equipment not found.", 404);

  const now = Date.now();
  await env.DB.prepare(
    `UPDATE equipments
     SET deleted_at = ?, updated_at = ?
     WHERE id = ? AND user_id = ? AND deleted_at IS NULL`,
  ).bind(now, now, id, auth.user.id).run();

  return jsonResponse({ ok: true, id });
};

export const onRequestOptions = () => allowMethods(["GET", "PATCH", "DELETE", "OPTIONS"]);
