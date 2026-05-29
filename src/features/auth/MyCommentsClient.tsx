"use client";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import Link from "next/link";
import { useEffect, useState } from "react";

type MyComment = {
  id: string;
  body: string;
  post_id: string;
  post_title: string;
  board_slug: string;
  board_title: string;
  created_at: number;
  updated_at: number;
};

type MyCommentsResponse = {
  ok?: boolean;
  comments?: MyComment[];
  deletedId?: string;
  error?: string;
};

type State =
  | { status: "loading" }
  | { status: "success"; comments: MyComment[]; message?: string }
  | { status: "login-required"; message: string }
  | { status: "error"; message: string };

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function postHref(comment: MyComment) {
  return `/explore/post/?id=${encodeURIComponent(comment.post_id)}`;
}

function LoginPrompt({ message }: { message: string }) {
  return (
    <Card className="space-y-4 p-6 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">로그인이 필요합니다</h2>
        <p className="text-sm text-text-secondary">{message || "내 댓글을 보려면 먼저 로그인해 주세요."}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/login/"><Button>로그인</Button></Link>
        <Link href="/signup/"><Button variant="secondary">회원가입</Button></Link>
      </div>
    </Card>
  );
}

export function MyCommentsClient() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [deletingId, setDeletingId] = useState("");

  async function loadComments() {
    try {
      const response = await fetch("/api/me/comments", { cache: "no-store", credentials: "same-origin" });
      const data = (await response.json().catch(() => null)) as MyCommentsResponse | null;

      if (response.status === 401) {
        setState({ status: "login-required", message: data?.error ?? "내 댓글을 보려면 먼저 로그인해 주세요." });
        return;
      }

      if (!response.ok || !data?.ok) throw new Error(data?.error ?? "내 댓글을 불러오지 못했습니다.");
      setState({ status: "success", comments: data.comments ?? [] });
    } catch (error) {
      setState({ status: "error", message: error instanceof Error ? error.message : "내 댓글을 불러오지 못했습니다." });
    }
  }

  useEffect(() => {
    void loadComments();
  }, []);

  async function deleteComment(comment: MyComment) {
    const confirmed = window.confirm("이 댓글을 삭제할까요?");
    if (!confirmed || state.status !== "success") return;

    setDeletingId(comment.id);
    try {
      const response = await fetch(`/api/me/comments/${comment.id}`, { method: "DELETE", credentials: "same-origin" });
      const data = (await response.json().catch(() => null)) as MyCommentsResponse | null;
      if (!response.ok || !data?.ok) throw new Error(data?.error ?? "댓글 삭제에 실패했습니다.");

      setState({
        status: "success",
        comments: state.comments.filter((item) => item.id !== comment.id),
        message: "댓글이 삭제되었습니다.",
      });
    } catch (error) {
      setState({ ...state, message: error instanceof Error ? error.message : "댓글 삭제에 실패했습니다." });
    } finally {
      setDeletingId("");
    }
  }

  if (state.status === "loading") {
    return (
      <div className="grid gap-4">
        {[0, 1, 2].map((item) => <Card key={item} className="h-28 animate-pulse p-5" />)}
      </div>
    );
  }

  if (state.status === "login-required") return <LoginPrompt message={state.message} />;
  if (state.status === "error") return <Card className="p-6 text-sm text-text-secondary">{state.message}</Card>;

  if (state.comments.length === 0) {
    return (
      <Card className="space-y-4 p-6 text-center">
        <h2 className="text-xl font-bold">아직 작성한 댓글이 없습니다.</h2>
        <p className="text-sm text-text-secondary">게시글에 댓글을 남기면 이곳에서 확인할 수 있습니다.</p>
        <Link href="/explore/"><Button>게시판 둘러보기</Button></Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {state.message ? <Card className="p-4 text-sm text-text-secondary">{state.message}</Card> : null}
      {state.comments.map((comment) => (
        <Card key={comment.id} className="space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
            <span className="rounded-full bg-background px-3 py-1 font-semibold text-text-primary">{comment.board_title}</span>
            <span className="font-medium">{formatDate(comment.created_at)}</span>
          </div>

          <p className="rounded-2xl bg-background p-4 text-sm leading-6 text-text-primary">{comment.body}</p>

          <div className="space-y-1">
            <p className="text-xs text-text-secondary">댓글이 달린 글</p>
            <Link href={postHref(comment)} className="block text-lg font-black leading-tight hover:text-garage-orange">{comment.post_title}</Link>
          </div>

          <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-text-secondary">댓글 ID {comment.id.slice(0, 8)}</span>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
              <Link href={postHref(comment)}><Button className="w-full sm:w-auto" variant="secondary">게시글 보기</Button></Link>
              <Button className="w-full sm:w-auto" variant="ghost" disabled={deletingId === comment.id} onClick={() => deleteComment(comment)}>{deletingId === comment.id ? "삭제 중..." : "댓글 삭제"}</Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
