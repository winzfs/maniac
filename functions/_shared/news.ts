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
  ].find((value) => /^https?:\/\//i.test(value));

  return candidate ?? null;
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

export async function fetchExternalNews(limit = 8) {
  const perCategory = Math.min(Math.max(Math.trunc(limit), 1), 20);

  const results = await Promise.all(newsFeeds.map((feed) => fetchFeedNews(feed, perCategory)));

  const items = uniqueByLink(results
    .flatMap((result) => result.items)
    .sort((a, b) => b.publishedAtMs - a.publishedAtMs));

  const errors = results.flatMap((result) => result.errors);

  return { items, errors };
}
