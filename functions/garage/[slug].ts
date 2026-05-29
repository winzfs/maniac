/// <reference types="@cloudflare/workers-types" />

function decodeSlug(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function getSlug(params: EventContext<unknown, string, unknown>["params"]) {
  const value = params.slug;
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] : "";
}

export const onRequestGet: PagesFunction = async ({ params }) => {
  const slug = decodeSlug(getSlug(params));

  if (!slug) {
    return Response.redirect("/garage/", 302);
  }

  return Response.redirect(`/garage/view/?slug=${encodeURIComponent(slug)}`, 302);
};
