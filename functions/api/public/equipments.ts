/// <reference types="@cloudflare/workers-types" />

import { errorResponse, jsonResponse } from "../../_shared/http";

type Env = { DB: D1Database };

type PublicEquipmentListRow = {
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
  created_at: number;
  maintenance_log_count: number;
  part_count: number;
  activity_score: number;
};

function parseLimit(request: Request) {
  const url = new URL(request.url);
  const value = Number(url.searchParams.get("limit") ?? 6);
  if (!Number.isFinite(value)) return 6;
  return Math.min(Math.max(Math.trunc(value), 1), 12);
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const limit = parseLimit(request);
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
       equipments.main_image_url,
       equipments.usage_metric_type,
       equipments.usage_metric_value,
       equipments.created_at,
       COUNT(DISTINCT maintenance_logs.id) AS maintenance_log_count,
       COUNT(DISTINCT parts.id) AS part_count,
       COUNT(DISTINCT maintenance_logs.id) * 3 + COUNT(DISTINCT parts.id) * 2 AS activity_score
     FROM equipments
     LEFT JOIN maintenance_logs
       ON maintenance_logs.equipment_id = equipments.id
      AND maintenance_logs.deleted_at IS NULL
      AND maintenance_logs.visibility = 'public'
      AND maintenance_logs.moderation_status = 'normal'
     LEFT JOIN parts
       ON parts.equipment_id = equipments.id
      AND parts.deleted_at IS NULL
      AND parts.visibility = 'public'
      AND parts.moderation_status = 'normal'
     WHERE equipments.deleted_at IS NULL
       AND equipments.visibility = 'public'
       AND equipments.moderation_status = 'normal'
     GROUP BY equipments.id
     ORDER BY activity_score DESC, equipments.created_at DESC
     LIMIT ?`,
  ).bind(limit).all<PublicEquipmentListRow>();

  return jsonResponse({ ok: true, equipments: rows.results ?? [] });
};
