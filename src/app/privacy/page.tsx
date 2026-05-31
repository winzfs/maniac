import type { Metadata } from "next";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { Card } from "@/shared/components/ui/Card";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "GEAR DUCK 개인정보처리방침입니다. 수집 항목, 이용 목적, 보관 위치, 삭제 요청 방법을 안내합니다.",
  alternates: { canonical: "/privacy/" },
  openGraph: {
    title: "개인정보처리방침 | GEAR DUCK",
    description: "GEAR DUCK의 개인정보 처리 기준을 안내합니다.",
    url: "/privacy/",
  },
};

const sections = [
  { title: "1. 수집하는 정보", body: "GEAR DUCK은 계정 생성과 서비스 제공을 위해 이메일, 닉네임, 비밀번호 인증 정보, 프로필 이미지, 장비 이미지, 장비 기록, 게시글, 댓글 정보를 처리할 수 있습니다." },
  { title: "2. 이용 목적", body: "수집한 정보는 로그인 및 계정 관리, 장비 기록 저장, 공개 장비 페이지 제공, 커뮤니티 게시글·댓글 운영, 부정 이용 방지, 문의 대응에 사용됩니다." },
  { title: "3. 저장 및 처리 위치", body: "계정과 콘텐츠 데이터는 Cloudflare D1에 저장되며, 사용자가 업로드한 이미지는 Cloudinary 등 이미지 저장소에 저장될 수 있습니다." },
  { title: "4. 외부 서비스", body: "이미지 업로드와 정적 사이트 제공, 데이터 저장을 위해 Cloudflare, Cloudinary 등 외부 인프라 서비스를 사용할 수 있습니다." },
  { title: "5. 보관 기간", body: "회원 탈퇴 또는 삭제 요청 시 관련 정보를 삭제하거나 비식별화합니다. 다만 법령 준수, 분쟁 대응, 부정 이용 방지를 위해 필요한 정보는 일정 기간 보관될 수 있습니다." },
  { title: "6. 사용자 권리", body: "사용자는 본인의 개인정보 조회, 수정, 삭제를 요청할 수 있습니다. 계정 또는 콘텐츠 삭제 요청은 문의하기 페이지를 통해 접수할 수 있습니다." },
  { title: "7. 정책 변경", body: "개인정보처리방침이 변경되는 경우 서비스 내 공지 또는 본 페이지 업데이트를 통해 안내합니다." },
];

export default function PrivacyPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "개인정보처리방침" }]}
        title="개인정보처리방침"
        description="GEAR DUCK은 서비스 제공에 필요한 최소한의 정보를 처리하고, 사용자의 장비 기록과 커뮤니티 활동 정보를 안전하게 관리하기 위해 노력합니다."
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
