import type { Metadata } from "next";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { Card } from "@/shared/components/ui/Card";

export const metadata: Metadata = {
  title: "이용약관",
  description: "GEAR DUCK 이용약관입니다. 계정, 사용자 콘텐츠, 이미지 업로드, 커뮤니티 이용 기준을 안내합니다.",
  alternates: { canonical: "/terms/" },
  openGraph: {
    title: "이용약관 | GEAR DUCK",
    description: "GEAR DUCK 서비스 이용 기준을 안내합니다.",
    url: "/terms/",
  },
};

const sections = [
  { title: "1. 목적", body: "이 약관은 장비 덕후들의 커뮤니티 GEAR DUCK의 이용 조건과 사용자 및 서비스 운영자 간 권리, 의무, 책임 사항을 정합니다." },
  { title: "2. 계정 이용", body: "사용자는 정확한 이메일과 닉네임을 기반으로 계정을 만들 수 있습니다. 계정 관리 책임은 사용자에게 있으며, 부정 이용이 확인되면 이용이 제한될 수 있습니다." },
  { title: "3. 사용자 콘텐츠", body: "사용자가 등록한 장비 정보, 이미지, 게시글, 댓글의 책임은 사용자에게 있습니다. 타인의 권리 침해, 불법 정보, 혐오·음란·스팸성 콘텐츠는 제한될 수 있습니다." },
  { title: "4. 이미지 업로드", body: "장비 사진, 부품 사진, 프로필 이미지, 게시글 이미지는 서비스 제공을 위해 외부 이미지 저장소에 저장될 수 있습니다. 사용자는 본인이 권리를 가진 이미지만 업로드해야 합니다." },
  { title: "5. 외부 뉴스", body: "장비 뉴스는 외부 출처의 링크를 모아 보여주는 기능입니다. 원문 저작권과 기사 내용의 책임은 각 제공처에 있습니다." },
  { title: "6. 서비스 변경", body: "GEAR DUCK은 안정적인 운영을 위해 기능, 정책, 화면 구성을 변경하거나 일부 기능을 중단할 수 있습니다." },
  { title: "7. 문의", body: "서비스 이용과 관련한 문의는 문의하기 페이지를 통해 접수할 수 있습니다." },
];

export default function TermsPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "이용약관" }]}
        title="이용약관"
        description="GEAR DUCK을 안전하고 즐겁게 이용하기 위한 기본 약관입니다."
      />

      <Card className="space-y-6 p-6 sm:p-8">
        <p className="text-sm text-text-secondary">시행일: 2026년 6월 1일</p>
        {sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="text-lg font-black tracking-[-0.03em]">{section.title}</h2>
            <p className="text-sm leading-7 text-text-secondary">{section.body}</p>
          </section>
        ))}
      </Card>
    </main>
  );
}
