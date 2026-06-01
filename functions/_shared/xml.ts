export function xmlResponse(body: string, init?: ResponseInit) {
  return new Response(body, {
    ...init,
    headers: {
      "content-type": "application/xml; charset=utf-8",
      "cache-control": "public, max-age=900, s-maxage=900",
      ...init?.headers,
    },
  });
}

export function escapeXml(value: string | number | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function millisToSitemapDate(value: number | null | undefined) {
  if (!value) return new Date().toISOString();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}
