"use client";

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

export function BoardWriteForm({ categorySlug, boardSlug, boardTitle, boardDescription }: BoardWriteFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const title = String(formData.get("title") ?? "").trim();
    const bodyHtml = String(formData.get("bodyHtml") ?? "").trim();

    if (title.length < 2) {
      setStatus("제목은 2자 이상 입력해 주세요.");
      return;
    }

    if (bodyHtml.length < 5) {
      setStatus("본문은 5자 이상 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setStatus("게시글을 저장하는 중입니다...");

    try {
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ boardSlug, title, bodyHtml }),
      });
      const data = (await response.json()) as CreatePostResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.ok === false ? data.error ?? "게시글 저장에 실패했습니다." : "게시글 저장에 실패했습니다.");
      }

      setStatus("저장 완료. 게시글로 이동합니다.");
      router.push(data.nextPath);
      router.refresh();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "게시글 저장에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
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
        <SimpleHtmlEditor helperText="작성한 내용은 D1 posts 테이블에 저장됩니다. 이미지 업로드는 아직 R2 연결 전이므로 본문 내 data URL 삽입 방식입니다." />
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
          {status ? <p className="text-xs leading-5 text-text-secondary">{status}</p> : null}
          <p className="text-xs leading-5 text-text-secondary">현재는 개발용 mock user로 저장합니다. 로그인 연결 후 실제 사용자 ID로 대체합니다.</p>
        </Card>
      </aside>
    </form>
  );
}
