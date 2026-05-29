/// <reference types="@cloudflare/workers-types" />

import { createEquipment } from "../../src/features/equipment/actions/mutations";
import { createEquipmentSchema } from "../../src/features/equipment/schemas";
import { createDb } from "../../src/server/db/client";
import { requireCurrentUser } from "../_shared/auth";
import { allowMethods, errorResponse, getErrorMessage, jsonResponse, readJsonObject, statusFromError, zodDetails } from "../_shared/http";

type Env = {
  DB: D1Database;
  APP_ENV?: string;
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
  maintenance_log_count: number;
  latest_maintenance_at: number | null;
  total_maintenance_cost: number | null;
};

function publicViewPath(slug: string) {
  return `/garage/view/?slug=${encodeURIComponent(slug)}`;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  const rows = await env.DB.prepare(
    `SELECT
       equipments.id,
       equipments.category,
       equipments.brand,
       equipments.model,
       equipments.nickname,
       equipments.slug,
       equipments.year,
       equipments.description,
       equipments.usage_metric_type,
       equipments.usage_metric_value,
       equipments.visibility,
       equipments.moderation_status,
       equipments.created_at,
       COUNT(maintenance_logs.id) AS maintenance_log_count,
       MAX(maintenance_logs.performed_at) AS latest_maintenance_at,
       COALESCE(SUM(maintenance_logs.cost), 0) AS total_maintenance_cost
     FROM equipments
     LEFT JOIN maintenance_logs
       ON maintenance_logs.equipment_id = equipments.id
      AND maintenance_logs.deleted_at IS NULL
     WHERE equipments.user_id = ?
       AND equipments.deleted_at IS NULL
     GROUP BY equipments.id
     ORDER BY equipments.created_at DESC
     LIMIT 50`,
  ).bind(auth.user.id).all<EquipmentListRow>();

  return jsonResponse({ ok: true, equipments: rows.results ?? [] });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);
  const auth = await requireCurrentUser(request, env);
  if (auth.response) return auth.response;

  try {
    const body = await readJsonObject(request);
    const input = createEquipmentSchema.parse(body);
    const db = createDb(env.DB);

    const result = await createEquipment(db, auth.user.id, input);

    return jsonResponse({
      ok: true,
      equipment: result,
      nextPath: publicViewPath(result.slug),
      authMode: "session",
    }, { status: 201 });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "Invalid equipment input."), statusFromError(error), zodDetails(error));
  }
};

export const onRequest: PagesFunction<Env> = async ({ request }) => {
  if (request.method === "OPTIONS") return allowMethods(["GET", "POST", "OPTIONS"]);
  return errorResponse("Method not allowed.", 405);
};
