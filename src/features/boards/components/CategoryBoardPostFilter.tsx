"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import type { CategoryBoard, EquipmentCategorySlug } from "@/shared/data/equipment-categories";
import type { MockBoardPost } from "@/shared/data/mock-board-posts";

export function CategoryBoardPostFilter({
  categorySlug,
  boards,
  posts,
}: {
  categorySlug: EquipmentCategorySlug;
  boards: CategoryBoard[];
  posts: MockBoardPost[];
}) {
  const [selectedBoardSlug, setSelectedBoardSlug] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    if (!selectedBoardSlug) return posts;
    return posts.filter((post) => post.boardSlug === selectedBoardSlug);
  }, [posts, selectedBoardSlug]);

  const selectedBoard = boards.find((board) => board.slug === selectedBoardSlug);

  return (
    <section className="space-y-5">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedBoardSlug(null)}
            aria-pressed={!selectedBoardSlug}
            className={`rounded-full border px-4 py-2 text-sm font-bold transition ${!selectedBoardSlug ? "border-garage-orange bg-garage-orange text-white" : "border-border bg-surface text-text-secondary hover:border-garage-orange/50 hover:text-text-primary"}`}
          >
            전체글
          </button>
          {boards.map((board) => {
            const isSelected = selectedBoardSlug === board.slug;
            return (
              <button
                key={board.slug}
                type="button"
                onClick={() => setSelectedBoardSlug((current) => (current === board.slug ? null : board.slug))}
                aria-pressed={isSelected}
                className={`rounded-full border px-4 py-2 text-sm font-bold transition ${isSelected ? "border-garage-orange bg-garage-orange text-white" : "border-border bg-surface text-text-secondary hover:border-garage-orange/50 hover:text-text-primary"}`}
              >
                {board.title}
              </button>
            );
          })}
        </div>
        <p className="text-sm text-text-secondary">
          {selectedBoard ? `${selectedBoard.title} 글만 보는 중입니다. 버튼을 다시 누르면 전체글로 돌아갑니다.` : "전체 게시판의 글을 모아보고 있습니다."}
        </p>
      </div>

      <div className="space-y-3">
        {filteredPosts.map((post) => {
          const board = boards.find((item) => item.slug === post.boardSlug);
          return (
            <Link key={post.id} href={`/explore/${categorySlug}/${post.boardSlug}/`}>
              <Card className="grid gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-sm sm:grid-cols-[8rem_1fr] sm:p-5">
                <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-400" />
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
                    <Badge label={board?.title ?? "게시판"} tone={board?.type === "trade" ? "orange" : "muted"} />
                    <span>{post.authorName}</span>
                    <span>·</span>
                    <span>{post.createdAt}</span>
                    <span>·</span>
                    <span>{post.commentCount} comments</span>
                    <span>·</span>
                    <span>{post.likeCount} likes</span>
                  </div>
                  <h2 className="text-lg font-bold">{post.title}</h2>
                  <p className="text-sm leading-6 text-text-secondary">{post.excerpt}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
