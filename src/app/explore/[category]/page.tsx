import type { Metadata } from "next";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { ExploreCategoryClient } from "@/features/boards/components/ExploreCategoryClient";
import { equipmentCategories, getEquipmentCategory } from "@/shared/data/equipment-categories";

export function generateStaticParams() {
  return equipmentCategories.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getEquipmentCategory(slug);
  const title = category ? `${category.label} 기어 기록과 커뮤니티` : "기어 커뮤니티";
  const description = category
    ? `${category.description} ${category.label} 장비 자랑, 정비 기록, 부품 리뷰, 질문 글을 둘러보세요.`
    : "장비덕후들의 기어 기록과 정비 이야기를 둘러보세요.";

  return {
    title,
    description,
    alternates: { canonical: `/explore/${slug}/` },
    openGraph: {
      title: `${title} | GearDuck`,
      description,
      url: `/explore/${slug}/`,
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getEquipmentCategory(slug);

  return (
    <main className="container-shell space-y-10 py-5 sm:py-8 lg:space-y-14">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "기어 둘러보기", href: "/explore/" }, { label: category?.label ?? slug }]}
        title={category ? `${category.label} 기어 커뮤니티` : "알 수 없는 카테고리"}
        description={category?.description ?? "GearDuck 게시판 데이터를 기준으로 카테고리를 표시합니다."}
      />

      <ExploreCategoryClient categorySlug={slug} />
    </main>
  );
}
