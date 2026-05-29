"use client";

import { SimpleHtmlEditor } from "@/features/editor/SimpleHtmlEditor";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type MyPost = {
  id: string;
  title: string;
  body: string;
  board_title: string;
  board_slug: string;
  category: string;
  status: string;
  visibility: string;
  moderation_status: string;
  created_at: number;
  updated_at: number;
  comment_count: number;
};

type ApiResponse = {
  ok?: boolean;
  post?: MyPost;
  nextPath?: string;
  deletedId?: string;
  error?: string;
};

type State =
  | { status: "loading" }
  | { status: "ready"; post: MyPost; message?: string }
  | { status: "saving"; post: MyPost }
  | { status: "deleting"; post: MyPost }
  | { status: "login-required"; message: string }
  | { status: "error"; message: string };

async function readApi(response: Response) {
  const data = (await response.json().catch(() => null)) as ApiResponse | null;
  if (response.status === 401) {
    const error = new Error(data?.error ?? "로그인이 필요합니다.");
    error.name = "AuthRequiredError";
    throw error;
  }
  if (!response.ok || !data?.ok) throw new Error(data?.error ?? "요청에 실패했습니다.");
  return data;
}

function postHref(id: string) {
  return `/explore/post/?id=${encodeURIComponent(id)}`;
}

function LoginPrompt({ message }: { message: string }) {
  return (
    <Card className="space-y-4 p-6 text-center">
      <div className="space-y-2">
        <h2 className="text-xl font-bold">로그인이 필요합니다</h2>
        <p className="text-sm text-text-secondary">{message || "게시글을 수정하려면 먼저 로그인해 주세요."}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/login/"><Button>로그인</Button></Link>
        <Link href="/signup/"><Button variant="secondary">회원가입</Button></Link>
      </div>
    </Card>
  );
}

export function MyPostEditClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get("id") ?? "";
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let mounted = true;

    async function loadPost() {
      if (!id) {
        setState({ status: "error", message: "수정할 게시글 id가 없습니다." });
        return;
      }

      try {
        const data = await readApi(await fetch(`/api/me/posts/${id}`, { cache: "no-store", credentials: "same-origin" }));
        if (!data.post) throw new Error("게시글을 찾을 수 없습니다.");
        if (mounted) setState({ status: "ready", post: data.post });
      } catch (error) {
        if (!mounted) return;
        if (error instanceof Error && error.name === "AuthRequiredError") {
          setState({ status: "login-required", message: error.message });
          return;
        }
        setState({ status: "error", message: error instanceof Error ? error.message : "게시글을 불러오지 못했습니다." });
      }
    }

    void loadPost();

    return () => {
      mounted = false;
    };
  }, [id]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status !== "ready") return;

    const current = state.post;
    setState({ status: "saving", post: current });

    try {
      const formData = new FormData(event.currentTarget);
      const title = String(formData.get("title") ?? "").trim();
      const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();

      const data = await readApi(await fetch(`/api/me/posts/${current.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ title, bodyHtml }),
      }));

      if (!data.post) throw new Error("수정 결과를 불러오지 못했습니다.");
      setState({ status: "ready", post: data.post, message: "게시글이 수정되었습니다." });
    } catch (error) {
      if (error instanceof Error && error.name === "AuthRequiredError") {
        setState({ status: "login-required", message: error.message });
        return;
      }
      setState({ status: "ready", post: current, message: error instanceof Error ? error.message : "게시글 수정에 실패했습니다." });
    }
  }

  async function handleDelete() {
    if (state.status !== "ready") return;
    const confirmed = window.confirm("이 게시글을 삭제할까요? 공개 목록과 상세에서 사라집니다.");
    if (!confirmed) return;

    const current = state.post;
    setState({ status: "deleting", post: current });

    try {
      await readApi(await fetch(`/api/me/posts/${current.id}`, { method: "DELETE", credentials: "same-origin" }));
      router.push("/me/posts/");
      router.refresh();
    } catch (error) {
      if (error instanceof Error && error.name === "AuthRequiredError") {
        setState({ status: "login-required", message: error.message });
        return;
      }
      setState({ status: "ready", post: current, message: error instanceof Error ? error.message : "게시글 삭제에 실패했습니다." });
    }
  }

  if (state.status === "loading") return <Card className="p-6 text-sm text-text-secondary">게시글을 불러오는 중입니다...</Card>;
  if (state.status === "login-required") return <LoginPrompt message={state.message} />;
  if (state.status === "error") return <Card className="p-6 text-sm text-text-secondary">{state.message}</Card>;

  const post = state.post;
  const isBusy = state.status === "saving" || state.status === "deleting";

  return (
    <form onSubmit={handleSubmit} className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <div className="min-w-0 space-y-5">
        <Card className="space-y-2 p-4 sm:p-5">
          <label htmlFor="title" className="font-semibold">제목</label>
          <input id="title" name="title" defaultValue={post.title} className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base outline-none focus:border-graphite sm:text-sm" />
        </Card>
        <SimpleHtmlEditor defaultValue={post.body} helperText="수정한 내용은 저장 전 서버에서 다시 sanitize됩니다." />
      </div>

      <aside className="min-w-0 space-y-3">
        <Card variant="dark" className="space-y-4 p-5">
          <div>
            <p className="text-sm text-zinc-300">작성 위치</p>
            <h2 className="mt-1 text-xl font-bold">{post.board_title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">댓글 {post.comment_count} · {post.visibility} · {post.status}</p>
          </div>
          <Button type="submit" className="w-full" disabled={isBusy}>{state.status === "saving" ? "저장 중..." : "수정 저장"}</Button>
          <Button type="button" variant="secondary" className="w-full border-red-300 text-red-700" disabled={isBusy} onClick={handleDelete}>{state.status === "deleting" ? "삭제 중..." : "게시글 삭제"}</Button>
          <Link href={postHref(post.id)}><Button type="button" variant="ghost" className="w-full">상세 보기</Button></Link>
          <Link href="/me/posts/"><Button type="button" variant="ghost" className="w-full">목록으로</Button></Link>
          {state.status === "ready" && state.message ? <p className="rounded-2xl bg-white/10 p-3 text-sm leading-6 text-lime-100">{state.message}</p> : null}
        </Card>
      </aside>
    </form>
  );
}
