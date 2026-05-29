/// <reference types="@cloudflare/workers-types" />

import { z } from "zod";
import { allowMethods, errorResponse, getErrorMessage, jsonResponse, paramValue, readJsonObject, statusFromError, zodDetails } from "../../../_shared/http";
import { MOCK_USER_ID } from "../../../_shared/dev-user";

type Env = { DB: D1Database };
type LogRow = {
  id: string;
  equipment_id: string;
  type: string;
  title: string;
  description: string | null;
  performed_at: number;
  usage_metric_value: number | null;
  cost: number | null;
  shop_name: string | null;
  is_public: number;
  visibility: string;
  moderation_status: string;
  created_at: number;
  updated_at: number;
};

const createLogSchema = z.object({
  type: z.string().trim().min(1).max(40).default("custom"),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional(),
  performedAt: z.number().int().nonnegative(),
  usageMetricValue: z.number().int().nonnegative().optional(),
  cost: z.number().int().nonnegative().optional(),
  shopName: z.string().trim().max(120).optional(),
  isPublic: z.boolean().default(true),
  visibility: z.enum(["public", "private", "unlisted"]).default("public"),
});
const updateLogSchema = createLogSchema.partial();

function getEquipmentId(params: EventContext<Env, string, unknown>["params"]) {
  return paramValue(params, "id");
}
function getLogId(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("logId") ?? "";
}
async function hasEquipment(env: Env, equipmentId: string) {
  const row = await env.DB.prepare("SELECT id FROM equipments WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1").bind(equipmentId, MOCK_USER_ID).first<{ id: string }>();
  return Boolean(row);
}
async function hasLog(env: Env, equipmentId: string, logId: string) {
  const row = await env.DB.prepare("SELECT id FROM maintenance_logs WHERE id = ? AND equipment_id = ? AND deleted_at IS NULL LIMIT 1").bind(logId, equipmentId).first<{ id: string }>();
  return Boolean(row);
}
async function listLogs(env: Env, equipmentId: string) {
  const rows = await env.DB.prepare(`SELECT id, equipment_id, type, title, description, performed_at, usage_metric_value, cost, shop_name, is_public, visibility, moderation_status, created_at, updated_at
    FROM maintenance_logs WHERE equipment_id = ? AND deleted_at IS NULL ORDER BY performed_at DESC, created_at DESC LIMIT 100`).bind(equipmentId).all<LogRow>();
  return rows.results ?? [];
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const equipmentId = getEquipmentId(params);
  if (!equipmentId) return errorResponse("Equipment id is required.", 400);
  if (!(await hasEquipment(env, equipmentId))) return errorResponse("Equipment not found.", 404);
  return jsonResponse({ ok: true, logs: await listLogs(env, equipmentId) });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const equipmentId = getEquipmentId(params);
  if (!equipmentId) return errorResponse("Equipment id is required.", 400);
  try {
    if (!(await hasEquipment(env, equipmentId))) return errorResponse("Equipment not found.", 404);
    const input = createLogSchema.parse(await readJsonObject(request));
    const id = `log_${crypto.randomUUID()}`;
    const now = Date.now();
    await env.DB.prepare(`INSERT INTO maintenance_logs (id, equipment_id, type, title, description, performed_at, usage_metric_value, cost, shop_name, is_public, visibility, moderation_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'normal', ?, ?)`).bind(
      id, equipmentId, input.type, input.title, input.description ?? null, input.performedAt, input.usageMetricValue ?? null, input.cost ?? null, input.shopName ?? null, input.isPublic ? 1 : 0, input.visibility, now, now,
    ).run();
    return jsonResponse({ ok: true, id, logs: await listLogs(env, equipmentId) }, { status: 201 });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "Invalid maintenance log input."), statusFromError(error), zodDetails(error));
  }
};

export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const equipmentId = getEquipmentId(params);
  if (!equipmentId) return errorResponse("Equipment id is required.", 400);

  try {
    if (!(await hasEquipment(env, equipmentId))) return errorResponse("Equipment not found.", 404);

    const logId = getLogId(request);
    if (!logId) return errorResponse("Maintenance log id is required.", 400);
    if (!(await hasLog(env, equipmentId, logId))) return errorResponse("Maintenance log not found.", 404);

    const input = updateLogSchema.parse(await readJsonObject(request));
    const now = Date.now();

    await env.DB.prepare(`UPDATE maintenance_logs
      SET type = COALESCE(?, type), title = COALESCE(?, title), description = ?, performed_at = COALESCE(?, performed_at), usage_metric_value = ?, cost = ?, shop_name = ?, is_public = COALESCE(?, is_public), visibility = COALESCE(?, visibility), updated_at = ?
      WHERE id = ? AND equipment_id = ? AND deleted_at IS NULL`).bind(
      input.type ?? null,
      input.title ?? null,
      input.description ?? null,
      input.performedAt ?? null,
      input.usageMetricValue ?? null,
      input.cost ?? null,
      input.shopName ?? null,
      typeof input.isPublic === "boolean" ? (input.isPublic ? 1 : 0) : null,
      input.visibility ?? null,
      now,
      logId,
      equipmentId,
    ).run();

    return jsonResponse({ ok: true, id: logId, logs: await listLogs(env, equipmentId) });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "Invalid maintenance log input."), statusFromError(error), zodDetails(error));
  }
};

export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const equipmentId = getEquipmentId(params);
  if (!equipmentId) return errorResponse("Equipment id is required.", 400);

  if (!(await hasEquipment(env, equipmentId))) return errorResponse("Equipment not found.", 404);

  const logId = getLogId(request);
  if (!logId) return errorResponse("Maintenance log id is required.", 400);
  if (!(await hasLog(env, equipmentId, logId))) return errorResponse("Maintenance log not found.", 404);

  const now = Date.now();
  await env.DB.prepare("UPDATE maintenance_logs SET deleted_at = ?, updated_at = ? WHERE id = ? AND equipment_id = ? AND deleted_at IS NULL").bind(now, now, logId, equipmentId).run();

  return jsonResponse({ ok: true, id: logId, logs: await listLogs(env, equipmentId) });
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === "OPTIONS") return allowMethods(["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  return errorResponse("Method not allowed.", 405);
};
