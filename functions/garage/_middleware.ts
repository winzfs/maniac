/// <reference types="@cloudflare/workers-types" />

const reservedSlugs = new Set(["new", "edit", "view"]);

function firstGarageSegment(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "garage") return "";

  const raw = parts[1] || "";
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export const onRequest: PagesFunction = async ({ request, next }) => {
  const url = new URL(request.url);
  const slug = firstGarageSegment(url.pathname);

  if (!slug || reservedSlugs.has(slug)) return next();

  url.pathname = "/garage/view/";
  url.search = new URLSearchParams({ slug }).toString();
  return Response.redirect(url.toString(), 302);
};
