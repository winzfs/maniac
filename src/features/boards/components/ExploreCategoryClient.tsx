"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { communityBoardTopics, getEquipmentCategory } from "@/shared/data/equipment-categories";
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
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function postDetailHref(id: string) {
  return `/explore/post/?id=${encodeURIComponent(id)}`;
}

function toneForType(type?: string) {
  return type === "trade" ? "orange" : "muted";
}

export function ExploreCategoryClient({ categorySlug }: { categorySlug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [activeType, setActiveType] = useState("all");
  const category = getEquipmentCategory(categorySlug);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [boardsData, postsData] = await Promise.all([
          readJson<BoardsResponse>("/api/public/boards"),
          readJson<PostsResponse>(`/api/public/posts?category=${encodeURIComponent(categorySlug)}&limit=50`),
        ]);

        if (!boardsData.ok) throw new Error(boardsData.error ?? "게시판 목록을 불러오지 못했습니다.");
        if (!postsData.ok) throw new Error(postsData.error ?? "게시글 목록을 불러오지 못했습니다.");

        const boards = boardsData.boards.filter((board) => board.category === categorySlug);
        if (mounted) setState({ status: "ready", boards, posts: postsData.posts });
      } catch (error) {
        if (!mounted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "카테고리 정보를 불러오지 못했습니다." });
      }
    }

    load();
    return () => { mounted = false; };
  }, [categorySlug]);

  const filteredPosts = useMemo(() => {
    if (state.status !== "ready") return [];
    if (activeType === "all") return state.posts;
    return state.posts.filter((post) => state.boards.some((board) => board.slug === post.board_slug && board.type === activeType));
  }, [activeType, state]);

  if (!category) {
    return <Card className="p-6 text-sm text-text-secondary">존재하지 않는 장비 카테고리입니다.</Card>;
  }

  if (state.status === "loading") {
    return <Card className="h-48 animate-pulse bg-zinc-100" />;
  }

  if (state.status === "error") {
    return <Card className="p-6 text-sm text-red-700">{state.message}</Card>;
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      <section className="rounded-[2rem] border border-border bg-surface p-5 sm:p-6">
        <Badge label={category.label} tone="muted" />
        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] sm:text-5xl">{category.label}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">{category.description}</p>
      </section>

      <section className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setActiveType("all")} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeType === "all" ? "bg-graphite text-white" : "bg-surface text-text-secondary"}`}>전체</button>
          {communityBoardTopics.map((topic) => (
            <button key={topic.slug} type="button" onClick={() => setActiveType(topic.slug)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeType === topic.slug ? "bg-graphite text-white" : "bg-surface text-text-secondary"}`}>{topic.shortLabel}</button>
          ))}
        </div>

        <div className="grid gap-3">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={postDetailHref(post.id)}>
              <Card className="space-y-2 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge label={post.board_title} tone={toneForType(state.boards.find((board) => board.slug === post.board_slug)?.type)} />
                  <span className="text-xs font-semibold text-text-secondary">{formatDate(post.created_at)} · 댓글 {post.comment_count}</span>
                </div>
                <h2 className="text-xl font-black tracking-[-0.04em]">{post.title}</h2>
                <p className="line-clamp-2 text-sm leading-6 text-text-secondary">{excerptFromHtml(post.body, 140)}</p>
                <p className="text-xs font-semibold text-text-secondary">by {post.author_nickname ?? "MANIAC"}</p>
              </Card>
            </Link>
          ))}
        </div>

        {filteredPosts.length === 0 ? <Card className="p-6 text-sm text-text-secondary">아직 표시할 게시글이 없습니다.</Card> : null}
      </section>
    </div>
  );
}
