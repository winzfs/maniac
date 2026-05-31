"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { communityBoardTopics, getEquipmentCategory } from "@/shared/data/equipment-categories";
import { excerptFromHtml } from "@/features/boards/utils/html";
import { UserActionMenu } from "@/features/users/components/UserActionMenu";

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
  author_id: string;
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
  return type === "trade" ? "orange" : type === "review" ? "lime" : "muted";
}

function PostListRow({ post, boardType }: { post: PublicPost; boardType?: string }) {
  return (
    <Card className="p-0 transition hover:-translate-y-0.5 hover:shadow-sm">
      <div className="block p-4 md:grid md:grid-cols-[5.5rem_minmax(0,1fr)_9rem_5rem_4.5rem] md:items-center md:gap-3 md:px-4 md:py-3">
        <div className="mb-2 md:mb-0">
          <Badge label={post.board_title} tone={toneForType(boardType)} />
        </div>

        <Link href={postDetailHref(post.id)} className="block min-w-0">
          <h2 className="truncate text-lg font-black tracking-[-0.04em] text-text-primary transition hover:text-garage-orange md:text-base">{post.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-secondary md:hidden">{excerptFromHtml(post.body, 120)}</p>
        </Link>

        <div className="mt-3 md:mt-0 md:justify-self-start">
          <UserActionMenu userId={post.author_id} nickname={post.author_nickname} compact align="right" />
        </div>
        <p className="mt-2 text-xs font-bold text-text-secondary md:mt-0 md:text-center">댓글 {post.comment_count}</p>
        <p className="mt-1 text-xs font-bold text-text-secondary md:mt-0 md:text-right">{formatDate(post.created_at)}</p>
      </div>
    </Card>
  );
}

export function ExploreCategoryClient({ categorySlug }: { categorySlug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [activeType, setActiveType] = useState("all");
  const category = getEquipmentCategory(categorySlug);
  const writeHref = `/explore/${categorySlug}/write/`;

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

  const visibleTopics = useMemo(() => {
    if (state.status !== "ready") return communityBoardTopics;
    const boardTypes = new Set(state.boards.map((board) => board.type));
    return communityBoardTopics.filter((topic) => boardTypes.has(topic.slug));
  }, [state]);

  const filteredPosts = useMemo(() => {
    if (state.status !== "ready") return [];
    if (activeType === "all") return state.posts;
    return state.posts.filter((post) => state.boards.some((board) => board.slug === post.board_slug && board.type === activeType));
  }, [activeType, state]);

  if (!category) return <Card className="p-6 text-sm text-text-secondary">존재하지 않는 기어 카테고리입니다.</Card>;
  if (state.status === "loading") return <Card className="h-48 animate-pulse bg-zinc-100" />;
  if (state.status === "error") return <Card className="p-6 text-sm text-red-700">{state.message}</Card>;

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="rounded-[1.5rem] border border-border bg-surface px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Badge label={category.label} tone="muted" /><span className="text-xs font-bold text-text-secondary">{state.posts.length} posts</span></div>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.06em] sm:text-4xl">{category.label}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{category.description}</p>
        </div>
        <Link href={writeHref} className="mt-4 hidden shrink-0 sm:mt-0 sm:block"><Button>글쓰기</Button></Link>
      </section>

      <section className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button type="button" onClick={() => setActiveType("all")} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeType === "all" ? "bg-graphite text-white" : "bg-surface text-text-secondary"}`}>전체</button>
          {visibleTopics.map((topic) => (
            <button key={topic.slug} type="button" onClick={() => setActiveType(topic.slug)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeType === topic.slug ? "bg-graphite text-white" : "bg-surface text-text-secondary"}`}>{topic.shortLabel}</button>
          ))}
        </div>

        <div className="hidden rounded-2xl bg-zinc-100 px-4 py-2 text-xs font-black text-text-secondary md:grid md:grid-cols-[5.5rem_minmax(0,1fr)_9rem_5rem_4.5rem] md:gap-3">
          <span>말머리</span><span>제목</span><span>작성자</span><span className="text-center">댓글</span><span className="text-right">날짜</span>
        </div>

        <div className="grid gap-2">
          {filteredPosts.map((post) => {
            const boardType = state.boards.find((board) => board.slug === post.board_slug)?.type;
            return <PostListRow key={post.id} post={post} boardType={boardType} />;
          })}
        </div>

        {filteredPosts.length === 0 ? <Card className="p-6 text-sm text-text-secondary">아직 표시할 덕질 글이 없습니다.</Card> : null}
      </section>

      <Link href={writeHref} className="fixed bottom-5 right-5 z-20 inline-flex rounded-full bg-garage-orange px-5 py-3 text-sm font-black text-white shadow-xl sm:hidden">+ 글쓰기</Link>
    </div>
  );
}
