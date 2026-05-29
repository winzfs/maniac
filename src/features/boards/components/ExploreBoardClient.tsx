"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";

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

function excerpt(body: string) {
  return body.length > 120 ? `${body.slice(0, 120)}...` : body;
}

function postDetailHref(id: string) {
  return `/explore/post/?id=${encodeURIComponent(id)}`;
}

export function ExploreBoardClient({ categorySlug, boardSlug }: { categorySlug: string; boardSlug: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

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
    <div className="space-y-8 lg:space-y-12">
      <Card variant="dark" className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <p className="text-sm text-zinc-300">게시판 상태</p>
          <h2 className="mt-1 text-2xl font-bold">{state.posts.length} posts</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{state.board.description ?? "게시판 설명이 없습니다."}</p>
        </div>
        <Link href={`/explore/${categorySlug}/${boardSlug}/write/`}>
          <Button className="w-full sm:w-auto">글쓰기</Button>
        </Link>
      </Card>

      <section>
        <SectionHeader title="게시글" description="D1 posts 테이블의 공개 게시글을 표시합니다." />
        {state.postsError ? <Card className="mt-4 p-5 text-sm text-text-secondary">게시글 목록을 불러오지 못했습니다. 글쓰기는 계속 사용할 수 있습니다.</Card> : null}
        {!state.postsError && state.posts.length === 0 ? <Card className="mt-4 p-5 text-sm text-text-secondary">아직 공개된 게시글이 없습니다.</Card> : null}
        <div className="mt-4 space-y-3">
          {state.posts.map((post) => (
            <Link key={post.id} href={postDetailHref(post.id)}>
              <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-sm sm:p-5">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    <span>{post.author_nickname ?? "maniac"}</span>
                    <span>·</span>
                    <span>{formatDate(post.created_at)}</span>
                    <span>·</span>
                    <span>{post.comment_count} comments</span>
                  </div>
                  <h2 className="text-lg font-bold">{post.title}</h2>
                  <p className="text-sm leading-6 text-text-secondary">{excerpt(post.body)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
