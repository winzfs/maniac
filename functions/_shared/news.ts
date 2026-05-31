export type NewsFeed = {
  category: string;
  label: string;
  queries: string[];
};

export type ExternalNewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt: string;
  publishedAtMs: number;
  imageUrl: string | null;
};

export const newsFeeds: NewsFeed[] = [
  { category: "motorcycle", label: "바이크", queries: ["오토바이", "바이크", "motorcycle"] },
  { category: "pc", label: "PC", queries: ["그래픽카드", "PC 하드웨어", "GeForce"] },
  { category: "keyboard", label: "키보드", queries: ["기계식 키보드", "키보드", "mechanical keyboard"] },
  { category: "bicycle", label: "자전거", queries: ["자전거", "로드바이크", "bicycle"] },
  { category: "camera", label: "카메라", queries: ["카메라", "미러리스", "camera"] },
  { category: "camping", label: "캠핑", queries: ["캠핑 장비", "캠핑", "camping gear"] },
  { category: "audio", label: "오디오", queries: ["헤드폰", "이어폰", "오디오"] },
];

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function tagValue(itemXml: string, tag: string) {
  const match = itemXml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function attrValue(tagXml: string, attr: string) {
  const match = tagXml.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function sourceValue(itemXml: string) {
  const source = tagValue(itemXml, "source");
  if (source) return stripTags(source);
  const title = tagValue(itemXml, "title");
  const parts = title.split(" - ");
  return parts.length > 1 ? parts.at(-1)?.trim() || "News" : "News";
}

function normalizeImageUrl(value: string | null | undefined, baseUrl?: string) {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = baseUrl ? new URL(raw, baseUrl) : new URL(raw);
    return /^https?:$/i.test(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function imageValue(itemXml: string) {
  const mediaContent = itemXml.match(/<media:content[^>]+>/i)?.[0];
  const mediaThumbnail = itemXml.match(/<media:thumbnail[^>]+>/i)?.[0];
  const enclosure = itemXml.match(/<enclosure[^>]+>/i)?.[0];
  const htmlImage = itemXml.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];

  const candidate = [
    mediaContent ? attrValue(mediaContent, "url") : "",
    mediaThumbnail ? attrValue(mediaThumbnail, "url") : "",
    enclosure ? attrValue(enclosure, "url") : "",
    htmlImage ? decodeXml(htmlImage) : "",
  ].map((value) => normalizeImageUrl(value)).find(Boolean);

  return candidate ?? null;
}

function metaContent(html: string, property: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["'][^>]*>`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeXml(match[1]);
  }
  return "";
}

async function fetchArticleImage(link: string) {
  try {
    const response = await fetch(link, {
      redirect: "follow",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "GearDuckBot/1.0",
      },
    });
    if (!response.ok) return null;
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;
    const html = (await response.text()).slice(0, 180_000);
    const resolvedUrl = response.url || link;
    const candidate = [
      metaContent(html, "og:image"),
      metaContent(html, "og:image:url"),
      metaContent(html, "twitter:image"),
      metaContent(html, "twitter:image:src"),
    ].map((value) => normalizeImageUrl(value, resolvedUrl)).find(Boolean);
    return candidate ?? null;
  } catch {
    return null;
  }
}

async function enrichMissingImages(items: ExternalNewsItem[]) {
  const targets = items.filter((item) => !item.imageUrl).slice(0, 16);
  for (const item of targets) {
    const imageUrl = await fetchArticleImage(item.link);
    if (imageUrl) item.imageUrl = imageUrl;
  }
  return items;
}

function rssUrl(query: string) {
  const params = new URLSearchParams({
    q: query,
    hl: "ko",
    gl: "KR",
    ceid: "KR:ko",
  });
  return `https://news.google.com/rss/search?${params.toString()}`;
}

function parseItems(xml: string, feed: NewsFeed, maxItems: number): ExternalNewsItem[] {
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  return itemMatches.slice(0, maxItems).map((itemXml, index) => {
    const rawTitle = tagValue(itemXml, "title");
    const titleParts = rawTitle.split(" - ");
    const title = stripTags(titleParts.length > 1 ? titleParts.slice(0, -1).join(" - ") : rawTitle);
    const link = tagValue(itemXml, "link");
    const publishedAt = tagValue(itemXml, "pubDate");
    const publishedAtMs = new Date(publishedAt).getTime();
    const source = sourceValue(itemXml);
    return {
      id: `${feed.category}-${index}-${publishedAt}`,
      title,
      link,
      source,
      category: feed.label,
      publishedAt,
      publishedAtMs: Number.isFinite(publishedAtMs) ? publishedAtMs : Date.now(),
      imageUrl: imageValue(itemXml),
    };
  }).filter((item) => item.title && item.link);
}

function uniqueByLink(items: ExternalNewsItem[]) {
  const seen = new Set<string>();
  const unique: ExternalNewsItem[] = [];
  for (const item of items) {
    if (seen.has(item.link)) continue;
    seen.add(item.link);
    unique.push(item);
  }
  return unique;
}

async function fetchFeedNews(feed: NewsFeed, perCategory: number) {
  const errors: string[] = [];

  for (const query of feed.queries) {
    try {
      const response = await fetch(rssUrl(query), {
        headers: { "user-agent": "GearDuck/1.0" },
        cf: { cacheTtl: 900, cacheEverything: true },
      });
      if (!response.ok) throw new Error(`${feed.category} news fetch failed: ${response.status}`);
      const xml = await response.text();
      const items = parseItems(xml, feed, perCategory);
      if (items.length > 0) return { items, errors };
    } catch (error) {
      errors.push(error instanceof Error ? `${feed.category} ${query}: ${error.message}` : `${feed.category} ${query}: ${String(error)}`);
    }
  }

  return { items: [], errors };
}

export async function fetchExternalNews(limit = 8, feeds: NewsFeed[] = newsFeeds) {
  const perCategory = Math.min(Math.max(Math.trunc(limit), 1), 20);

  const results = await Promise.all(feeds.map((feed) => fetchFeedNews(feed, perCategory)));

  const items = uniqueByLink(results
    .flatMap((result) => result.items)
    .sort((a, b) => b.publishedAtMs - a.publishedAtMs));

  const enrichedItems = await enrichMissingImages(items);
  const errors = results.flatMap((result) => result.errors);

  return { items: enrichedItems, errors };
}
