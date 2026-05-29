/// <reference types="@cloudflare/workers-types" />

import { z } from "zod";
import { allowMethods, errorResponse, getErrorMessage, jsonResponse, paramValue, readJsonObject, statusFromError, zodDetails } from "../../../_shared/http";
import { MOCK_USER_ID } from "../../../_shared/dev-user";

type Env = { DB: D1Database };
type PartRow = {
  id: string;
  equipment_id: string;
  category: string;
  brand: string | null;
  name: string;
  price: number | null;
  installed_at: number | null;
  purchase_url: string | null;
  image_url: string | null;
  memo: string | null;
  visibility: string;
  moderation_status: string;
  created_at: number;
  updated_at: number;
};

const createPartSchema = z.object({
  category: z.string().trim().min(1).max(60).default("custom"),
  brand: z.string().trim().max(80).optional(),
  name: z.string().trim().min(1).max(120),
  price: z.number().int().nonnegative().optional(),
  installedAt: z.number().int().nonnegative().optional(),
  purchaseUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  memo: z.string().trim().max(1000).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).default("public"),
});
const updatePartSchema = createPartSchema.partial();

function getEquipmentId(params: EventContext<Env, string, unknown>["params"]) {
  return paramValue(params, "id");
}
function getPartId(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("partId") ?? "";
}
async function hasEquipment(env: Env, equipmentId: string) {
  const row = await env.DB.prepare("SELECT id FROM equipments WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1").bind(equipmentId, MOCK_USER_ID).first<{ id: string }>();
  return Boolean(row);
}
async function hasPart(env: Env, equipmentId: string, partId: string) {
  const row = await env.DB.prepare("SELECT id FROM parts WHERE id = ? AND equipment_id = ? AND deleted_at IS NULL LIMIT 1").bind(partId, equipmentId).first<{ id: string }>();
  return Boolean(row);
}
async function listParts(env: Env, equipmentId: string) {
  const rows = await env.DB.prepare(`SELECT id, equipment_id, category, brand, name, price, installed_at, purchase_url, image_url, memo, visibility, moderation_status, created_at, updated_at
    FROM parts WHERE equipment_id = ? AND deleted_at IS NULL ORDER BY installed_at DESC, created_at DESC LIMIT 100`).bind(equipmentId).all<PartRow>();
  return rows.results ?? [];
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const equipmentId = getEquipmentId(params);
  if (!equipmentId) return errorResponse("Equipment id is required.", 400);
  if (!(await hasEquipment(env, equipmentId))) return errorResponse("Equipment not found.", 404);
  return jsonResponse({ ok: true, parts: await listParts(env, equipmentId) });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const equipmentId = getEquipmentId(params);
  if (!equipmentId) return errorResponse("Equipment id is required.", 400);
  try {
    if (!(await hasEquipment(env, equipmentId))) return errorResponse("Equipment not found.", 404);
    const input = createPartSchema.parse(await readJsonObject(request));
    const id = `part_${crypto.randomUUID()}`;
    const now = Date.now();
    await env.DB.prepare(`INSERT INTO parts (id, equipment_id, category, brand, name, price, installed_at, purchase_url, image_url, memo, visibility, moderation_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'normal', ?, ?)`).bind(
      id, equipmentId, input.category, input.brand ?? null, input.name, input.price ?? null, input.installedAt ?? null, input.purchaseUrl ?? null, input.imageUrl ?? null, input.memo ?? null, input.visibility, now, now,
    ).run();
    return jsonResponse({ ok: true, id, parts: await listParts(env, equipmentId) }, { status: 201 });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "Invalid part input."), statusFromError(error), zodDetails(error));
  }
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const equipmentId = getEquipmentId(params);
  if (!equipmentId) return errorResponse("Equipment id is required.", 400);
  try {
    if (!(await hasEquipment(env, equipmentId))) return errorResponse("Equipment not found.", 404);
    const partId = getPartId(request);
    if (!partId) return errorResponse("Part id is required.", 400);
    if (!(await hasPart(env, equipmentId, partId))) return errorResponse("Part not found.", 404);
    const input = updatePartSchema.parse(await readJsonObject(request));
    const now = Date.now();
    await env.DB.prepare(`UPDATE parts
      SET category = COALESCE(?, category), brand = ?, name = COALESCE(?, name), price = ?, installed_at = ?, purchase_url = ?, image_url = ?, memo = ?, visibility = COALESCE(?, visibility), updated_at = ?
      WHERE id = ? AND equipment_id = ? AND deleted_at IS NULL`).bind(
      input.category ?? null,
      input.brand ?? null,
      input.name ?? null,
      input.price ?? null,
      input.installedAt ?? null,
      input.purchaseUrl ?? null,
      input.imageUrl ?? null,
      input.memo ?? null,
      input.visibility ?? null,
      now,
      partId,
      equipmentId,
    ).run();
    return jsonResponse({ ok: true, id: partId, parts: await listParts(env, equipmentId) });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "Invalid part input."), statusFromError(error), zodDetails(error));
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const equipmentId = getEquipmentId(params);
  if (!equipmentId) return errorResponse("Equipment id is required.", 400);
  if (!(await hasEquipment(env, equipmentId))) return errorResponse("Equipment not found.", 404);
  const partId = getPartId(request);
  if (!partId) return errorResponse("Part id is required.", 400);
  if (!(await hasPart(env, equipmentId, partId))) return errorResponse("Part not found.", 404);
  const now = Date.now();
  await env.DB.prepare("UPDATE parts SET deleted_at = ?, updated_at = ? WHERE id = ? AND equipment_id = ? AND deleted_at IS NULL").bind(now, now, partId, equipmentId).run();
  return jsonResponse({ ok: true, id: partId, parts: await listParts(env, equipmentId) });
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === "OPTIONS") return allowMethods(["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  return errorResponse("Method not allowed.", 405);
};
