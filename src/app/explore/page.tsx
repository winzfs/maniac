import type { Metadata } from "next";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { ExploreBoardsClient } from "@/features/boards/components/ExploreBoardsClient";

export const metadata: Metadata = {
  title: "기어 둘러보기와 커뮤니티",
  description: "바이크, 기계식 키보드, 커스텀 PC, 카메라, 캠핑 장비까지. 장비덕후들의 기어 기록, 정비 후기, 부품 리뷰를 카테고리별로 둘러보세요.",
  alternates: { canonical: "/explore/" },
  openGraph: {
    title: "기어 둘러보기와 커뮤니티 | GearDuck",
    description: "장비덕후들의 기어 기록, 정비 후기, 부품 리뷰, 질문 게시판을 카테고리별로 둘러보세요.",
    url: "/explore/",
  },
};

export default function ExplorePage() {
  return (
    <main className="container-shell space-y-10 py-5 sm:py-8 lg:space-y-14">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "기어 둘러보기" }]}
        title="기어 둘러보기"
        description="바이크, 키보드, 커스텀 PC, 카메라, 캠핑 장비까지. 장비덕후들의 기어 기록과 커뮤니티 게시판을 둘러보세요."
      />

      <ExploreBoardsClient />
    </main>
  );
}
