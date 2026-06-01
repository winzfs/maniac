/// <reference types="@cloudflare/workers-types" />

function paramValue(params: Record<string, string | string[]>, key: string) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export const onRequestGet: PagesFunction = async ({ params, request }) => {
  const id = paramValue(params, "id");
  if (!id) return new Response("Post id is required.", { status: 400 });

  const url = new URL(request.url);
  url.pathname = "/explore/post/";
  url.search = `?id=${encodeURIComponent(id)}`;

  return Response.redirect(url.toString(), 302);
};
