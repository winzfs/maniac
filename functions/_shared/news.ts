export type NewsFeed = {
  category: string;
  label: string;
  query: string;
};

export type ExternalNewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt: string;
  publishedAtMs: number;
};

export const newsFeeds: NewsFeed[] = [
  { category: "motorcycle", label: "바이크", query: "Kawasaki OR Yamaha OR Honda motorcycle" },
  { category: "pc", label: "PC", query: "Ryzen OR GeForce OR RTX PC hardware" },
  { category: "keyboard", label: "키보드", query: "mechanical keyboard OR Keychron OR Wooting" },
  { category: "bicycle", label: "자전거", query: "Trek bicycle OR Shimano OR road bike" },
  { category: "camera", label: "카메라", query: "Canon OR Sony Alpha OR Fujifilm camera" },
  { category: "camping", label: "캠핑", query: "camping gear OR Helinox OR MSR" },
  { category: "audio", label: "오디오", query: "Sony headphones OR Sennheiser OR audio gear" },
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

function sourceValue(itemXml: string) {
  const source = tagValue(itemXml, "source");
  if (source) return stripTags(source);
  const title = tagValue(itemXml, "title");
  const parts = title.split(" - ");
  return parts.length > 1 ? parts.at(-1)?.trim() || "News" : "News";
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
    };
  }).filter((item) => item.title && item.link);
}

export async function fetchExternalNews(limit = 12) {
  const safeLimit = Math.min(Math.max(Math.trunc(limit), 1), 50);
  const perFeed = Math.max(2, Math.ceil(safeLimit / newsFeeds.length));

  const results = await Promise.allSettled(
    newsFeeds.map(async (feed) => {
      const response = await fetch(rssUrl(feed.query), {
        headers: { "user-agent": "ManiacGarage/1.0" },
        cf: { cacheTtl: 900, cacheEverything: true },
      });
      if (!response.ok) throw new Error(`${feed.category} news fetch failed: ${response.status}`);
      const xml = await response.text();
      return parseItems(xml, feed, perFeed);
    }),
  );

  const items = results
    .flatMap((result) => result.status === "fulfilled" ? result.value : [])
    .sort((a, b) => b.publishedAtMs - a.publishedAtMs)
    .slice(0, safeLimit);

  const errors = results
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason instanceof Error ? result.reason.message : String(result.reason));

  return { items, errors };
}
