/// <reference types="@cloudflare/workers-types" />

import { escapeXml, millisToSitemapDate, xmlResponse } from "./_shared/xml";

type Env = { DB: D1Database };

type GearSitemapRow = {
  id: string;
  updated_at: number | null;
  created_at: number | null;
};

const SITE_ORIGIN = "https://maniac-c7d.pages.dev";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return xmlResponse("", { status: 500 });

  const rows = await env.DB.prepare(
    `SELECT id, updated_at, created_at
     FROM equipments
     WHERE deleted_at IS NULL
       AND visibility = 'public'
       AND moderation_status = 'normal'
     ORDER BY updated_at DESC, created_at DESC
     LIMIT 5000`,
  ).all<GearSitemapRow>();

  const urls = (rows.results ?? []).map((gear) => {
    const loc = `${SITE_ORIGIN}/garage/view/?id=${encodeURIComponent(gear.id)}`;
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(millisToSitemapDate(gear.updated_at ?? gear.created_at))}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.65</priority>\n  </url>`;
  });

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
};
