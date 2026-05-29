import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { getEquipmentCategory } from "@/shared/data/equipment-categories";
import { mockBoardPosts } from "@/shared/data/mock-board-posts";
import { CategoryBoardPostFilter } from "@/features/boards/components/CategoryBoardPostFilter";
import { notFound } from "next/navigation";

const enabledCategorySlugs = ["motorcycle"];

export function generateStaticParams() {
  return enabledCategorySlugs.map((category) => ({ category }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  if (!enabledCategorySlugs.includes(slug)) notFound();

  const category = getEquipmentCategory(slug);
  if (!category) notFound();

  const boardSlugs = new Set(category.boards.map((board) => board.slug));
  const posts = mockBoardPosts.filter((post) => boardSlugs.has(post.boardSlug));

  return (
    <main className="container-shell space-y-10 py-5 sm:py-8 lg:space-y-14">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "장비 둘러보기", href: "/explore/" }, { label: category.label }]}
        menuLabel={category.label}
        title={category.label}
        description={category.description}
      />

      <Card variant="dark" className="p-5">
        <p className="text-sm text-zinc-300">Category Accent</p>
        <h2 className="mt-1 text-2xl font-bold">{category.accent}</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-300">장비 기록과 게시판을 카테고리별로 묶어 보여주는 허브입니다.</p>
      </Card>

      <section>
        <SectionHeader title="전체글" description="전체글을 먼저 보여주고, 상단 카테고리 버튼으로 게시판별 글을 필터링합니다." />
        <CategoryBoardPostFilter categorySlug={category.slug} boards={category.boards} posts={posts} />
      </section>
    </main>
  );
}
