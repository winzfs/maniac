"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SimpleHtmlEditor } from "@/features/editor/SimpleHtmlEditor";

type CreatePostResponse =
  | { ok: true; nextPath: string }
  | { ok: false; error?: string };

type BoardWriteFormProps = {
  categorySlug: string;
  boardSlug: string;
  boardTitle: string;
  boardDescription?: string;
};

type SubmitState =
  | { status: "idle"; message: string }
  | { status: "submitting"; message: string }
  | { status: "login-required"; message: string }
  | { status: "error"; message: string };

export function BoardWriteForm({ categorySlug, boardSlug, boardTitle, boardDescription }: BoardWriteFormProps) {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle", message: "" });
  const isSubmitting = submitState.status === "submitting";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") ?? "").trim();
    const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();

    if (title.length < 2) {
      setSubmitState({ status: "error", message: "제목은 2자 이상 입력해 주세요." });
      return;
    }

    if (bodyHtml.length < 5) {
      setSubmitState({ status: "error", message: "본문은 5자 이상 입력해 주세요." });
      return;
    }

    setSubmitState({ status: "submitting", message: "게시글을 저장하는 중입니다..." });

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ boardSlug, title, bodyHtml }),
      });
      const data = (await response.json()) as CreatePostResponse;

      if (response.status === 401) {
        setSubmitState({ status: "login-required", message: data.ok === false ? data.error ?? "게시글을 작성하려면 먼저 로그인해 주세요." : "게시글을 작성하려면 먼저 로그인해 주세요." });
        return;
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.ok === false ? data.error ?? "게시글 저장에 실패했습니다." : "게시글 저장에 실패했습니다.");
      }

      setSubmitState({ status: "submitting", message: "저장 완료. 게시글로 이동합니다." });
      router.push(data.nextPath);
      router.refresh();
    } catch (error) {
      setSubmitState({ status: "error", message: error instanceof Error ? error.message : "게시글 저장에 실패했습니다." });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
      <input type="hidden" name="categorySlug" value={categorySlug} />
      <input type="hidden" name="boardSlug" value={boardSlug} />

      <div className="min-w-0 space-y-5">
        <Card className="space-y-2 p-4 sm:p-5">
          <label htmlFor="title" className="font-semibold">제목</label>
          <input id="title" name="title" className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-base outline-none focus:border-graphite sm:text-sm" placeholder="제목을 입력하세요" />
        </Card>
        <SimpleHtmlEditor helperText="작성한 내용은 현재 로그인 계정의 게시글로 저장됩니다. 이미지 업로드는 아직 R2 연결 전이므로 본문 내 data URL 삽입 방식입니다." />
      </div>

      <aside className="min-w-0 space-y-3">
        <Card variant="dark" className="p-5">
          <p className="text-sm text-zinc-300">작성 위치</p>
          <h2 className="mt-1 text-xl font-bold">{boardTitle}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">{boardDescription ?? "게시판 설명이 없습니다."}</p>
        </Card>
        <Card className="space-y-3 p-5">
          <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? "저장 중..." : "게시글 저장"}</Button>
          <Button type="button" variant="secondary" className="w-full" onClick={() => router.push(`/explore/${categorySlug}/${boardSlug}/`)}>취소</Button>
          {submitState.message ? <p className="text-xs leading-5 text-text-secondary">{submitState.message}</p> : null}
          {submitState.status === "login-required" ? (
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <Link className="text-garage-orange underline underline-offset-4" href="/login/">로그인</Link>
              <Link className="text-garage-orange underline underline-offset-4" href="/signup/">회원가입</Link>
            </div>
          ) : null}
          <p className="text-xs leading-5 text-text-secondary">로그인한 계정의 작성자로 게시글이 저장됩니다.</p>
        </Card>
      </aside>
    </form>
  );
}
