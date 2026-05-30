import type { Metadata } from "next";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { NewsBoardClient } from "@/features/news/components/NewsBoardClient";

export const metadata: Metadata = {
  title: "장비 뉴스 게시판",
  description: "바이크, PC, 키보드, 자전거, 카메라, 캠핑, 오디오 장비 뉴스를 카테고리별로 둘러보세요.",
  alternates: { canonical: "/explore/news/" },
  openGraph: {
    title: "장비 뉴스 게시판 | GearDuck",
    description: "장비덕후들을 위한 최신 장비 뉴스를 카테고리별로 모아봅니다.",
    url: "/explore/news/",
  },
};

export default function NewsBoardPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "기어 둘러보기", href: "/explore/" }, { label: "장비 뉴스" }]}
        title="장비 뉴스"
        description="바이크, PC, 키보드, 자전거, 카메라, 캠핑, 오디오 장비 뉴스를 카테고리별로 둘러보세요."
      />

      <NewsBoardClient />
    </main>
  );
}
