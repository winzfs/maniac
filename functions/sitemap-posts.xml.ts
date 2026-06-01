/// <reference types="@cloudflare/workers-types" />

import { escapeXml, millisToSitemapDate, xmlResponse } from "./_shared/xml";

type Env = { DB: D1Database };

type PostSitemapRow = {
  id: string;
  updated_at: number | null;
  created_at: number | null;
};

const SITE_ORIGIN = "https://maniac-c7d.pages.dev";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return xmlResponse("", { status: 500 });

  const rows = await env.DB.prepare(
    `SELECT posts.id, posts.updated_at, posts.created_at
     FROM posts
     INNER JOIN boards ON boards.id = posts.board_id
     WHERE posts.deleted_at IS NULL
       AND posts.status = 'published'
       AND posts.visibility = 'public'
       AND posts.moderation_status = 'normal'
       AND boards.status = 'active'
       AND boards.permission = 'public'
     ORDER BY posts.updated_at DESC, posts.created_at DESC
     LIMIT 5000`,
  ).all<PostSitemapRow>();

  const urls = (rows.results ?? []).map((post) => {
    const loc = `${SITE_ORIGIN}/posts/${encodeURIComponent(post.id)}/`;
    return `  <url>\n    <loc>${escapeXml(loc)}</loc>\n    <lastmod>${escapeXml(millisToSitemapDate(post.updated_at ?? post.created_at))}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
  });

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`);
};
