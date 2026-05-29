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

export const onRequestGet: PagesFunction = async ({ params }) => {
  const post = decodePathParam(firstParam(params.post));

  if (!post) {
    return Response.redirect("/explore/", 302);
  }

  return Response.redirect(`/explore/post/?id=${encodeURIComponent(post)}`, 302);
};
