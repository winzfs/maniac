"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
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
  | { status: "ready"; board: PublicBoard | null; posts: PublicPost[]; postsError?: string }
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

export function ExploreBoardClient({ categorySlug, boardSlug }: { categorySlug: string; boardSlug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const writeHref = `/explore/${categorySlug}/${boardSlug}/write/`;

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const boardsData = await readJson<BoardsResponse>("/api/public/boards");
        if (!boardsData.ok) throw new Error(boardsData.error ?? "게시판 정보를 불러오지 못했습니다.");

        const board = boardsData.boards.find((item) => item.slug === boardSlug && item.category === categorySlug) ?? null;
        let posts: PublicPost[] = [];
        let postsError: string | undefined;

        try {
          const postsData = await readJson<PostsResponse>(`/api/public/posts?board=${encodeURIComponent(boardSlug)}&limit=30`);
          if (!postsData.ok) throw new Error(postsData.error ?? "게시글 목록을 불러오지 못했습니다.");
          posts = postsData.posts;
        } catch (error) {
          postsError = error instanceof Error ? error.message : "게시글 목록을 불러오지 못했습니다.";
        }

        if (mounted) setState({ status: "ready", board, posts, postsError });
      } catch (error) {
        if (!mounted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "데이터를 불러오지 못했습니다." });
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [boardSlug, categorySlug]);

  if (state.status === "loading") {
    return <Card className="p-6 text-sm text-text-secondary">게시판 데이터를 불러오는 중입니다...</Card>;
  }

  if (state.status === "error") {
    return (
      <Card className="space-y-3 p-6">
        <h2 className="text-xl font-bold">게시판 데이터를 불러오지 못했습니다.</h2>
        <p className="text-sm leading-6 text-text-secondary">{state.message}</p>
      </Card>
    );
  }

  if (!state.board) {
    return (
      <Card className="space-y-3 p-6">
        <h2 className="text-xl font-bold">게시판을 찾을 수 없습니다.</h2>
        <Link className="text-sm font-bold text-orange-600" href={`/explore/${categorySlug}/`}>카테고리로 돌아가기</Link>
      </Card>
    );
  }

  return (
    <div className="space-y-9 lg:space-y-12">
      <Card variant="dark" className="grid gap-6 p-7 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
        <div>
          <p className="text-sm text-zinc-300">게시판 상태</p>
          <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">{state.posts.length} posts</h2>
          <p className="mt-4 text-sm leading-6 text-zinc-300">{state.board.description ?? "게시판 설명이 없습니다."}</p>
        </div>
        <Link href={writeHref}>
          <Button className="w-full sm:w-auto">글쓰기</Button>
        </Link>
      </Card>

      <section>
        <SectionHeader title="게시글" description="D1 posts 테이블의 공개 게시글을 표시합니다." />
        {state.postsError ? (
          <Card className="mt-5 space-y-5 p-6 sm:p-7">
            <p className="text-sm leading-6 text-text-secondary">게시글 목록을 불러오지 못했습니다. 글쓰기는 계속 사용할 수 있습니다.</p>
            <Link href={writeHref}>
              <Button>글쓰기</Button>
            </Link>
          </Card>
        ) : null}
        {!state.postsError && state.posts.length === 0 ? (
          <Card className="mt-5 space-y-5 p-6 sm:p-7">
            <div>
              <h3 className="text-lg font-bold">아직 공개된 게시글이 없습니다.</h3>
              <p className="mt-3 text-sm leading-6 text-text-secondary">이 게시판의 첫 글을 작성해 보세요.</p>
            </div>
            <Link href={writeHref}>
              <Button>첫 글 작성하기</Button>
            </Link>
          </Card>
        ) : null}
        <div className="mt-5 space-y-4">
          {state.posts.map((post) => (
            <Link key={post.id} href={postDetailHref(post.id)} className="block">
              <Card className="space-y-4 p-7 transition hover:-translate-y-0.5 hover:shadow-sm sm:p-8">
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-text-secondary">
                  <span>{post.author_nickname ?? "maniac"}</span>
                  <span>·</span>
                  <span>{formatDate(post.created_at)}</span>
                  <span>·</span>
                  <span>{post.comment_count} comments</span>
                </div>
                <h2 className="text-xl font-black leading-snug tracking-[-0.04em] sm:text-2xl">{post.title}</h2>
                <p className="line-clamp-2 text-base leading-7 text-text-secondary">{excerptFromHtml(post.body)}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
