import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { equipmentCategories } from "@/shared/data/equipment-categories";
import Link from "next/link";

export default function ExplorePage() {
  return (
    <main className="container-shell space-y-10 py-5 sm:py-8 lg:space-y-14">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "장비 둘러보기" }]}
        menuLabel="장비 메뉴"
        title="장비 카테고리 둘러보기"
        description="바이크, 커스텀 PC, 키보드, 카메라까지. 카테고리별 장비 포트폴리오와 게시판을 탐색하세요."
      />

      <section>
        <SectionHeader title="카테고리" description="각 카테고리 안에는 장비 자랑, 정비 기록, 부품 리뷰, 질문 게시판이 준비됩니다." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {equipmentCategories.map((category) => (
            <Link key={category.slug} href={`/explore/${category.slug}/`}>
              <Card className="h-full space-y-4 transition hover:-translate-y-0.5 hover:shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <Badge label={category.shortLabel} tone="muted" />
                  <span className="text-xs text-text-secondary">{category.boards.length} boards</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold">{category.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{category.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
