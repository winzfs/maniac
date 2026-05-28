"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { HorizontalScroller } from "@/shared/components/ui/HorizontalScroller";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
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
    <section className="space-y-4">
      <SectionHeader
        title="카테고리 주요 글"
        description="카테고리 버튼은 이동하지 않고, 이 영역에서 주요 글만 바꿔 보여줍니다."
        action={<Link href={`/explore/${selectedCategory.slug}/`} className="text-xs font-semibold text-garage-orange">{selectedCategory.label} 전체보기</Link>}
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        {equipmentCategories.map((category) => {
          const isSelected = category.slug === selectedCategory.slug;
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => setSelectedSlug(category.slug)}
              aria-pressed={isSelected}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${isSelected ? "border-garage-orange bg-garage-orange text-white" : "border-border bg-surface text-text-secondary hover:bg-background"}`}
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

      <div className="sm:hidden">
        <Link href={`/explore/${selectedCategory.slug}/`}>
          <Button variant="secondary" className="w-full">{selectedCategory.label} 전체보기</Button>
        </Link>
      </div>
    </section>
  );
}
