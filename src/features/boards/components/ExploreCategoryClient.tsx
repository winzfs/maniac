"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
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
        setState({ status: "error", message: error instanceof Error ? error.message : "데이터를 불러오지 못했습니다." });
      }
    }

    setActiveType("all");
    load();
    return () => {
      mounted = false;
    };
  }, [categorySlug]);

  const boardsBySlug = useMemo(() => {
    if (state.status !== "ready") return new Map<string, PublicBoard>();
    return new Map(state.boards.map((board) => [board.slug, board]));
  }, [state]);

  const filteredPosts = useMemo(() => {
    if (state.status !== "ready") return [];
    if (activeType === "all") return state.posts;
    return state.posts.filter((post) => boardsBySlug.get(post.board_slug)?.type === activeType);
  }, [activeType, boardsBySlug, state]);

  const typeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (state.status !== "ready") return counts;
    for (const post of state.posts) {
      const type = boardsBySlug.get(post.board_slug)?.type ?? "unknown";
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
    return counts;
  }, [boardsBySlug, state]);

  if (!category) {
    return (
      <Card className="space-y-2 p-4">
        <h2 className="text-lg font-bold">알 수 없는 카테고리입니다.</h2>
        <Link className="text-sm font-bold text-orange-600" href="/explore/">장비 둘러보기로 돌아가기</Link>
      </Card>
    );
  }

  if (state.status === "loading") {
    return <Card className="p-4 text-sm text-text-secondary">{category.label} 게시글을 불러오는 중입니다...</Card>;
  }

  if (state.status === "error") {
    return (
      <Card className="space-y-2 p-4">
        <h2 className="text-lg font-bold">카테고리 데이터를 불러오지 못했습니다.</h2>
        <p className="text-sm leading-6 text-text-secondary">{state.message}</p>
      </Card>
    );
  }

  const sortedBoards = [...state.boards].sort((a, b) => a.sort_order - b.sort_order || a.slug.localeCompare(b.slug));
  const activeBoard = activeType === "all" ? sortedBoards[0] : sortedBoards.find((board) => board.type === activeType) ?? sortedBoards[0];
  const writeHref = activeBoard ? `/explore/${categorySlug}/${activeBoard.slug}/write/` : `/explore/${categorySlug}/`;

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card variant="dark" className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[0.68rem] font-black uppercase tracking-[0.16em] text-lime-200">{category.shortLabel}</p>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.68rem] font-bold text-zinc-300">{state.posts.length} posts</span>
          </div>
          <h2 className="mt-1 text-xl font-black tracking-[-0.04em] sm:text-2xl">{category.label} 전체 글</h2>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-300 sm:text-sm sm:leading-6">게시판을 따로 찾아 들어가지 않고, 이 카테고리의 모든 글을 주제별로 필터링해서 볼 수 있습니다.</p>
        </div>
        <Link href={writeHref} className="sm:justify-self-end">
          <span className="inline-flex w-full items-center justify-center rounded-xl bg-white px-3 py-2 text-sm font-black text-zinc-950 sm:w-auto">글쓰기</span>
        </Link>
      </Card>

      <section className="rounded-card border border-border/80 bg-surface p-2.5 sm:p-3">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <h3 className="text-sm font-black">주제 필터</h3>
          <span className="text-[0.7rem] font-semibold text-text-secondary">좌우 스크롤</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button type="button" onClick={() => setActiveType("all")} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${activeType === "all" ? "border-graphite bg-graphite text-white" : "border-border bg-background text-text-secondary hover:text-text-primary"}`}>
            전체 <span className="opacity-70">{state.posts.length}</span>
          </button>
          {communityBoardTopics.map((topic) => (
            <button key={topic.slug} type="button" onClick={() => setActiveType(topic.slug)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${activeType === topic.slug ? "border-graphite bg-graphite text-white" : "border-border bg-background text-text-secondary hover:text-text-primary"}`}>
              {topic.shortLabel} <span className="opacity-70">{typeCounts.get(topic.slug) ?? 0}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-card border border-border/80 bg-white/40 p-2.5 sm:p-3">
        <div className="mb-2 flex items-end justify-between gap-3 px-1">
          <div>
            <h3 className="text-base font-black tracking-[-0.03em]">{activeType === "all" ? "전체글" : communityBoardTopics.find((topic) => topic.slug === activeType)?.title ?? "게시글"}</h3>
            <p className="text-xs text-text-secondary">{category.label} 공개 게시글</p>
          </div>
          <span className="text-xs font-bold text-text-secondary">{filteredPosts.length}개</span>
        </div>
        {filteredPosts.length === 0 ? <Card className="p-3 text-sm text-text-secondary">아직 이 조건에 맞는 공개 게시글이 없습니다.</Card> : null}
        <div className="space-y-2">
          {filteredPosts.map((post) => {
            const board = boardsBySlug.get(post.board_slug);
            return (
              <Link key={post.id} href={postDetailHref(post.id)} className="block">
                <Card className="space-y-2 p-3 transition hover:-translate-y-0.5 hover:shadow-sm sm:p-4">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.72rem] text-text-secondary">
                    <Badge label={board?.title ?? post.board_title} tone={toneForType(board?.type)} />
                    <span>{post.author_nickname ?? "maniac"}</span>
                    <span>·</span>
                    <span>{formatDate(post.created_at)}</span>
                    <span>·</span>
                    <span>{post.comment_count} 댓글</span>
                  </div>
                  <h2 className="line-clamp-1 text-[1rem] font-black leading-snug tracking-[-0.04em] sm:text-xl">{post.title}</h2>
                  <p className="line-clamp-1 text-xs leading-5 text-text-secondary sm:line-clamp-2 sm:text-sm sm:leading-6">{excerptFromHtml(post.body)}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
