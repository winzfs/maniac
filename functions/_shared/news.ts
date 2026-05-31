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

type NewsProviderOptions = {
  gnewsApiKey?: string;
};

type GNewsArticle = {
  title?: string;
  description?: string;
  content?: string;
  url?: string;
  image?: string | null;
  publishedAt?: string;
  source?: {
    name?: string;
    url?: string;
  };
};

type GNewsResponse = {
  totalArticles?: number;
  articles?: GNewsArticle[];
  errors?: string[];
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

function sourceUrlValue(itemXml: string) {
  const sourceTag = itemXml.match(/<source[^>]+>/i)?.[0];
  return sourceTag ? attrValue(sourceTag, "url") : "";
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

function normalizeUrl(value: string | null | undefined, baseUrl?: string) {
  return normalizeImageUrl(value, baseUrl);
}

function isGoogleNewsUrl(value: string) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return host === "news.google.com";
  } catch {
    return false;
  }
}

function extractUrlParameter(value: string) {
  try {
    const url = new URL(value);
    const candidate = url.searchParams.get("url") || url.searchParams.get("q") || url.searchParams.get("u");
    return candidate && /^https?:\/\//i.test(candidate) ? candidate : "";
  } catch {
    return "";
  }
}

function descriptionArticleUrl(itemXml: string) {
  const description = tagValue(itemXml, "description");
  const links = Array.from(description.matchAll(/href=["']([^"']+)["']/gi))
    .map((match) => decodeXml(match[1]))
    .filter((value) => /^https?:\/\//i.test(value));
  return links.find((value) => !isGoogleNewsUrl(value)) ?? "";
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

async function resolveArticleUrl(link: string, fallbackUrl = "") {
  const explicit = extractUrlParameter(link);
  if (explicit) return explicit;
  if (fallbackUrl && !isGoogleNewsUrl(fallbackUrl)) return fallbackUrl;
  if (!isGoogleNewsUrl(link)) return link;

  try {
    const response = await fetch(link, {
      method: "HEAD",
      redirect: "follow",
      headers: { "user-agent": "GearDuckBot/1.0" },
    });
    if (response.url && !isGoogleNewsUrl(response.url)) return response.url;
  } catch {
    // Some publishers or Google redirects do not allow HEAD.
  }

  try {
    const response = await fetch(link, {
      redirect: "follow",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "GearDuckBot/1.0",
      },
    });
    if (response.url && !isGoogleNewsUrl(response.url)) return response.url;
    const html = (await response.text()).slice(0, 80_000);
    const canonical = metaContent(html, "og:url");
    const canonicalUrl = normalizeUrl(canonical, response.url || link);
    if (canonicalUrl && !isGoogleNewsUrl(canonicalUrl)) return canonicalUrl;
  } catch {
    // Keep the original link.
  }

  return fallbackUrl || link;
}

async function fetchArticleImage(link: string, fallbackUrl = "") {
  try {
    const articleUrl = await resolveArticleUrl(link, fallbackUrl);
    const response = await fetch(articleUrl, {
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
    const resolvedUrl = response.url || articleUrl;
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

async function enrichMissingImages(items: ExternalNewsItem[], fallbackUrls: Map<string, string>) {
  const targets = items.filter((item) => !item.imageUrl).slice(0, 24);
  await Promise.all(targets.map(async (item) => {
    const imageUrl = await fetchArticleImage(item.link, fallbackUrls.get(item.link) ?? "");
    if (imageUrl) item.imageUrl = imageUrl;
  }));
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

function gnewsUrl(query: string, maxItems: number, apiKey: string) {
  const params = new URLSearchParams({
    q: query,
    lang: "ko",
    country: "kr",
    max: String(Math.min(Math.max(Math.trunc(maxItems), 1), 10)),
    apikey: apiKey,
  });
  return `https://gnews.io/api/v4/search?${params.toString()}`;
}

function parseGNewsItems(data: GNewsResponse, feed: NewsFeed): ExternalNewsItem[] {
  return (data.articles ?? []).map((article, index) => {
    const link = normalizeUrl(article.url) ?? "";
    const publishedAt = article.publishedAt ?? new Date().toUTCString();
    const publishedAtMs = new Date(publishedAt).getTime();
    return {
      id: `${feed.category}-gnews-${index}-${publishedAt}`,
      title: stripTags(article.title ?? ""),
      link,
      source: article.source?.name?.trim() || "GNews",
      category: feed.label,
      publishedAt,
      publishedAtMs: Number.isFinite(publishedAtMs) ? publishedAtMs : Date.now(),
      imageUrl: normalizeImageUrl(article.image ?? null),
    };
  }).filter((item) => item.title && item.link);
}

function parseItems(xml: string, feed: NewsFeed, maxItems: number) {
  const fallbackUrls = new Map<string, string>();
  const itemMatches = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
  const items = itemMatches.slice(0, maxItems).map((itemXml, index) => {
    const rawTitle = tagValue(itemXml, "title");
    const titleParts = rawTitle.split(" - ");
    const title = stripTags(titleParts.length > 1 ? titleParts.slice(0, -1).join(" - ") : rawTitle);
    const link = tagValue(itemXml, "link");
    const publishedAt = tagValue(itemXml, "pubDate");
    const publishedAtMs = new Date(publishedAt).getTime();
    const source = sourceValue(itemXml);
    const fallbackUrl = descriptionArticleUrl(itemXml) || sourceUrlValue(itemXml);
    if (link && fallbackUrl) fallbackUrls.set(link, fallbackUrl);
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

  return { items, fallbackUrls };
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

async function fetchFeedNewsFromGNews(feed: NewsFeed, perCategory: number, apiKey: string) {
  const errors: string[] = [];

  for (const query of feed.queries) {
    try {
      const response = await fetch(gnewsUrl(query, perCategory, apiKey), {
        headers: { accept: "application/json", "user-agent": "GearDuck/1.0" },
      });
      const data = (await response.json().catch(() => null)) as GNewsResponse | null;
      if (!response.ok) throw new Error(`${feed.category} GNews fetch failed: ${response.status}`);
      const items = data ? parseGNewsItems(data, feed) : [];
      if (items.length > 0) return { items, fallbackUrls: new Map<string, string>(), errors };
    } catch (error) {
      errors.push(error instanceof Error ? `${feed.category} ${query}: ${error.message}` : `${feed.category} ${query}: ${String(error)}`);
    }
  }

  return { items: [], fallbackUrls: new Map<string, string>(), errors };
}

async function fetchFeedNewsFromGoogleRss(feed: NewsFeed, perCategory: number) {
  const errors: string[] = [];

  for (const query of feed.queries) {
    try {
      const response = await fetch(rssUrl(query), {
        headers: { "user-agent": "GearDuck/1.0" },
        cf: { cacheTtl: 900, cacheEverything: true },
      });
      if (!response.ok) throw new Error(`${feed.category} news fetch failed: ${response.status}`);
      const xml = await response.text();
      const parsed = parseItems(xml, feed, perCategory);
      if (parsed.items.length > 0) return { items: parsed.items, fallbackUrls: parsed.fallbackUrls, errors };
    } catch (error) {
      errors.push(error instanceof Error ? `${feed.category} ${query}: ${error.message}` : `${feed.category} ${query}: ${String(error)}`);
    }
  }

  return { items: [], fallbackUrls: new Map<string, string>(), errors };
}

async function fetchFeedNews(feed: NewsFeed, perCategory: number, options: NewsProviderOptions) {
  if (options.gnewsApiKey) {
    const gnews = await fetchFeedNewsFromGNews(feed, perCategory, options.gnewsApiKey);
    if (gnews.items.length > 0) return gnews;

    const rss = await fetchFeedNewsFromGoogleRss(feed, perCategory);
    return { items: rss.items, fallbackUrls: rss.fallbackUrls, errors: [...gnews.errors, ...rss.errors] };
  }

  return fetchFeedNewsFromGoogleRss(feed, perCategory);
}

export async function fetchExternalNews(limit = 8, feeds: NewsFeed[] = newsFeeds, options: NewsProviderOptions = {}) {
  const perCategory = Math.min(Math.max(Math.trunc(limit), 1), 20);

  const results = await Promise.all(feeds.map((feed) => fetchFeedNews(feed, perCategory, options)));

  const fallbackUrls = new Map<string, string>();
  for (const result of results) {
    for (const [link, fallbackUrl] of result.fallbackUrls) fallbackUrls.set(link, fallbackUrl);
  }

  const items = uniqueByLink(results
    .flatMap((result) => result.items)
    .sort((a, b) => b.publishedAtMs - a.publishedAtMs));

  const enrichedItems = await enrichMissingImages(items, fallbackUrls);
  const errors = results.flatMap((result) => result.errors);

  return { items: enrichedItems, errors, provider: options.gnewsApiKey ? "gnews+rss" : "rss" };
}
