/// <reference types="@cloudflare/workers-types" />

import { getCurrentUser } from "../../../_shared/auth-session";
import { findViewableEquipment, listPublicEquipmentLogs, listPublicEquipmentParts } from "../../../_shared/db-public-equipment";
import { ensureGarageSchema } from "../../../_shared/ensure-garage-schema";
import { errorResponse, getErrorMessage, jsonResponse, paramValue } from "../../../_shared/http";

type Env = { DB: D1Database; APP_ENV?: string };

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  try {
    await ensureGarageSchema(env.DB);

    const viewer = await getCurrentUser(request, env).catch(() => null);
    const slug = decodeSlug(paramValue(params, "slug"));
    if (!slug) return errorResponse("Equipment slug is required.", 400);

    const equipment = await findViewableEquipment(env.DB, slug, viewer?.id ?? null);
    if (!equipment) return errorResponse("Equipment not found.", 404);

    const [logs, parts] = await Promise.all([
      listPublicEquipmentLogs(env.DB, equipment.id, viewer?.id ?? null),
      listPublicEquipmentParts(env.DB, equipment.id, viewer?.id ?? null),
    ]);

    return jsonResponse({ ok: true, equipment, logs, parts });
  } catch (error) {
    return errorResponse(getErrorMessage(error, "공개 장비를 불러오지 못했습니다."), 500);
  }
};
