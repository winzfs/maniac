/// <reference types="@cloudflare/workers-types" />

import { errorResponse, jsonResponse, paramValue } from "../../../_shared/http";
import { MOCK_USER_ID } from "../../../_shared/dev-user";

type Env = { DB: D1Database };

type EquipmentRow = {
  id: string;
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
};

type MaintenanceLogRow = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  performed_at: number;
  usage_metric_value: number | null;
  cost: number | null;
  shop_name: string | null;
  visibility: string;
};

type PartRow = {
  id: string;
  category: string;
  brand: string | null;
  name: string;
  price: number | null;
  installed_at: number | null;
  purchase_url: string | null;
  image_url: string | null;
  memo: string | null;
  visibility: string;
};

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

async function findPublicEquipment(env: Env, slug: string) {
  return env.DB.prepare(
    `SELECT id, category, brand, model, nickname, slug, year, description, main_image_url, usage_metric_type, usage_metric_value, visibility, moderation_status, created_at
     FROM equipments
     WHERE user_id = ? AND slug = ? AND deleted_at IS NULL
     LIMIT 1`,
  ).bind(MOCK_USER_ID, slug).first<EquipmentRow>();
}

async function listPublicLogs(env: Env, equipmentId: string) {
  const rows = await env.DB.prepare(
    `SELECT id, type, title, description, performed_at, usage_metric_value, cost, shop_name, visibility
     FROM maintenance_logs
     WHERE equipment_id = ? AND deleted_at IS NULL AND visibility = 'public'
     ORDER BY performed_at DESC, created_at DESC
     LIMIT 20`,
  ).bind(equipmentId).all<MaintenanceLogRow>();

  return rows.results ?? [];
}

async function listPublicParts(env: Env, equipmentId: string) {
  const rows = await env.DB.prepare(
    `SELECT id, category, brand, name, price, installed_at, purchase_url, image_url, memo, visibility
     FROM parts
     WHERE equipment_id = ? AND deleted_at IS NULL AND visibility = 'public'
     ORDER BY installed_at DESC, created_at DESC
     LIMIT 20`,
  ).bind(equipmentId).all<PartRow>();

  return rows.results ?? [];
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const slug = decodeSlug(paramValue(params, "slug"));
  if (!slug) return errorResponse("Equipment slug is required.", 400);

  const equipment = await findPublicEquipment(env, slug);
  if (!equipment) return errorResponse("Equipment not found.", 404);

  const [logs, parts] = await Promise.all([
    listPublicLogs(env, equipment.id),
    listPublicParts(env, equipment.id),
  ]);

  return jsonResponse({ ok: true, equipment, logs, parts });
};
