"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { sanitizePostHtml } from "@/features/boards/utils/html";

type PublicPost = {
  id: string;
  board_id: string;
  board_slug: string;
  board_title: string;
  board_description: string | null;
  board_type: string;
  category: string;
  title: string;
  body: string;
  author_nickname: string | null;
  created_at: number;
  updated_at: number;
};

type PublicComment = {
  id: string;
  body: string;
  author_nickname: string | null;
  created_at: number;
};

type PostDetailResponse =
  | { ok: true; post: PublicPost; comments: PublicComment[] }
  | { ok: false; error?: string };

type State =
  | { status: "loading" }
  | { status: "ready"; post: PublicPost; comments: PublicComment[] }
  | { status: "error"; message: string };

async function readPost(id: string) {
  const response = await fetch(`/api/public/posts/${encodeURIComponent(id)}`, { cache: "no-store" });
  const data = (await response.json()) as PostDetailResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.ok === false ? data.error ?? "게시글을 불러오지 못했습니다." : "게시글을 불러오지 못했습니다.");
  }

  return data;
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

export function PublicPostDetailClient({ id }: { id: string }) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await readPost(id);
        if (mounted) setState({ status: "ready", post: data.post, comments: data.comments });
      } catch (error) {
        if (!mounted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "게시글을 불러오지 못했습니다." });
      }
    }

    if (!id) {
      setState({ status: "error", message: "게시글 id가 필요합니다." });
      return;
    }

    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (state.status === "loading") {
    return <Card className="p-6 text-sm text-text-secondary">게시글을 불러오는 중입니다...</Card>;
  }

  if (state.status === "error") {
    return (
      <Card className="space-y-3 p-6">
        <h1 className="text-xl font-bold">게시글을 불러오지 못했습니다.</h1>
        <p className="text-sm leading-6 text-text-secondary">{state.message}</p>
      </Card>
    );
  }

  const { post, comments } = state;

  return (
    <article className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="min-w-0 space-y-5">
        <Card className="space-y-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-secondary">
            <Badge label={post.board_title} tone={post.board_type === "trade" ? "orange" : "muted"} />
            <span>{post.author_nickname ?? "maniac"}</span>
            <span>·</span>
            <span>{formatDate(post.created_at)}</span>
            <span>·</span>
            <span>{comments.length} comments</span>
          </div>

          <div>
            <h1 className="text-3xl font-black tracking-[-0.05em] sm:text-5xl">{post.title}</h1>
          </div>

          <div
            className="post-body text-sm leading-7 text-text-secondary sm:text-base sm:leading-8 [&_a]:font-bold [&_a]:text-garage-orange [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-garage-orange [&_blockquote]:bg-surface [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-2xl [&_h2]:font-black [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-2xl [&_li]:ml-5 [&_li]:list-disc [&_p]:my-3"
            dangerouslySetInnerHTML={{ __html: sanitizePostHtml(post.body) }}
          />
        </Card>

        <Card className="space-y-4 p-5 sm:p-6">
          <h2 className="text-xl font-black tracking-[-0.04em]">댓글</h2>
          {comments.length === 0 ? <p className="text-sm text-text-secondary">아직 공개된 댓글이 없습니다.</p> : null}
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-border bg-background p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                  <span>{comment.author_nickname ?? "maniac"}</span>
                  <span>·</span>
                  <span>{formatDate(comment.created_at)}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-text-secondary">{comment.body}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <aside className="min-w-0 space-y-3">
        <Card variant="dark" className="p-5 sm:p-6">
          <p className="text-sm text-zinc-300">게시판</p>
          <h2 className="mt-1 text-xl font-bold">{post.board_title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{post.board_description ?? "게시판 설명이 없습니다."}</p>
        </Card>
        <Card className="p-5 sm:p-6">
          <p className="text-sm font-bold">바로가기</p>
          <Link className="mt-2 inline-flex text-sm font-black text-orange-600" href={`/explore/${post.category}/${post.board_slug}/`}>
            게시판으로 돌아가기
          </Link>
        </Card>
      </aside>
    </article>
  );
}
