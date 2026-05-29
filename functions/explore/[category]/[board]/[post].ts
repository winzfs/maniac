/// <reference types="@cloudflare/workers-types" />

function firstParam(value: string | string[] | undefined) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value[0] ?? "";
  return "";
}

function decodePathParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export const onRequestGet: PagesFunction = async ({ request, params, next }) => {
  const post = decodePathParam(firstParam(params.post));
  const url = new URL(request.url);

  if (post === "write") {
    return next();
  }

  if (!post) {
    url.pathname = "/explore/";
    url.search = "";
    return Response.redirect(url.toString(), 302);
  }

  url.pathname = "/explore/post/";
  url.search = `?id=${encodeURIComponent(post)}`;

  return Response.redirect(url.toString(), 302);
};
