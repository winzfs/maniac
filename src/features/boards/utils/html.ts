const allowedTags = new Set(["p", "br", "strong", "b", "em", "i", "h2", "blockquote", "ul", "ol", "li", "a", "img"]);
const voidTags = new Set(["br", "img"]);

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function stripControlCharacters(value: string) {
  return value.replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
}

function isSafeLinkUrl(value: string) {
  const normalized = stripControlCharacters(value);
  return normalized.startsWith("https://") || normalized.startsWith("http://");
}

function isSafeImageUrl(value: string) {
  const normalized = stripControlCharacters(value);
  return normalized.startsWith("https://") || normalized.startsWith("http://");
}

function sanitizeAttributes(tagName: string, rawAttributes: string) {
  const attributes: string[] = [];
  const attributePattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("[^"]*"|'[^']*'|[^\s"'<>`=]+)/g;

  for (const match of rawAttributes.matchAll(attributePattern)) {
    const name = match[1]?.toLowerCase() ?? "";
    const rawValue = match[2] ?? "";
    const value = rawValue.replace(/^[']|[']$/g, "").replace(/^["]|["]$/g, "");

    if (name.startsWith("on") || name === "style") continue;

    if (tagName === "a" && name === "href" && isSafeLinkUrl(value)) {
      attributes.push(`href="${escapeAttribute(value)}"`);
      attributes.push('rel="nofollow noopener noreferrer"');
      attributes.push('target="_blank"');
      continue;
    }

    if (tagName === "img" && name === "src" && isSafeImageUrl(value)) {
      attributes.push(`src="${escapeAttribute(value)}"`);
      continue;
    }

    if (tagName === "img" && name === "alt") {
      attributes.push(`alt="${escapeAttribute(value.slice(0, 120))}"`);
    }
  }

  return attributes.length ? ` ${attributes.join(" ")}` : "";
}

export function htmlToPlainText(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptFromHtml(html: string, maxLength = 110) {
  const text = htmlToPlainText(html);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function sanitizePostHtml(html: string) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<\/?([a-zA-Z][\w:-]*)([^>]*)>/g, (tag, tagName: string, rawAttributes: string) => {
      const normalizedTagName = tagName.toLowerCase();
      if (!allowedTags.has(normalizedTagName)) return "";

      const isClosingTag = /^<\s*\//.test(tag);
      if (isClosingTag) return voidTags.has(normalizedTagName) ? "" : `</${normalizedTagName}>`;

      const attributes = sanitizeAttributes(normalizedTagName, rawAttributes);
      return voidTags.has(normalizedTagName) ? `<${normalizedTagName}${attributes}>` : `<${normalizedTagName}${attributes}>`;
    })
    .replace(/javascript\s*:/gi, "")
    .trim();
}
