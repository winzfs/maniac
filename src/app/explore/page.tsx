import type { Metadata } from "next";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { ExploreBoardsClient } from "@/features/boards/components/ExploreBoardsClient";

export const metadata: Metadata = {
  title: "장비 카테고리와 커뮤니티 게시판",
  description: "바이크, 기계식 키보드, 커스텀 PC, 카메라, 캠핑 장비 등 마니아들의 장비 기록과 정비 이야기를 카테고리별로 둘러보세요.",
  alternates: { canonical: "/explore/" },
  openGraph: {
    title: "장비 카테고리와 커뮤니티 게시판 | Maniac Garage",
    description: "마니아들의 장비 기록, 정비 후기, 부품 리뷰, 질문 게시판을 카테고리별로 둘러보세요.",
    url: "/explore/",
  },
};

export default function ExplorePage() {
  return (
    <main className="container-shell space-y-10 py-5 sm:py-8 lg:space-y-14">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "장비 둘러보기" }]}
        title="장비 카테고리 둘러보기"
        description="바이크, 키보드, 커스텀 PC, 카메라, 캠핑 장비까지. 마니아들의 장비 기록과 커뮤니티 게시판을 카테고리별로 둘러보세요."
      />

      <ExploreBoardsClient />
    </main>
  );
}
