import { Suspense } from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { Card } from "@/shared/components/ui/Card";
import { SearchResultsClient } from "@/features/search/components/SearchResultsClient";

export const metadata: Metadata = {
  title: "검색",
  description: "GearDuck의 공개 장비, 커뮤니티 게시글, 장비 뉴스를 검색합니다.",
  alternates: { canonical: "/search/" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "검색 | GearDuck",
    description: "장비덕후들의 공개 장비, 게시글, 장비 뉴스를 한 번에 찾아보세요.",
    url: "/search/",
  },
};

export default function SearchPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "검색" }]}
        title="검색"
        description="공개 장비, 커뮤니티 게시글, 장비 뉴스를 한 번에 찾아보세요."
      />

      <Suspense fallback={<Card className="p-6 text-sm text-text-secondary">검색 화면을 불러오는 중입니다...</Card>}>
        <SearchResultsClient />
      </Suspense>
    </main>
  );
}
