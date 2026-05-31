import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { BoardWriteForm } from "@/features/boards/components/BoardWriteForm";
import { equipmentCategories, getEquipmentCategory } from "@/shared/data/equipment-categories";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return equipmentCategories.map((category) => ({ category: category.slug }));
}

export default async function CategoryWritePage({ params }: { params: Promise<{ category: string }> }) {
  const { category: categorySlug } = await params;
  const category = getEquipmentCategory(categorySlug);
  if (!category) notFound();

  const defaultBoard = category.boards[0];
  const boardOptions = category.boards.map((board) => ({
    slug: board.slug,
    title: board.title,
    description: board.description,
  }));

  return (
    <main className="container-shell max-w-full space-y-8 overflow-x-hidden py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: category.label, href: `/explore/${category.slug}/` }]}
        title="글쓰기"
        description="세부 카테고리를 선택하고 글을 작성하세요."
      />

      <BoardWriteForm
        categorySlug={category.slug}
        boardSlug={defaultBoard.slug}
        boardTitle={defaultBoard.title}
        boardDescription={defaultBoard.description}
        boardOptions={boardOptions}
      />
    </main>
  );
}
