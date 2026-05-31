import type { Metadata } from "next";
import Link from "next/link";
import { ExploreBoardClient } from "@/features/boards/components/ExploreBoardClient";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { equipmentCategories, getEquipmentCategory } from "@/shared/data/equipment-categories";

export function generateStaticParams() {
  return equipmentCategories.flatMap((category) => category.boards.map((board) => ({ category: category.slug, board: board.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string; board: string }> }): Promise<Metadata> {
  const { category: categorySlug, board: boardSlug } = await params;
  const category = getEquipmentCategory(categorySlug);
  const board = category?.boards.find((item) => item.slug === boardSlug);
  const title = board && category ? `${category.label} ${board.title}` : "장비 게시판";
  const description = board && category
    ? `${category.label} 마니아들이 ${board.description}을 공유하는 게시판입니다.`
    : "장비 마니아들의 기록, 질문, 부품 리뷰를 둘러보세요.";

  return {
    title,
    description,
    alternates: { canonical: `/explore/${categorySlug}/${boardSlug}/` },
    openGraph: {
      title: `${title} | Maniac Garage`,
      description,
      url: `/explore/${categorySlug}/${boardSlug}/`,
    },
  };
}

export default async function BoardPage({ params }: { params: Promise<{ category: string; board: string }> }) {
  const { category: categorySlug, board: boardSlug } = await params;
  const category = getEquipmentCategory(categorySlug);
  const board = category?.boards.find((item) => item.slug === boardSlug);
  const writeHref = `/explore/${categorySlug}/${boardSlug}/write/`;

  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "장비 둘러보기", href: "/explore/" }, { label: category?.label ?? categorySlug, href: `/explore/${categorySlug}/` }, { label: board?.title ?? boardSlug }]}
        title={board?.title ?? "게시판"}
        description={board?.description ?? "D1 게시판 데이터를 기준으로 게시글을 표시합니다."}
        action={
          <Link href={writeHref}>
            <Button size="sm">글쓰기</Button>
          </Link>
        }
      />

      <ExploreBoardClient categorySlug={categorySlug} boardSlug={boardSlug} />
    </main>
  );
}
