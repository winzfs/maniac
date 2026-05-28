"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
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
    <div className="space-y-4">
      <SectionHeader
        title="Category Boards"
        action={<Link href={`/explore/${selectedCategory.slug}/`} className="text-xs font-semibold text-garage-orange">전체 카테고리</Link>}
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

      <HorizontalScroller>
        {posts.map((post) => {
          const board = selectedCategory.boards.find((item) => item.slug === post.boardSlug);
          return (
            <Card key={post.id} className="min-w-60 max-w-64 space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <Badge label={board?.title ?? "게시판"} tone="muted" />
                <span className="text-xs text-text-secondary">{post.commentCount}</span>
              </div>
              <div>
                <h3 className="line-clamp-2 text-base font-bold">{post.title}</h3>
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
    </div>
  );
}
