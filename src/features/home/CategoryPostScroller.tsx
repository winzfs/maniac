"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { HorizontalScroller } from "@/shared/components/ui/HorizontalScroller";
import { equipmentCategories } from "@/shared/data/equipment-categories";
import { mockBoardPosts } from "@/shared/data/mock-board-posts";

export function CategoryPostScroller() {
  const [selectedSlug, setSelectedSlug] = useState(equipmentCategories[0]?.slug ?? "motorcycle");
  const selectedCategory = equipmentCategories.find((category) => category.slug === selectedSlug) ?? equipmentCategories[0];

  const posts = useMemo(() => {
    if (!selectedCategory) return [];
    const boardSlugs = new Set(selectedCategory.boards.map((board) => board.slug));
    return mockBoardPosts.filter((post) => boardSlugs.has(post.boardSlug)).slice(0, 8);
  }, [selectedCategory]);

  if (!selectedCategory) return null;

  return (
    <section className="space-y-4 rounded-[2rem] border border-border bg-surface p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-garage-orange">Category Feed</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">카테고리 주요 글</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">카테고리를 누르면 홈 화면 안에서 주요 글만 바뀝니다.</p>
        </div>
        <Link href={`/explore/${selectedCategory.slug}/`}>
          <Button variant="secondary" className="w-full sm:w-auto">{selectedCategory.label} 전체보기</Button>
        </Link>
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 pt-1">
        {equipmentCategories.map((category) => {
          const isSelected = category.slug === selectedCategory.slug;
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => setSelectedSlug(category.slug)}
              aria-pressed={isSelected}
              className={`shrink-0 rounded-full border px-5 py-3 text-sm font-black shadow-sm transition ${isSelected ? "border-garage-orange bg-garage-orange text-white" : "border-border bg-background text-text-primary hover:border-garage-orange/50"}`}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <HorizontalScroller>
        {posts.map((post) => {
          const board = selectedCategory.boards.find((item) => item.slug === post.boardSlug);
          return (
            <Card key={post.id} className="min-w-72 max-w-80 space-y-4 sm:min-w-80">
              <div className="aspect-[16/9] rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-400" />
              <div className="flex items-center justify-between gap-2">
                <Badge label={board?.title ?? "게시판"} tone="muted" />
                <span className="text-xs text-text-secondary">{post.commentCount} comments</span>
              </div>
              <div>
                <h3 className="line-clamp-2 text-lg font-bold">{post.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-text-secondary">{post.excerpt}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>{post.authorName}</span>
                <span>{post.likeCount} likes</span>
              </div>
            </Card>
          );
        })}
      </HorizontalScroller>
    </section>
  );
}
