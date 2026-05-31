/// <reference types="@cloudflare/workers-types" />

import { requireAdminUser } from "../../_shared/require-admin";
import { errorResponse, jsonResponse, readJsonObject } from "../../_shared/http";
import { getNewsFeedSettings, saveNewsFeedSettings } from "../../_shared/news-feed-settings";
import type { NewsFeed } from "../../_shared/news";

type Env = { DB: D1Database; APP_ENV?: string };

function normalizeFeeds(value: unknown): NewsFeed[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const record = typeof item === "object" && item !== null ? item as Record<string, unknown> : {};
    return {
      category: typeof record.category === "string" ? record.category : "",
      label: typeof record.label === "string" ? record.label : "",
      queries: Array.isArray(record.queries) ? record.queries.filter((query): query is string => typeof query === "string") : [],
    };
  }).filter((feed) => feed.category && feed.queries.length > 0);
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireAdminUser(request, env);
  if (auth.response) return auth.response;

  const feeds = await getNewsFeedSettings(env.DB);
  return jsonResponse({ ok: true, feeds });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.DB) return errorResponse("D1 binding DB is not configured.", 500);

  const auth = await requireAdminUser(request, env);
  if (auth.response) return auth.response;

  try {
    const body = await readJsonObject(request);
    const feeds = normalizeFeeds(body.feeds);
    if (feeds.length === 0) return errorResponse("저장할 뉴스 키워드가 없습니다.", 400);

    const savedFeeds = await saveNewsFeedSettings(env.DB, feeds);
    return jsonResponse({ ok: true, feeds: savedFeeds });
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "뉴스 키워드 저장에 실패했습니다.", 400);
  }
};
