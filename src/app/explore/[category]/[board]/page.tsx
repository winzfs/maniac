import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { equipmentCategories, getEquipmentCategory } from "@/shared/data/equipment-categories";
import { getMockPostsByBoardSlug } from "@/shared/data/mock-board-posts";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return equipmentCategories.flatMap((category) => category.boards.map((board) => ({ category: category.slug, board: board.slug })));
}

export default async function BoardPage({ params }: { params: Promise<{ category: string; board: string }> }) {
  const { category: categorySlug, board: boardSlug } = await params;
  const category = getEquipmentCategory(categorySlug);
  const board = category?.boards.find((item) => item.slug === boardSlug);
  if (!category || !board) notFound();

  const posts = getMockPostsByBoardSlug(board.slug);

  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <section className="grid gap-5 lg:grid-cols-[1fr_18rem] lg:items-end">
        <div className="space-y-4">
          <Badge label={category.label} tone="orange" />
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{board.title}</h1>
          <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">{board.description}</p>
        </div>
        <Card variant="dark" className="p-5">
          <p className="text-sm text-zinc-300">게시판 상태</p>
          <h2 className="mt-1 text-2xl font-bold">{posts.length} posts</h2>
          <Link href={`/explore/${category.slug}/${board.slug}/write/`}>
            <Button className="mt-4 w-full">글쓰기</Button>
          </Link>
        </Card>
      </section>

      <section>
        <SectionHeader title="게시글" description="현재는 정적 mock 게시글입니다. 이후 DB posts와 연결합니다." />
        <div className="space-y-3">
          {posts.map((post) => (
            <Card key={post.id} className="grid gap-4 p-4 sm:grid-cols-[8rem_1fr] sm:p-5">
              <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-400" />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
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
          ))}
        </div>
      </section>
    </main>
  );
}
