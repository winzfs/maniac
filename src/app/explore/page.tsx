import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { ExploreBoardsClient } from "@/features/boards/components/ExploreBoardsClient";

export default function ExplorePage() {
  return (
    <main className="container-shell space-y-10 py-5 sm:py-8 lg:space-y-14">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "장비 둘러보기" }]}
        menuLabel="장비 메뉴"
        title="장비 카테고리 둘러보기"
        description="카테고리와 게시판은 D1 데이터베이스의 공개 게시판 메타데이터를 기준으로 표시됩니다."
      />

      <ExploreBoardsClient />
    </main>
  );
}
