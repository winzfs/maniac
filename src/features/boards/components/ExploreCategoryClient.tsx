"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { communityBoardTopics, getEquipmentCategory } from "@/shared/data/equipment-categories";
import { excerptFromHtml } from "@/features/boards/utils/html";
import { UserActionMenu } from "@/features/users/components/UserActionMenu";

type LocalBoard = {
  slug: string;
  title: string;
  category: string;
  type: string;
  description: string;
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

type PostsResponse = { ok: true; posts: PublicPost[] } | { ok: false; error?: string };

type State =
  | { status: "loading"; posts: PublicPost[] }
  | { status: "ready"; posts: PublicPost[] }
  | { status: "error"; posts: PublicPost[]; message: string };

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
  return `/posts/${encodeURIComponent(id)}/`;
}

function localBoards(categorySlug: string): LocalBoard[] {
  const category = getEquipmentCategory(categorySlug);
  return (category?.boards ?? []).map((board) => ({
    slug: board.slug,
    title: board.title,
    category: categorySlug,
    type: board.type,
    description: board.description,
  }));
}

function toneForType(type?: string) {
  return type === "trade" ? "orange" : type === "review" ? "lime" : "muted";
}

function LoadingList() {
  return (
    <div className="grid gap-2">
      {[0, 1, 2].map((item) => (
        <Card key={item} className="space-y-3 p-4">
          <div className="h-6 w-44 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-6 w-4/5 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-4 w-full animate-pulse rounded-full bg-zinc-100" />
        </Card>
      ))}
    </div>
  );
}

function PostListRow({ post, boardType }: { post: PublicPost; boardType?: string }) {
  return (
    <Card className="p-0 transition hover:-translate-y-0.5 hover:shadow-sm">
      <div className="p-4 md:grid md:grid-cols-[5.5rem_minmax(0,1fr)_9rem_5rem_4.5rem] md:items-center md:gap-3 md:px-4 md:py-3">
        <div className="flex min-w-0 flex-nowrap items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 text-xs text-text-secondary md:contents md:overflow-visible md:pb-0">
          <div className="shrink-0 md:mb-0">
            <Badge label={post.board_title} tone={toneForType(boardType)} />
          </div>
          <div className="shrink-0 md:mt-0 md:justify-self-start">
            <UserActionMenu userId={post.author_id} nickname={post.author_nickname} compact align="right" />
          </div>
          <span className="shrink-0 font-bold md:hidden">{formatDate(post.created_at)}</span>
          <span className="shrink-0 font-bold md:hidden">· 댓글 {post.comment_count}</span>
          <p className="hidden text-xs font-bold text-text-secondary md:block md:text-center">댓글 {post.comment_count}</p>
          <p className="hidden text-xs font-bold text-text-secondary md:block md:text-right">{formatDate(post.created_at)}</p>
        </div>

        <Link href={postDetailHref(post.id)} className="mt-3 block min-w-0 md:mt-0">
          <h2 className="truncate text-lg font-black tracking-[-0.04em] text-text-primary transition hover:text-garage-orange md:text-base">{post.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm leading-6 text-text-secondary md:hidden">{excerptFromHtml(post.body, 120)}</p>
        </Link>
      </div>
    </Card>
  );
}

export function ExploreCategoryClient({ categorySlug }: { categorySlug: string }) {
  const boards = useMemo(() => localBoards(categorySlug), [categorySlug]);
  const [state, setState] = useState<State>({ status: "loading", posts: [] });
  const [activeType, setActiveType] = useState("all");
  const category = getEquipmentCategory(categorySlug);
  const writeHref = `/explore/${categorySlug}/write/`;

  useEffect(() => {
    let mounted = true;
    setState((current) => ({ status: "loading", posts: current.posts }));

    async function load() {
      try {
        const postsData = await readJson<PostsResponse>(`/api/public/posts?category=${encodeURIComponent(categorySlug)}&limit=50`);
        if (!postsData.ok) throw new Error(postsData.error ?? "게시글 목록을 불러오지 못했습니다.");
        if (mounted) setState({ status: "ready", posts: postsData.posts });
      } catch (error) {
        if (!mounted) return;
        setState((current) => ({ status: "error", posts: current.posts, message: error instanceof Error ? error.message : "카테고리 정보를 불러오지 못했습니다." }));
      }
    }

    load();
    return () => { mounted = false; };
  }, [categorySlug]);

  const visibleTopics = useMemo(() => {
    const boardTypes = new Set(boards.map((board) => board.type));
    return communityBoardTopics.filter((topic) => boardTypes.has(topic.slug));
  }, [boards]);

  const filteredPosts = useMemo(() => {
    if (activeType === "all") return state.posts;
    return state.posts.filter((post) => boards.some((board) => board.slug === post.board_slug && board.type === activeType));
  }, [activeType, boards, state.posts]);

  if (!category) return <Card className="p-6 text-sm text-text-secondary">존재하지 않는 기어 카테고리입니다.</Card>;

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="rounded-[1.5rem] border border-border bg-surface px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Badge label={category.label} tone="muted" /><span className="text-xs font-bold text-text-secondary">{state.status === "loading" && state.posts.length === 0 ? "불러오는 중" : `${state.posts.length} posts`}</span></div>
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

        {state.status === "loading" && state.posts.length === 0 ? <LoadingList /> : null}
        {state.status === "error" ? <Card className="p-6 text-sm text-red-700">{state.message}</Card> : null}

        {state.posts.length > 0 ? (
          <div className={`grid gap-2 ${state.status === "loading" ? "opacity-60" : ""}`}>
            {filteredPosts.map((post) => {
              const boardType = boards.find((board) => board.slug === post.board_slug)?.type;
              return <PostListRow key={post.id} post={post} boardType={boardType} />;
            })}
          </div>
        ) : null}

        {state.status === "ready" && filteredPosts.length === 0 ? <Card className="p-6 text-sm text-text-secondary">아직 표시할 덕질 글이 없습니다.</Card> : null}
      </section>

      <Link href={writeHref} className="fixed bottom-5 right-5 z-20 inline-flex rounded-full bg-garage-orange px-5 py-3 text-sm font-black text-white shadow-xl sm:hidden">+ 글쓰기</Link>
    </div>
  );
}
