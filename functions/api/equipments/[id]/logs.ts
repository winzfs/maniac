/// <reference types="@cloudflare/workers-types" />

import { z, ZodError } from "zod";

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

const MOCK_USER_ID = "dev_user_maniac";
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

function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...init?.headers },
  });
}
function errorResponse(message: string, status = 400, details?: unknown) {
  return jsonResponse({ ok: false, error: message, details }, { status });
}
function getEquipmentId(params: EventContext<Env, string, unknown>["params"]) {
  const value = params.id;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : "";
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
async function readJsonObject(request: Request) {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) throw new Error("Content-Type must be application/json.");
  const body: unknown = await request.json();
  if (!isRecord(body)) throw new Error("JSON body must be an object.");
  return body;
}
function getErrorMessage(error: unknown) {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Invalid maintenance log input.";
  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}
async function ensureTable(env: Env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS maintenance_logs (
    id TEXT PRIMARY KEY NOT NULL,
    equipment_id TEXT NOT NULL REFERENCES equipments(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'custom',
    title TEXT NOT NULL,
    description TEXT,
    performed_at INTEGER NOT NULL,
    usage_metric_value INTEGER,
    cost INTEGER,
    shop_name TEXT,
    is_public INTEGER NOT NULL DEFAULT 1,
    visibility TEXT NOT NULL DEFAULT 'public',
    moderation_status TEXT NOT NULL DEFAULT 'normal',
    created_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    deleted_at INTEGER
  )`).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS maintenance_logs_equipment_performed_idx ON maintenance_logs (equipment_id, performed_at)").run();
}
async function hasEquipment(env: Env, equipmentId: string) {
  const row = await env.DB.prepare("SELECT id FROM equipments WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1").bind(equipmentId, MOCK_USER_ID).first<{ id: string }>();
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
  await ensureTable(env);
  if (!(await hasEquipment(env, equipmentId))) return errorResponse("Equipment not found.", 404);
  return jsonResponse({ ok: true, logs: await listLogs(env, equipmentId) });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const equipmentId = getEquipmentId(params);
  if (!equipmentId) return errorResponse("Equipment id is required.", 400);
  try {
    await ensureTable(env);
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
    const status = error instanceof ZodError ? 422 : 400;
    return errorResponse(getErrorMessage(error), status, error instanceof ZodError ? error.flatten() : undefined);
  }
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { allow: "GET, POST, OPTIONS" } });
  return errorResponse("Method not allowed.", 405);
};
