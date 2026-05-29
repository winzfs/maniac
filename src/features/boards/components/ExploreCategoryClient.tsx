"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { getEquipmentCategory } from "@/shared/data/equipment-categories";
import { excerptFromHtml } from "@/features/boards/utils/html";

type PublicBoard = {
  id: string;
  slug: string;
  title: string;
  category: string;
  type: string;
  description: string | null;
  post_count: number;
  sort_order: number;
};

type PublicPost = {
  id: string;
  board_slug: string;
  board_title: string;
  category: string;
  title: string;
  body: string;
  author_nickname: string | null;
  created_at: number;
  comment_count: number;
};

type BoardsResponse = { ok: true; boards: PublicBoard[] } | { ok: false; error?: string };
type PostsResponse = { ok: true; posts: PublicPost[] } | { ok: false; error?: string };

type State =
  | { status: "loading" }
  | { status: "ready"; boards: PublicBoard[]; posts: PublicPost[] }
  | { status: "error"; message: string };

async function readJson<T>(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json()) as T;
  if (!response.ok) throw new Error("데이터를 불러오지 못했습니다.");
  return data;
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function postDetailHref(id: string) {
  return `/explore/post/?id=${encodeURIComponent(id)}`;
}

export function ExploreCategoryClient({ categorySlug }: { categorySlug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const category = getEquipmentCategory(categorySlug);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [boardsData, postsData] = await Promise.all([
          readJson<BoardsResponse>("/api/public/boards"),
          readJson<PostsResponse>(`/api/public/posts?category=${encodeURIComponent(categorySlug)}&limit=30`),
        ]);

        if (!boardsData.ok) throw new Error(boardsData.error ?? "게시판 목록을 불러오지 못했습니다.");
        if (!postsData.ok) throw new Error(postsData.error ?? "게시글 목록을 불러오지 못했습니다.");

        const boards = boardsData.boards.filter((board) => board.category === categorySlug);
        if (mounted) setState({ status: "ready", boards, posts: postsData.posts });
      } catch (error) {
        if (!mounted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "데이터를 불러오지 못했습니다." });
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [categorySlug]);

  if (!category) {
    return (
      <Card className="space-y-3 p-6">
        <h2 className="text-xl font-bold">알 수 없는 카테고리입니다.</h2>
        <Link className="text-sm font-bold text-orange-600" href="/explore/">장비 둘러보기로 돌아가기</Link>
      </Card>
    );
  }

  if (state.status === "loading") {
    return <Card className="p-6 text-sm text-text-secondary">{category.label} 게시판과 게시글을 불러오는 중입니다...</Card>;
  }

  if (state.status === "error") {
    return (
      <Card className="space-y-3 p-6">
        <h2 className="text-xl font-bold">카테고리 데이터를 불러오지 못했습니다.</h2>
        <p className="text-sm leading-6 text-text-secondary">{state.message}</p>
      </Card>
    );
  }

  const boardsBySlug = new Map(state.boards.map((board) => [board.slug, board]));
  const sortedBoards = [...state.boards].sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug));

  return (
    <div className="space-y-8">
      <Card variant="dark" className="p-5">
        <p className="text-sm text-zinc-300">Category Accent</p>
        <h2 className="mt-1 text-2xl font-bold">{category.accent}</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-300">카테고리와 게시판은 D1 데이터베이스 기준으로 표시됩니다.</p>
      </Card>

      <section>
        <SectionHeader title="게시판" description="운영자가 관리하는 공개 게시판 목록입니다." />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sortedBoards.map((board) => (
            <Link key={board.id} href={`/explore/${categorySlug}/${board.slug}/`}>
              <Card className="h-full space-y-2 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <Badge label={board.type} tone={board.type === "trade" ? "orange" : "muted"} />
                  <span className="text-xs text-text-secondary">{board.post_count} posts</span>
                </div>
                <h2 className="text-lg font-bold">{board.title}</h2>
                <p className="text-sm leading-6 text-text-secondary">{board.description ?? "게시판 설명이 없습니다."}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="전체글" description="이 카테고리의 공개 게시글입니다." />
        {state.posts.length === 0 ? <Card className="mt-4 p-5 text-sm text-text-secondary">아직 공개된 게시글이 없습니다.</Card> : null}
        <div className="mt-4 space-y-3">
          {state.posts.map((post) => {
            const board = boardsBySlug.get(post.board_slug);
            return (
              <Link key={post.id} href={postDetailHref(post.id)}>
                <Card className="space-y-3 p-5 transition hover:-translate-y-0.5 hover:shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary">
                    <Badge label={post.board_title} tone={board?.type === "trade" ? "orange" : "muted"} />
                    <span>{post.author_nickname ?? "maniac"}</span>
                    <span>·</span>
                    <span>{formatDate(post.created_at)}</span>
                    <span>·</span>
                    <span>{post.comment_count} comments</span>
                  </div>
                  <h2 className="text-xl font-black tracking-[-0.04em]">{post.title}</h2>
                  <p className="line-clamp-2 text-sm leading-6 text-text-secondary">{excerptFromHtml(post.body)}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
