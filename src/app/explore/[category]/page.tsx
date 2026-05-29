import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { ExploreCategoryClient } from "@/features/boards/components/ExploreCategoryClient";
import { equipmentCategories, getEquipmentCategory } from "@/shared/data/equipment-categories";

export function generateStaticParams() {
  return equipmentCategories.map((category) => ({ category: category.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getEquipmentCategory(slug);

  return (
    <main className="container-shell space-y-10 py-5 sm:py-8 lg:space-y-14">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "장비 둘러보기", href: "/explore/" }, { label: category?.label ?? slug }]}
        menuLabel={category?.label ?? "카테고리"}
        title={category?.label ?? "알 수 없는 카테고리"}
        description={category?.description ?? "D1 게시판 데이터를 기준으로 카테고리를 표시합니다."}
      />

      <ExploreCategoryClient categorySlug={slug} />
    </main>
  );
}
