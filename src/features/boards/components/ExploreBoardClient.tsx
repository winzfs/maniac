"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { getEquipmentCategory } from "@/shared/data/equipment-categories";
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
  return `/explore/post/?id=${encodeURIComponent(id)}`;
}

function getLocalBoard(categorySlug: string, boardSlug: string): LocalBoard | null {
  const category = getEquipmentCategory(categorySlug);
  const board = category?.boards.find((item) => item.slug === boardSlug);
  return board ? { slug: board.slug, title: board.title, category: categorySlug, type: board.type, description: board.description } : null;
}

function LoadingList() {
  return (
    <div className="grid gap-2">
      {[0, 1, 2].map((item) => (
        <Card key={item} className="space-y-3 p-4">
          <div className="h-6 w-40 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-6 w-4/5 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-4 w-full animate-pulse rounded-full bg-zinc-100" />
        </Card>
      ))}
    </div>
  );
}

function PostListRow({ post }: { post: PublicPost }) {
  return (
    <Card className="p-0 transition hover:-translate-y-0.5 hover:shadow-sm">
      <div className="p-4 md:grid md:grid-cols-[minmax(0,1fr)_9rem_5rem_4.5rem] md:items-center md:gap-3 md:px-4 md:py-3">
        <div className="flex min-w-0 flex-nowrap items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-1 text-xs text-text-secondary md:contents md:overflow-visible md:pb-0">
          <div className="shrink-0 md:mt-0"><UserActionMenu userId={post.author_id} nickname={post.author_nickname} compact align="right" /></div>
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

export function ExploreBoardClient({ categorySlug, boardSlug }: { categorySlug: string; boardSlug: string }) {
  const board = useMemo(() => getLocalBoard(categorySlug, boardSlug), [categorySlug, boardSlug]);
  const [state, setState] = useState<State>({ status: "loading", posts: [] });
  const writeHref = `/explore/${categorySlug}/${boardSlug}/write/`;

  useEffect(() => {
    let mounted = true;
    setState((current) => ({ status: "loading", posts: current.posts }));

    async function load() {
      try {
        const postsData = await readJson<PostsResponse>(`/api/public/posts?board=${encodeURIComponent(boardSlug)}&limit=30`);
        if (!postsData.ok) throw new Error(postsData.error ?? "게시글 목록을 불러오지 못했습니다.");
        if (mounted) setState({ status: "ready", posts: postsData.posts });
      } catch (error) {
        if (!mounted) return;
        setState((current) => ({ status: "error", posts: current.posts, message: error instanceof Error ? error.message : "게시글 목록을 불러오지 못했습니다." }));
      }
    }

    load();
    return () => { mounted = false; };
  }, [boardSlug]);

  if (!board) return <Card className="space-y-3 p-6"><h2 className="text-xl font-bold">게시판을 찾을 수 없습니다.</h2><Link className="text-sm font-bold text-orange-600" href={`/explore/${categorySlug}/`}>카테고리로 돌아가기</Link></Card>;

  return (
    <div className="space-y-5 lg:space-y-6">
      <section className="rounded-[1.5rem] border border-border bg-surface px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:px-6">
        <div>
          <div className="flex items-center gap-2"><Badge label={board.title} tone={board.type === "review" ? "lime" : board.type === "trade" ? "orange" : "muted"} /><span className="text-xs font-bold text-text-secondary">{state.status === "loading" && state.posts.length === 0 ? "불러오는 중" : `${state.posts.length} posts`}</span></div>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.06em] sm:text-4xl">{board.title}</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">{board.description}</p>
        </div>
        <Link href={writeHref} className="mt-4 hidden shrink-0 sm:mt-0 sm:block"><Button>글쓰기</Button></Link>
      </section>

      <section className="space-y-3">
        {state.status === "error" ? <Card className="space-y-5 p-6 sm:p-7"><p className="text-sm leading-6 text-text-secondary">{state.message}</p><Link href={writeHref}><Button>글쓰기</Button></Link></Card> : null}
        {state.status === "loading" && state.posts.length === 0 ? <LoadingList /> : null}
        {state.status === "ready" && state.posts.length === 0 ? <Card className="space-y-5 p-6 sm:p-7"><div><h3 className="text-lg font-bold">아직 공개된 게시글이 없습니다.</h3><p className="mt-3 text-sm leading-6 text-text-secondary">이 게시판의 첫 글을 작성해 보세요.</p></div><Link href={writeHref}><Button>첫 글 작성하기</Button></Link></Card> : null}

        <div className="hidden rounded-2xl bg-zinc-100 px-4 py-2 text-xs font-black text-text-secondary md:grid md:grid-cols-[minmax(0,1fr)_9rem_5rem_4.5rem] md:gap-3">
          <span>제목</span><span>작성자</span><span className="text-center">댓글</span><span className="text-right">날짜</span>
        </div>

        {state.posts.length > 0 ? (
          <div className={`grid gap-2 ${state.status === "loading" ? "opacity-60" : ""}`}>
            {state.posts.map((post) => <PostListRow key={post.id} post={post} />)}
          </div>
        ) : null}
      </section>

      <Link href={writeHref} className="fixed bottom-5 right-5 z-20 inline-flex rounded-full bg-garage-orange px-5 py-3 text-sm font-black text-white shadow-xl sm:hidden">+ 글쓰기</Link>
    </div>
  );
}
