"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
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
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
};

type State =
  | { status: "loading" }
  | { status: "success"; items: NewsItem[]; source?: string; page: number; pageSize: number; total: number; totalPages: number }
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

const pageSize = 18;

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

function pageNumbers(currentPage: number, totalPages: number) {
  const start = Math.max(currentPage - 2, 1);
  const end = Math.min(start + 4, totalPages);
  const normalizedStart = Math.max(end - 4, 1);
  return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index);
}

export function NewsBoardClient() {
  const searchParams = useSearchParams();
  const manageMode = searchParams.get("manage") === "1" || searchParams.get("mode") === "manage";
  const devSecret = searchParams.get("secret") ?? "";
  const [activeCategory, setActiveCategory] = useState("all");
  const [activePage, setActivePage] = useState(1);
  const [state, setState] = useState<State>({ status: "loading" });
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadNews() {
      setState({ status: "loading" });
      try {
        const params = new URLSearchParams({ limit: String(pageSize), page: String(activePage) });
        if (activeCategory !== "all") params.set("category", activeCategory);
        const response = await fetch(`/api/news?${params.toString()}`, { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as NewsResponse | null;

        if (!response.ok || !data?.ok) throw new Error("장비 뉴스를 불러오지 못했습니다.");
        if (mounted) {
          setState({
            status: "success",
            items: data.items ?? [],
            source: data.source,
            page: data.page ?? activePage,
            pageSize: data.pageSize ?? pageSize,
            total: data.total ?? data.items?.length ?? 0,
            totalPages: data.totalPages ?? 1,
          });
        }
      } catch (error) {
        if (mounted) setState({ status: "error", message: error instanceof Error ? error.message : "장비 뉴스를 불러오지 못했습니다." });
      }
    }

    void loadNews();

    return () => {
      mounted = false;
    };
  }, [activeCategory, activePage]);

  const activeLabel = useMemo(() => categories.find((category) => category.slug === activeCategory)?.label ?? "전체", [activeCategory]);

  function changeCategory(category: string) {
    setActiveCategory(category);
    setActivePage(1);
  }

  async function hideNews(item: NewsItem) {
    if (!item.id) return;
    const confirmed = window.confirm("이 뉴스를 목록에서 숨길까요?");
    if (!confirmed) return;

    try {
      setBusyId(item.id);
      const params = new URLSearchParams({ id: item.id });
      if (devSecret) params.set("secret", devSecret);
      const response = await fetch(`/api/dev/hide-news?${params.toString()}`, { method: "POST", cache: "no-store" });
      const data = (await response.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!response.ok || !data?.ok) throw new Error(data?.error ?? "뉴스를 숨기지 못했습니다.");
      setState((previous) => {
        if (previous.status !== "success") return previous;
        const items = previous.items.filter((candidate) => candidate.id !== item.id);
        return { ...previous, items, total: Math.max(previous.total - 1, 0) };
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "뉴스를 숨기지 못했습니다.");
    } finally {
      setBusyId(null);
    }
  }

  const pagination = state.status === "success" && state.totalPages > 1 ? (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      <Button variant="secondary" disabled={state.page <= 1} onClick={() => setActivePage((page) => Math.max(page - 1, 1))}>이전</Button>
      {pageNumbers(state.page, state.totalPages).map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => setActivePage(page)}
          className={`rounded-full px-4 py-2 text-sm font-black transition ${page === state.page ? "bg-graphite text-white" : "bg-surface text-text-secondary hover:bg-background"}`}
        >
          {page}
        </button>
      ))}
      <Button variant="secondary" disabled={state.page >= state.totalPages} onClick={() => setActivePage((page) => Math.min(page + 1, state.totalPages))}>다음</Button>
      <span className="basis-full text-center text-xs font-semibold text-text-secondary">{state.page} / {state.totalPages} 페이지 · 총 {state.total.toLocaleString()}개</span>
    </div>
  ) : null;

  return (
    <div className="space-y-8 lg:space-y-10">
      <Card variant="dark" className="grid gap-5 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold text-lime-200">News Board</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">장비 뉴스 게시판</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-300">외부 뉴스 피드와 DB 캐시를 기반으로 장비 관련 소식을 게시판처럼 모아봅니다.</p>
          {manageMode ? <p className="mt-2 text-xs font-bold text-orange-200">관리 모드: 뉴스 카드에서 숨김 처리를 할 수 있습니다.</p> : null}
        </div>
        <div className="rounded-2xl bg-white/10 p-4 text-sm text-zinc-300">
          <b className="block text-lg text-white">{state.status === "success" ? state.total.toLocaleString() : "-"} posts</b>
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
              onClick={() => changeCategory(category.slug)}
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
          <>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {state.items.map((item, index) => {
                const href = text(item.link, "#");
                const title = text(item.title, "제목 없는 뉴스");
                const category = text(item.category, activeLabel);
                const source = shortSource(item.source);
                const thumbnail = imageSrc(item.imageUrl);
                const disabled = href === "#";

                return (
                  <Card key={itemKey(item, index)} className="grid h-full grid-cols-[5.5rem_minmax(0,1fr)] gap-3 p-3 transition hover:-translate-y-0.5 hover:shadow-sm sm:grid-cols-[7rem_minmax(0,1fr)]">
                    <a href={href} target={disabled ? undefined : "_blank"} rel={disabled ? undefined : "noreferrer"} className="contents">
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
                    </a>
                    {manageMode ? (
                      <div className="col-span-2 border-t border-line/60 pt-2 sm:col-span-2">
                        <Button className="w-full" variant="secondary" disabled={busyId === item.id} onClick={() => hideNews(item)}>{busyId === item.id ? "숨기는 중..." : "뉴스 숨기기"}</Button>
                      </div>
                    ) : null}
                  </Card>
                );
              })}
            </div>
            {pagination}
          </>
        ) : null}
      </section>
    </div>
  );
}
