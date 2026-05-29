import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { BoardWriteForm } from "@/features/boards/components/BoardWriteForm";
import { equipmentCategories, getEquipmentCategory } from "@/shared/data/equipment-categories";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return equipmentCategories.flatMap((category) => category.boards.map((board) => ({ category: category.slug, board: board.slug })));
}

export default async function BoardWritePage({ params }: { params: Promise<{ category: string; board: string }> }) {
  const { category: categorySlug, board: boardSlug } = await params;
  const category = getEquipmentCategory(categorySlug);
  const board = category?.boards.find((item) => item.slug === boardSlug);
  if (!category || !board) notFound();

  return (
    <main className="container-shell max-w-full space-y-8 overflow-x-hidden py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "장비 둘러보기", href: "/explore/" }, { label: category.label, href: `/explore/${category.slug}/` }, { label: board.title, href: `/explore/${category.slug}/${board.slug}/` }, { label: "글쓰기" }]}
        title="글쓰기"
        description="게시글은 D1 posts 테이블에 저장됩니다."
      />

      <BoardWriteForm categorySlug={category.slug} boardSlug={board.slug} boardTitle={board.title} boardDescription={board.description} />
    </main>
  );
}
