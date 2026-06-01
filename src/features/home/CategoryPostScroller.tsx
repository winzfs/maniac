"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { HorizontalScroller } from "@/shared/components/ui/HorizontalScroller";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { equipmentCategories } from "@/shared/data/equipment-categories";
import { excerptFromHtml } from "@/features/boards/utils/html";

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

type PostsResponse = { ok: true; posts: PublicPost[] } | { ok: false; error?: string };

type State =
  | { status: "loading" }
  | { status: "ready"; posts: PublicPost[] }
  | { status: "error"; message: string };

function postDetailHref(id: string) {
  return `/explore/post/?id=${encodeURIComponent(id)}`;
}

async function readCategoryPosts(categorySlug: string) {
  const response = await fetch(`/api/public/posts?category=${encodeURIComponent(categorySlug)}&limit=8`, { cache: "no-store" });
  const data = (await response.json()) as PostsResponse;

  if (!response.ok || !data.ok) {
    throw new Error(data.ok === false ? data.error ?? "게시글을 불러오지 못했습니다." : "게시글을 불러오지 못했습니다.");
  }

  return data.posts;
}

export function CategoryPostScroller() {
  const [selectedSlug, setSelectedSlug] = useState(equipmentCategories[0]?.slug ?? "motorcycle");
  const [state, setState] = useState<State>({ status: "loading" });
  const selectedCategory = useMemo(
    () => equipmentCategories.find((category) => category.slug === selectedSlug) ?? equipmentCategories[0],
    [selectedSlug],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      setState({ status: "loading" });
      try {
        const posts = await readCategoryPosts(selectedSlug);
        if (mounted) setState({ status: "ready", posts });
      } catch (error) {
        if (!mounted) return;
        setState({ status: "error", message: error instanceof Error ? error.message : "게시글을 불러오지 못했습니다." });
      }
    }

    load();
    return () => { mounted = false; };
  }, [selectedSlug]);

  if (!selectedCategory) return null;

  return (
    <div className="space-y-4">
      <SectionHeader
        title="카테고리 글"
        description="관심 장비 카테고리의 최신 글을 바로 둘러보세요."
        action={<Link href={`/explore/${selectedCategory.slug}/`} className="text-xs font-black text-garage-orange">{selectedCategory.label} 전체글 보기</Link>}
      />

      <div className="flex flex-wrap gap-2">
        {equipmentCategories.slice(0, 6).map((category) => {
          const isSelected = category.slug === selectedCategory.slug;
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => setSelectedSlug(category.slug)}
              aria-pressed={isSelected}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${isSelected ? "border-garage-orange bg-garage-orange text-white" : "border-border bg-background text-text-secondary hover:border-garage-orange/50 hover:text-text-primary"}`}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      {state.status === "loading" ? <Card className="p-4 text-sm text-text-secondary">게시글을 불러오는 중입니다...</Card> : null}
      {state.status === "error" ? <Card className="p-4 text-sm text-text-secondary">{state.message}</Card> : null}
      {state.status === "ready" && state.posts.length === 0 ? <Card className="p-4 text-sm text-text-secondary">아직 공개된 게시글이 없습니다.</Card> : null}

      {state.status === "ready" && state.posts.length > 0 ? (
        <HorizontalScroller>
          {state.posts.map((post) => (
            <Link key={post.id} href={postDetailHref(post.id)} className="shrink-0">
              <Card className="min-w-60 max-w-64 space-y-3 p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <Badge label={post.board_title} tone="muted" />
                  <span className="text-xs font-bold text-text-secondary">댓글 {post.comment_count}</span>
                </div>
                <div>
                  <h3 className="line-clamp-2 text-base font-bold">{post.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{excerptFromHtml(post.body)}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>{post.author_nickname ?? "GearDuck"}</span>
                  <span>{selectedCategory.label}</span>
                </div>
              </Card>
            </Link>
          ))}
        </HorizontalScroller>
      ) : null}
    </div>
  );
}
