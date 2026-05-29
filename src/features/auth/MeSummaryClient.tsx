"use client";

import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import Link from "next/link";
import { useEffect, useState } from "react";

type RecentPost = {
  id: string;
  title: string;
  board_slug: string;
  board_title: string;
  category: string;
  created_at: number;
  comment_count: number;
};

type Summary = {
  equipmentCount: number;
  postCount: number;
  commentCount: number;
  recentPosts: RecentPost[];
};

type SummaryResponse = {
  ok?: boolean;
  summary?: Summary;
  error?: string;
};

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function postHref(post: RecentPost) {
  return `/explore/post/?id=${encodeURIComponent(post.id)}`;
}

function statItems(summary: Summary) {
  return [
    { label: "registered equipment", value: summary.equipmentCount, href: "/garage/" },
    { label: "published posts", value: summary.postCount, href: "/me/posts/" },
    { label: "comments", value: summary.commentCount, href: "/me/comments/" },
  ];
}

export function MeSummaryClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        const response = await fetch("/api/me/summary", { cache: "no-store", credentials: "same-origin" });
        const data = (await response.json().catch(() => null)) as SummaryResponse | null;

        if (!response.ok || !data?.ok || !data.summary) {
          throw new Error(data?.error ?? "활동 요약을 불러오지 못했습니다.");
        }

        if (mounted) setSummary(data.summary);
      } catch (summaryError) {
        if (mounted) setError(summaryError instanceof Error ? summaryError.message : "활동 요약을 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadSummary();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section>
        <SectionHeader title="내 활동 요약" description="활동 요약을 불러오는 중입니다." />
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <Card key={item} className="h-28 animate-pulse p-5" />)}
        </div>
      </section>
    );
  }

  if (error || !summary) {
    return (
      <section>
        <SectionHeader title="내 활동 요약" description="로그인 후 내 활동을 확인할 수 있습니다." />
        <Card className="p-5 text-sm text-text-secondary">{error || "활동 요약이 없습니다."}</Card>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <SectionHeader title="내 활동 요약" description="현재 로그인 계정 기준으로 집계한 활동입니다." />
      <div className="grid gap-3 sm:grid-cols-3">
        {statItems(summary).map((item) => (
          <Link key={item.label} href={item.href} className="block">
            <Card className="space-y-2 p-5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
              <b className="block text-3xl font-black tracking-tight">{item.value}</b>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">{item.label}</p>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-black">최근 작성 글</h2>
            <p className="mt-1 text-xs text-text-secondary">최근 작성한 게시글 5개를 보여줍니다.</p>
          </div>
          <Link href="/me/posts/" className="text-xs font-semibold text-garage-orange">전체 보기</Link>
        </div>
        {summary.recentPosts.length > 0 ? (
          <div className="grid gap-2 border-t border-border pt-4">
            {summary.recentPosts.map((post) => (
              <Link key={post.id} href={postHref(post)} className="rounded-2xl border border-border bg-background px-4 py-3 transition hover:bg-surface">
                <p className="font-bold leading-tight">{post.title}</p>
                <p className="mt-1 text-xs text-text-secondary">{post.board_title} · 댓글 {post.comment_count} · {formatDate(post.created_at)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="border-t border-border pt-4 text-sm text-text-secondary">아직 작성한 게시글이 없습니다.</p>
        )}
      </Card>
    </section>
  );
}
