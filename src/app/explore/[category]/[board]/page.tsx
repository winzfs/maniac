import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { equipmentCategories, getEquipmentCategory } from "@/shared/data/equipment-categories";
import { ExploreBoardClient } from "@/features/boards/components/ExploreBoardClient";

export function generateStaticParams() {
  return equipmentCategories.flatMap((category) => category.boards.map((board) => ({ category: category.slug, board: board.slug })));
}

export default async function BoardPage({ params }: { params: Promise<{ category: string; board: string }> }) {
  const { category: categorySlug, board: boardSlug } = await params;
  const category = getEquipmentCategory(categorySlug);
  const board = category?.boards.find((item) => item.slug === boardSlug);

  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "장비 둘러보기", href: "/explore/" }, { label: category?.label ?? categorySlug, href: `/explore/${categorySlug}/` }, { label: board?.title ?? boardSlug }]}
        menuLabel={category?.label ?? "게시판"}
        title={board?.title ?? "게시판"}
        description={board?.description ?? "D1 게시판 데이터를 기준으로 게시글을 표시합니다."}
      />

      <ExploreBoardClient categorySlug={categorySlug} boardSlug={boardSlug} />
    </main>
  );
}
