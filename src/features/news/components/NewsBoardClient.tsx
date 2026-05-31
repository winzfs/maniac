"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";

type NewsItem = {
  id: string;
  title?: string | null;
  link?: string | null;
  source?: string | null;
  category?: string | null;
  publishedAt?: string | null;
  imageUrl?: string | null;
};

type NewsResponse = {
  ok?: boolean;
  source?: string;
  category?: string | null;
  items?: NewsItem[];
  errors?: string[];
};

type State =
  | { status: "loading" }
  | { status: "success"; items: NewsItem[]; source?: string }
  | { status: "error"; message: string };

const categories = [
  { slug: "all", label: "전체" },
  { slug: "motorcycle", label: "바이크" },
  { slug: "pc", label: "PC" },
  { slug: "keyboard", label: "키보드" },
  { slug: "bicycle", label: "자전거" },
  { slug: "camera", label: "카메라" },
  { slug: "camping", label: "캠핑" },
  { slug: "audio", label: "오디오" },
];

function text(value: string | null | undefined, fallback: string) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  return normalized && normalized.length > 0 ? normalized : fallback;
}

function imageSrc(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized && /^https?:\/\//i.test(normalized) ? normalized : null;
}

function formatDate(value: string | null | undefined) {
  const date = new Date(value ?? "");
  if (Number.isNaN(date.getTime())) return "최근";
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

function shortSource(value: string | null | undefined) {
  return text(value, "News").replace(/^Google News$/i, "News");
}

function itemKey(item: NewsItem, index: number) {
  return item.id || item.link || `news-${index}`;
}

export function NewsBoardClient() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function loadNews() {
      setState({ status: "loading" });
      try {
        const params = new URLSearchParams({ limit: "36" });
        if (activeCategory !== "all") params.set("category", activeCategory);
        const response = await fetch(`/api/news?${params.toString()}`, { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as NewsResponse | null;

        if (!response.ok || !data?.ok) throw new Error("장비 뉴스를 불러오지 못했습니다.");
        if (mounted) setState({ status: "success", items: data.items ?? [], source: data.source });
      } catch (error) {
        if (mounted) setState({ status: "error", message: error instanceof Error ? error.message : "장비 뉴스를 불러오지 못했습니다." });
      }
    }

    void loadNews();

    return () => {
      mounted = false;
    };
  }, [activeCategory]);

  const activeLabel = useMemo(() => categories.find((category) => category.slug === activeCategory)?.label ?? "전체", [activeCategory]);

  return (
    <div className="space-y-8 lg:space-y-10">
      <Card variant="dark" className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-lime-200">News Board</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">장비 뉴스 게시판</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">외부 뉴스 피드와 DB 캐시를 기반으로 장비 관련 소식을 게시판처럼 모아봅니다.</p>
        </div>
        <div className="rounded-2xl bg-white/10 p-4 text-sm text-zinc-300">
          <b className="block text-lg text-white">{state.status === "success" ? state.items.length : "-"} posts</b>
          <span>{activeLabel} 뉴스</span>
        </div>
      </Card>

      <section className="space-y-4">
        <SectionHeader title="카테고리" description="다른 게시판처럼 카테고리를 눌러 뉴스 목록을 필터링합니다." />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveCategory(category.slug)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${activeCategory === category.slug ? "bg-graphite text-white" : "bg-surface text-text-secondary hover:bg-background"}`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="뉴스 글" description="카드를 누르면 원문 기사로 이동합니다." />

        {state.status === "loading" ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 p-3 sm:grid-cols-[7rem_minmax(0,1fr)]">
                <div className="aspect-square w-full animate-pulse rounded-2xl bg-zinc-200" />
                <div className="min-w-0 space-y-3 py-1">
                  <div className="h-5 w-24 animate-pulse rounded-full bg-zinc-200" />
                  <div className="space-y-2">
                    <div className="h-5 w-11/12 animate-pulse rounded-full bg-zinc-200" />
                    <div className="h-5 w-8/12 animate-pulse rounded-full bg-zinc-200" />
                  </div>
                  <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-200" />
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {state.status === "error" ? <Card className="mt-5 p-6 text-sm text-text-secondary">{state.message}</Card> : null}

        {state.status === "success" && state.items.length === 0 ? <Card className="mt-5 p-6 text-sm text-text-secondary">표시할 뉴스가 없습니다.</Card> : null}

        {state.status === "success" && state.items.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {state.items.map((item, index) => {
              const href = text(item.link, "#");
              const title = text(item.title, "제목 없는 뉴스");
              const category = text(item.category, activeLabel);
              const source = shortSource(item.source);
              const thumbnail = imageSrc(item.imageUrl);
              const disabled = href === "#";

              return (
                <a key={itemKey(item, index)} href={href} target={disabled ? undefined : "_blank"} rel={disabled ? undefined : "noreferrer"} className="block">
                  <Card className="grid h-full grid-cols-[5.5rem_minmax(0,1fr)] gap-3 p-3 transition hover:-translate-y-0.5 hover:shadow-sm sm:grid-cols-[7rem_minmax(0,1fr)]">
                    {thumbnail ? (
                      <img src={thumbnail} alt="" className="aspect-square h-full w-full rounded-2xl object-cover" loading="lazy" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="flex aspect-square h-full w-full items-center justify-center rounded-2xl bg-background text-xs font-black text-text-secondary">{category}</div>
                    )}
                    <div className="min-w-0 space-y-2 py-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge label={category} tone="muted" />
                        <span className="text-xs font-semibold text-text-secondary">{formatDate(item.publishedAt)}</span>
                      </div>
                      <h3 className="line-clamp-2 font-bold leading-tight text-text-primary">{title}</h3>
                      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-text-secondary">
                        <span className="truncate">{source}</span>
                        <span className="shrink-0 text-orange-600">{disabled ? "링크 없음" : "원문 보기 →"}</span>
                      </div>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        ) : null}
      </section>
    </div>
  );
}
