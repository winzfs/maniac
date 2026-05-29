"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { equipmentCategories } from "@/shared/data/equipment-categories";

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

const categoryLabelBySlug = new Map(equipmentCategories.map((category) => [category.slug, category]));

async function readBoards() {
  const response = await fetch("/api/public/boards", { cache: "no-store" });
  const data = (await response.json()) as BoardsResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.ok === false ? data.error ?? "게시판 목록을 불러오지 못했습니다." : "게시판 목록을 불러오지 못했습니다.");
  }

  return data.boards;
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
    return () => {
      mounted = false;
    };
  }, []);

  const categories = useMemo(() => {
    if (state.status !== "ready") return [];

    const grouped = new Map<string, PublicBoard[]>();
    for (const board of state.boards) {
      const list = grouped.get(board.category) ?? [];
      list.push(board);
      grouped.set(board.category, list);
    }

    return Array.from(grouped.entries()).map(([categorySlug, boards]) => ({
      categorySlug,
      category: categoryLabelBySlug.get(categorySlug),
      boards: boards.sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug)),
    }));
  }, [state]);

  if (state.status === "loading") {
    return (
      <section>
        <SectionHeader title="카테고리" description="D1에서 게시판 목록을 불러오는 중입니다." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((item) => (
            <Card key={item} className="h-48 animate-pulse bg-zinc-100" />
          ))}
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
    <section className="space-y-6">
      <SectionHeader title="카테고리" description="D1에 등록된 게시판 메타데이터를 기준으로 카테고리를 표시합니다." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map(({ categorySlug, category, boards }) => (
          <Card key={categorySlug} className="h-full space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Badge label={category?.shortLabel ?? categorySlug} tone="muted" />
              <span className="text-xs text-text-secondary">{boards.length} boards</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">{category?.label ?? categorySlug}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{category?.description ?? "장비 마니아를 위한 게시판입니다."}</p>
            </div>
            <div className="space-y-2 pt-2">
              {boards.map((board) => (
                <Link key={board.id} href={`/explore/${categorySlug}/${board.slug}/`} className="block rounded-2xl border border-border bg-background p-3 transition hover:-translate-y-0.5 hover:shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-bold">{board.title}</p>
                    <span className="text-xs text-text-secondary">{board.post_count}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-text-secondary">{board.description ?? "게시판 설명이 없습니다."}</p>
                </Link>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
