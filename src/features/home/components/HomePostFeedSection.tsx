"use client";

import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import Link from "next/link";
import { useEffect, useState } from "react";

type PublicPost = {
  id: string;
  board_slug: string;
  board_title: string;
  category: string;
  title: string;
  body: string;
  author_nickname: string;
  created_at: number;
  comment_count: number;
};

type PublicPostResponse = {
  ok?: boolean;
  posts?: PublicPost[];
  error?: string;
};

type FeedState = {
  latest: PublicPost[];
  popular: PublicPost[];
  loading: boolean;
  error: string;
};

function postHref(post: PublicPost) {
  return `/explore/post/?id=${encodeURIComponent(post.id)}`;
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function formatDate(value: number) {
  return new Intl.DateTimeFormat("ko-KR", { month: "2-digit", day: "2-digit" }).format(new Date(value));
}

function PostCard({ post, rank }: { post: PublicPost; rank?: number }) {
  return (
    <Link href={postHref(post)} className="block">
      <Card className="space-y-2 p-3 transition hover:-translate-y-0.5 hover:shadow-md sm:space-y-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {rank ? <span className="rounded-full bg-garage-orange px-2 py-0.5 text-[0.68rem] font-black text-white sm:px-2.5 sm:py-1 sm:text-xs">#{rank}</span> : null}
          <Badge label={post.board_title} tone="muted" />
          <span className="text-[0.72rem] text-text-secondary sm:text-xs">{formatDate(post.created_at)}</span>
          <span className="text-[0.72rem] text-text-secondary sm:hidden">· 댓글 {post.comment_count}</span>
        </div>
        <div className="space-y-1 sm:space-y-2">
          <h3 className="line-clamp-1 text-base font-black leading-snug tracking-tight sm:line-clamp-2 sm:text-lg">{post.title}</h3>
          <p className="line-clamp-1 text-xs leading-5 text-text-secondary sm:line-clamp-2 sm:text-sm sm:leading-6">{stripHtml(post.body) || "본문 미리보기가 없습니다."}</p>
        </div>
        <div className="hidden items-center justify-between border-t border-border pt-3 text-xs text-text-secondary sm:flex">
          <span>{post.author_nickname}</span>
          <span>댓글 {post.comment_count}</span>
        </div>
      </Card>
    </Link>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid gap-2 lg:grid-cols-2 sm:gap-4">
      {[0, 1, 2, 3].map((item) => <Card key={item} className="h-24 animate-pulse p-3 sm:h-40 sm:p-5" />)}
    </div>
  );
}

function FeedColumn({ title, description, posts, popular = false }: { title: string; description: string; posts: PublicPost[]; popular?: boolean }) {
  return (
    <div className="min-w-0 rounded-card border border-border/80 bg-white/40 p-2.5 sm:space-y-4 sm:border-0 sm:bg-transparent sm:p-0">
      <div className="mb-2 flex items-end justify-between gap-3 sm:mb-0 sm:block">
        <SectionHeader title={title} description={description} />
        <span className="shrink-0 rounded-full bg-background px-2 py-1 text-[0.7rem] font-black text-text-secondary sm:hidden">{posts.length}개</span>
      </div>
      <div className="grid gap-2 sm:gap-3">
        {posts.map((post, index) => <PostCard key={post.id} post={post} rank={popular ? index + 1 : undefined} />)}
      </div>
    </div>
  );
}

export function HomePostFeedSection() {
  const [state, setState] = useState<FeedState>({ latest: [], popular: [], loading: true, error: "" });

  useEffect(() => {
    let mounted = true;

    async function loadFeeds() {
      try {
        const [latestResponse, popularResponse] = await Promise.all([
          fetch("/api/public/posts?limit=6&sort=latest", { cache: "no-store" }),
          fetch("/api/public/posts?limit=6&sort=popular", { cache: "no-store" }),
        ]);
        const latestData = (await latestResponse.json().catch(() => null)) as PublicPostResponse | null;
        const popularData = (await popularResponse.json().catch(() => null)) as PublicPostResponse | null;

        if (!latestResponse.ok || !latestData?.ok) throw new Error(latestData?.error ?? "최근 게시글을 불러오지 못했습니다.");
        if (!popularResponse.ok || !popularData?.ok) throw new Error(popularData?.error ?? "인기 게시글을 불러오지 못했습니다.");

        if (mounted) setState({ latest: latestData.posts ?? [], popular: popularData.posts ?? [], loading: false, error: "" });
      } catch (error) {
        if (mounted) setState({ latest: [], popular: [], loading: false, error: error instanceof Error ? error.message : "게시글 피드를 불러오지 못했습니다." });
      }
    }

    void loadFeeds();

    return () => {
      mounted = false;
    };
  }, []);

  if (state.loading) {
    return (
      <section className="space-y-3 sm:space-y-5">
        <SectionHeader title="커뮤니티 피드" description="최근 올라온 글과 댓글이 많은 글을 모아봅니다." />
        <SkeletonGrid />
      </section>
    );
  }

  if (state.error) {
    return (
      <section className="space-y-3 sm:space-y-5">
        <SectionHeader title="커뮤니티 피드" description="최근 올라온 글과 댓글이 많은 글을 모아봅니다." />
        <Card className="p-3 text-sm text-text-secondary sm:p-5">{state.error}</Card>
      </section>
    );
  }

  if (state.latest.length === 0 && state.popular.length === 0) {
    return (
      <section className="space-y-3 sm:space-y-5">
        <SectionHeader title="커뮤니티 피드" description="최근 올라온 글과 댓글이 많은 글을 모아봅니다." />
        <Card className="space-y-1 p-3 sm:space-y-2 sm:p-5">
          <h3 className="font-bold">아직 공개 게시글이 없습니다.</h3>
          <p className="text-sm leading-6 text-text-secondary">게시판에 첫 글을 작성하면 이곳에 표시됩니다.</p>
        </Card>
      </section>
    );
  }

  return (
    <section className="space-y-2 sm:space-y-4">
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <div>
          <h2 className="text-base font-black tracking-[-0.03em]">커뮤니티 피드</h2>
          <p className="text-xs text-text-secondary">최근글과 인기글을 옆으로 넘겨보세요.</p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[0.68rem] font-black text-text-secondary">
          <span>←</span><span>스와이프</span><span>→</span>
        </div>
      </div>

      <div className="relative sm:hidden">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-background to-transparent" />
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]">
          <div className="w-[88vw] shrink-0 snap-start">
            <FeedColumn title="최근 게시글" description="새로 올라온 공개 게시글입니다." posts={state.latest} />
          </div>
          <div className="w-[88vw] shrink-0 snap-start pr-2">
            <FeedColumn title="댓글 많은 글" description="커뮤니티 반응이 많은 게시글입니다." posts={state.popular} popular />
          </div>
        </div>
        <div className="mt-1 flex justify-center gap-1.5">
          <span className="h-1.5 w-5 rounded-full bg-graphite" />
          <span className="h-1.5 w-1.5 rounded-full bg-border" />
        </div>
      </div>

      <div className="hidden gap-5 sm:grid lg:grid-cols-2">
        <FeedColumn title="최근 게시글" description="새로 올라온 공개 게시글입니다." posts={state.latest} />
        <FeedColumn title="댓글 많은 글" description="커뮤니티 반응이 많은 게시글입니다." posts={state.popular} popular />
      </div>
    </section>
  );
}
