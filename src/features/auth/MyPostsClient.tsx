"use client";

import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";

type MyPost = {
  id: string;
  title: string;
  body: string;
  board_slug: string;
  board_title: string;
  category: string;
  status: string;
  visibility: string;
  moderation_status: string;
  created_at: number;
  updated_at: number;
  comment_count: number;
};

type MyPostsResponse = {
  ok?: boolean;
  posts?: MyPost[];
  error?: string;
};

type State =
  | { status: "loading" }
  | { status: "success"; posts: MyPost[] }
  | { status: "login-required"; message: string }
  | { status: "error"; message: string };

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function postHref(post: MyPost) {
  return `/explore/post/?id=${encodeURIComponent(post.id)}`;
}

function editHref(post: MyPost) {
  return `/me/posts/edit/?id=${encodeURIComponent(post.id)}`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function LoginPrompt({ message }: { message: string }) {
  return (
    <Card className="space-y-4 p-6 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">로그인이 필요합니다</h2>
        <p className="text-sm text-text-secondary">{message || "내 작성글을 보려면 먼저 로그인해 주세요."}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/login/"><Button>로그인</Button></Link>
        <Link href="/signup/"><Button variant="secondary">회원가입</Button></Link>
      </div>
    </Card>
  );
}

export function MyPostsClient() {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function loadPosts() {
      try {
        const response = await fetch("/api/me/posts", { cache: "no-store", credentials: "same-origin" });
        const data = (await response.json().catch(() => null)) as MyPostsResponse | null;

        if (response.status === 401) {
          if (mounted) setState({ status: "login-required", message: data?.error ?? "내 작성글을 보려면 먼저 로그인해 주세요." });
          return;
        }

        if (!response.ok || !data?.ok) throw new Error(data?.error ?? "내 작성글을 불러오지 못했습니다.");
        if (mounted) setState({ status: "success", posts: data.posts ?? [] });
      } catch (error) {
        if (mounted) setState({ status: "error", message: error instanceof Error ? error.message : "내 작성글을 불러오지 못했습니다." });
      }
    }

    void loadPosts();

    return () => {
      mounted = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <div className="grid gap-3">
        {[0, 1, 2].map((item) => <Card key={item} className="h-28 animate-pulse p-5" />)}
      </div>
    );
  }

  if (state.status === "login-required") return <LoginPrompt message={state.message} />;

  if (state.status === "error") {
    return <Card className="p-6 text-sm text-text-secondary">{state.message}</Card>;
  }

  if (state.posts.length === 0) {
    return (
      <Card className="space-y-4 p-6 text-center">
        <h2 className="text-xl font-bold">아직 작성한 글이 없습니다.</h2>
        <p className="text-sm text-text-secondary">게시판에 첫 글을 작성하면 이곳에서 관리할 수 있습니다.</p>
        <Link href="/explore/"><Button>게시판 둘러보기</Button></Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-3">
      {state.posts.map((post) => (
        <Card key={post.id} className="space-y-3 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge label={post.board_title} tone="muted" />
            <Badge label={post.visibility} tone="graphite" />
            <span className="text-xs text-text-secondary">{formatDate(post.created_at)}</span>
          </div>
          <div className="space-y-1">
            <Link href={postHref(post)} className="text-xl font-bold hover:text-garage-orange">{post.title}</Link>
            <p className="line-clamp-2 text-sm leading-6 text-text-secondary">{stripHtml(post.body) || "본문 미리보기가 없습니다."}</p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
            <span>댓글 {post.comment_count} · 상태 {post.status} · 검수 {post.moderation_status}</span>
            <div className="flex gap-2">
              <Link href={editHref(post)}><Button variant="secondary">수정</Button></Link>
              <Link href={postHref(post)}><Button variant="ghost">상세 보기</Button></Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
