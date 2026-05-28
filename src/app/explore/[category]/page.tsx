import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { equipmentCategories, getEquipmentCategory } from "@/shared/data/equipment-categories";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return equipmentCategories.map((category) => ({ category: category.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params;
  const category = getEquipmentCategory(slug);
  if (!category) notFound();

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
        <SectionHeader title="카테고리 게시판" description="현재는 정적 게시판 mock입니다. 이후 DB 기반 게시판으로 교체합니다." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {category.boards.map((board) => (
            <Link key={board.slug} href={`/explore/${category.slug}/${board.slug}/`}>
              <Card className="h-full space-y-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <Badge label={board.type} tone={board.type === "trade" ? "orange" : "muted"} />
                  <span className="text-xs text-text-secondary">{board.postCount} posts</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{board.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{board.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
