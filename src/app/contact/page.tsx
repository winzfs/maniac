import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export const metadata: Metadata = {
  title: "문의하기",
  description: "GEAR DUCK 서비스 문의, 콘텐츠 삭제 요청, 개인정보 관련 요청 안내 페이지입니다.",
  alternates: { canonical: "/contact/" },
  openGraph: {
    title: "문의하기 | GEAR DUCK",
    description: "GEAR DUCK 문의 및 요청 방법을 안내합니다.",
    url: "/contact/",
  },
};

export default function ContactPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "문의하기" }]}
        title="문의하기"
        description="서비스 이용, 콘텐츠 신고, 개인정보 관련 요청이 있다면 아래 안내를 참고해 주세요."
      />

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3 p-6">
          <h2 className="text-xl font-black tracking-[-0.03em]">서비스 문의</h2>
          <p className="text-sm leading-7 text-text-secondary">
            GEAR DUCK 기능 오류, 계정 문제, 장비 기록 또는 게시글 이용 중 문제가 있다면 문의 내용을 정리해 운영자에게 전달해 주세요.
          </p>
          <p className="text-sm font-bold text-text-primary">문의 채널은 정식 도메인/메일 연결 후 이 페이지에 추가될 예정입니다.</p>
        </Card>

        <Card className="space-y-3 p-6">
          <h2 className="text-xl font-black tracking-[-0.03em]">콘텐츠 삭제 및 개인정보 요청</h2>
          <p className="text-sm leading-7 text-text-secondary">
            본인이 작성한 콘텐츠 삭제, 권리 침해 신고, 개인정보 조회·수정·삭제 요청은 계정 정보와 대상 URL을 함께 전달해 주세요.
          </p>
          <Link href="/privacy/"><Button variant="secondary">개인정보처리방침 보기</Button></Link>
        </Card>
      </section>

      <Card variant="dark" className="space-y-4 p-6 sm:p-8">
        <p className="text-sm font-semibold text-lime-200">GEAR DUCK</p>
        <h2 className="text-2xl font-black tracking-[-0.04em]">장비 덕후들의 커뮤니티를 함께 다듬어갑니다.</h2>
        <p className="text-sm leading-7 text-zinc-300">
          서비스 초기 단계에서는 문의 채널이 제한적일 수 있습니다. 정식 운영 정보가 확정되면 이메일, 운영자 정보, 신고 접수 방법을 순차적으로 보강합니다.
        </p>
      </Card>
    </main>
  );
}
