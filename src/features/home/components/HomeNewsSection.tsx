"use client";

import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { useEffect, useState } from "react";

type NewsItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  category: string;
  publishedAt: string;
  imageUrl?: string | null;
};

type NewsResponse = {
  ok?: boolean;
  items?: NewsItem[];
  errors?: string[];
};

type State =
  | { status: "loading" }
  | { status: "success"; items: NewsItem[] }
  | { status: "error"; message: string };

function imageSrc(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized && /^https?:\/\//i.test(normalized) ? normalized : null;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "최근";
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function HomeNewsSection() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function loadNews() {
      try {
        const response = await fetch("/api/news?limit=10", { cache: "no-store" });
        const data = (await response.json().catch(() => null)) as NewsResponse | null;

        if (!response.ok || !data?.ok) throw new Error("장비 뉴스를 불러오지 못했습니다.");
        if (mounted) setState({ status: "success", items: data.items ?? [] });
      } catch (error) {
        if (mounted) setState({ status: "error", message: error instanceof Error ? error.message : "장비 뉴스를 불러오지 못했습니다." });
      }
    }

    void loadNews();

    return () => {
      mounted = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <section className="space-y-5">
        <SectionHeader title="장비 뉴스" description="외부 뉴스 피드에서 장비 관련 소식을 모아봅니다." />
        <div className="grid gap-3 lg:grid-cols-2">
          {[0, 1, 2, 3].map((item) => <Card key={item} className="h-28 animate-pulse p-5" />)}
        </div>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="space-y-5">
        <SectionHeader title="장비 뉴스" description="외부 뉴스 피드에서 장비 관련 소식을 모아봅니다." />
        <Card className="p-5 text-sm text-text-secondary">{state.message}</Card>
      </section>
    );
  }

  if (state.items.length === 0) {
    return (
      <section className="space-y-5">
        <SectionHeader title="장비 뉴스" description="외부 뉴스 피드에서 장비 관련 소식을 모아봅니다." />
        <Card className="p-5 text-sm text-text-secondary">표시할 뉴스가 없습니다.</Card>
      </section>
    );
  }

  const [lead, ...rest] = state.items;
  const leadImage = imageSrc(lead.imageUrl);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeader title="장비 뉴스" description="바이크, PC, 키보드, 카메라 등 장비 관련 외부 뉴스를 모았습니다." />
        <Link href="/explore/news/" className="shrink-0">
          <Button variant="secondary" className="w-full sm:w-auto">뉴스 게시판 보기</Button>
        </Link>
      </div>
      <div className="grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
        <a href={lead.link} target="_blank" rel="noreferrer" className="block">
          <Card variant="dark" className="grid overflow-hidden p-0 transition hover:-translate-y-0.5 hover:shadow-lg sm:grid-cols-[11rem_minmax(0,1fr)] lg:block">
            {leadImage ? (
              <img src={leadImage} alt="" className="h-40 w-full object-cover sm:h-full sm:min-h-44 lg:h-44" loading="lazy" referrerPolicy="no-referrer" />
            ) : null}
            <div className="p-5 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge label={lead.category} tone="lime" />
                <span className="text-xs text-zinc-300">{formatDate(lead.publishedAt)}</span>
              </div>
              <h3 className="mt-3 line-clamp-3 text-xl font-black leading-tight tracking-tight sm:text-2xl">{lead.title}</h3>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-sm text-zinc-300">
                <span className="truncate">{lead.source}</span>
                <span className="shrink-0 font-semibold text-lime-200">뉴스 보기 →</span>
              </div>
            </div>
          </Card>
        </a>

        <div className="grid gap-3">
          {rest.slice(0, 6).map((item) => {
            const thumbnail = imageSrc(item.imageUrl);
            return (
              <a key={item.id} href={item.link} target="_blank" rel="noreferrer" className="block">
                <Card className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3 p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:grid-cols-[7rem_minmax(0,1fr)]">
                  {thumbnail ? (
                    <img src={thumbnail} alt="" className="aspect-square h-full w-full rounded-2xl object-cover" loading="lazy" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="flex aspect-square h-full w-full items-center justify-center rounded-2xl bg-background text-xs font-black text-text-secondary">{item.category}</div>
                  )}
                  <div className="min-w-0 space-y-2 py-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge label={item.category} tone="muted" />
                      <span className="text-xs text-text-secondary">{formatDate(item.publishedAt)}</span>
                    </div>
                    <h3 className="line-clamp-2 font-bold leading-tight">{item.title}</h3>
                    <p className="truncate text-xs text-text-secondary">{item.source}</p>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
