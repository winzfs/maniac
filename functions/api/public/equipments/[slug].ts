/// <reference types="@cloudflare/workers-types" />

import { findPublicEquipment, listPublicEquipmentLogs, listPublicEquipmentParts } from "../../../_shared/db-public-equipment";
import { errorResponse, getErrorMessage, jsonResponse, paramValue } from "../../../_shared/http";

type Env = { DB: D1Database };

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  try {
    const slug = decodeSlug(paramValue(params, "slug"));
    if (!slug) return errorResponse("Equipment slug is required.", 400);

    const equipment = await findPublicEquipment(env.DB, slug);
    if (!equipment) return errorResponse("Equipment not found.", 404);

    const [logs, parts] = await Promise.all([
      listPublicEquipmentLogs(env.DB, equipment.id),
      listPublicEquipmentParts(env.DB, equipment.id),
    ]);

    return jsonResponse({ ok: true, equipment, logs, parts });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "공개 장비를 불러오지 못했습니다."), 500);
  }
};
