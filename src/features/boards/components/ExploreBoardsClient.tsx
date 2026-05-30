"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { communityBoardTopics, equipmentCategories, topicBoardSlug } from "@/shared/data/equipment-categories";

type PublicBoard = {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  description: string | null;
  status: string;
  permission: string;
  sort_order: number;
  post_count: number;
};

type BoardsResponse =
  | { ok: true; boards: PublicBoard[] }
  | { ok: false; error?: string };

type State =
  | { status: "loading" }
  | { status: "ready"; boards: PublicBoard[] }
  | { status: "error"; message: string };

async function readBoards() {
  const response = await fetch("/api/public/boards", { cache: "no-store" });
  const data = (await response.json()) as BoardsResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.ok === false ? data.error ?? "게시판 목록을 불러오지 못했습니다." : "게시판 목록을 불러오지 못했습니다.");
  }

  return data.boards;
}

function boardHref(categorySlug: string, topicSlug: string) {
  return `/explore/${categorySlug}/${topicBoardSlug(categorySlug, topicSlug)}/`;
}

export function ExploreBoardsClient() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const boards = await readBoards();
        if (mounted) setState({ status: "ready", boards });
      } catch (error) {
        if (!mounted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "게시판 목록을 불러오지 못했습니다." });
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const topicStats = useMemo(() => {
    if (state.status !== "ready") return new Map<string, { postCount: number; categories: Set<string> }>();
    const stats = new Map<string, { postCount: number; categories: Set<string> }>();
    for (const topic of communityBoardTopics) stats.set(topic.slug, { postCount: 0, categories: new Set() });
    for (const board of state.boards) {
      const stat = stats.get(board.type) ?? { postCount: 0, categories: new Set<string>() };
      stat.postCount += board.post_count;
      stat.categories.add(board.category);
      stats.set(board.type, stat);
    }
    return stats;
  }, [state]);

  if (state.status === "loading") {
    return (
      <section>
        <SectionHeader title="기어 게시판" description="주제별 게시판과 기어 카테고리를 불러오는 중입니다." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => <Card key={item} className="h-44 animate-pulse bg-zinc-100" />)}
        </div>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <Card className="space-y-3 p-6">
        <h2 className="text-xl font-bold">게시판 목록을 불러오지 못했습니다.</h2>
        <p className="text-sm leading-6 text-text-secondary">{state.message}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="space-y-4">
        <SectionHeader
          title="덕질 게시판"
          description="먼저 이야기할 주제를 고르고, 바이크·PC·키보드 같은 기어 카테고리로 덕질 기록을 필터링하세요."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {communityBoardTopics.map((topic) => {
            const stat = topicStats.get(topic.slug);
            const defaultCategory = equipmentCategories.find((category) => stat?.categories.has(category.slug)) ?? equipmentCategories[0];
            return (
              <Link key={topic.slug} href={boardHref(defaultCategory.slug, topic.slug)}>
                <Card className="flex h-full flex-col gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <Badge label={topic.shortLabel} tone={topic.slug === "trade" ? "orange" : "muted"} />
                    <span className="text-xs font-semibold text-text-secondary">{stat?.postCount ?? 0} posts</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-lg font-black tracking-[-0.03em]">{topic.title}</h2>
                    <p className="line-clamp-3 text-sm leading-6 text-text-secondary">{topic.description}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {equipmentCategories.slice(0, 4).map((category) => (
                      <span key={category.slug} className="rounded-full bg-background px-2.5 py-1 text-[0.7rem] font-bold text-text-secondary">{category.label}</span>
                    ))}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeader
          title="기어 카테고리"
          description="특정 장비군만 보고 싶다면 카테고리로 들어가서 모든 덕질 글을 한 번에 확인하세요."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipmentCategories.map((category) => (
            <Link key={category.slug} href={`/explore/${category.slug}/`}>
              <Card className="h-full space-y-3 p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
                <Badge label={category.label} tone="muted" />
                <h2 className="text-2xl font-black tracking-[-0.04em]">{category.label}</h2>
                <p className="text-sm leading-6 text-text-secondary">{category.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
