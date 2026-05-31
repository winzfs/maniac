import { Suspense } from "react";
import { Card } from "@/shared/components/ui/Card";
import { PublicPostViewSection } from "@/features/boards/components/PublicPostViewSection";

export default function PublicPostPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <Suspense fallback={<Card className="p-6 text-sm text-text-secondary">게시글 페이지를 준비하는 중입니다...</Card>}>
        <PublicPostViewSection />
      </Suspense>
    </main>
  );
}
