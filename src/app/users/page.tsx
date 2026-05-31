import { Suspense } from "react";
import { Card } from "@/shared/components/ui/Card";
import { PublicUserProfileClient } from "@/features/users/components/PublicUserProfileClient";

export default function PublicUserPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <Suspense fallback={<Card className="p-6 text-sm text-text-secondary">프로필 페이지를 준비하는 중입니다...</Card>}>
        <PublicUserProfileClient />
      </Suspense>
    </main>
  );
}
