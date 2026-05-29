import { Suspense } from "react";
import { Card } from "@/shared/components/ui/Card";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { PublicPostViewSection } from "@/features/boards/components/PublicPostViewSection";

export default function PublicPostPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "장비 둘러보기", href: "/explore/" }, { label: "게시글" }]}
        title="게시글 상세"
        description="D1 posts 테이블의 공개 게시글을 표시합니다."
      />

      <Suspense fallback={<Card className="p-6 text-sm text-text-secondary">게시글 페이지를 준비하는 중입니다...</Card>}>
        <PublicPostViewSection />
      </Suspense>
    </main>
  );
}
