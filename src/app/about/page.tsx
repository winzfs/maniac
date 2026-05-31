import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

export const metadata: Metadata = {
  title: "서비스 소개",
  description: "장비 덕후들의 커뮤니티 GEAR DUCK은 내 장비의 세팅, 정비, 부품 기록을 남기고 다른 장비 덕후들과 이야기를 나누는 공간입니다.",
  alternates: { canonical: "/about/" },
  openGraph: {
    title: "서비스 소개 | GEAR DUCK",
    description: "장비 덕후들의 커뮤니티 GEAR DUCK을 소개합니다.",
    url: "/about/",
  },
};

const features = [
  { title: "내 장비 기록", body: "오토바이, PC, 키보드, 카메라, 캠핑 장비 등 내가 아끼는 장비의 세팅과 정비 이력을 정리합니다." },
  { title: "장비 공개 페이지", body: "대표 이미지, 부품, 정비 기록을 공개 페이지로 보여주고 다른 사람에게 공유할 수 있습니다." },
  { title: "장비 커뮤니티", body: "장비 덕후들이 각자의 경험, 질문, 추천, 튜닝 기록을 게시글과 댓글로 나눕니다." },
  { title: "장비 뉴스", body: "바이크, PC, 키보드, 카메라 등 관심 장비 분야의 외부 뉴스를 모아봅니다." },
];

export default function AboutPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "서비스 소개" }]}
        title="장비 덕후들의 커뮤니티 GEAR DUCK"
        description="GEAR DUCK은 장비를 좋아하는 사람들이 자신의 기어를 기록하고, 공개하고, 이야기하는 커뮤니티입니다."
      />

      <Card variant="dark" className="space-y-4 p-6 sm:p-8">
        <p className="text-sm font-semibold text-lime-200">About GEAR DUCK</p>
        <h2 className="text-3xl font-black tracking-[-0.05em] sm:text-4xl">좋아하는 장비를 기록으로 남기고, 이야기로 연결합니다.</h2>
        <p className="max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
          장비는 단순한 물건이 아니라 취향, 습관, 시행착오가 쌓인 결과물입니다. GEAR DUCK은 그 기록을 한곳에 모아두고, 비슷한 관심사를 가진 사람들과 나눌 수 있도록 돕습니다.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href="/explore/"><Button>기어 둘러보기</Button></Link>
          <Link href="/garage/"><Button variant="secondary">내 차고 가기</Button></Link>
        </div>
      </Card>

      <section className="grid gap-3 md:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title} className="space-y-3 p-5">
            <h2 className="text-xl font-black tracking-[-0.03em]">{feature.title}</h2>
            <p className="text-sm leading-6 text-text-secondary">{feature.body}</p>
          </Card>
        ))}
      </section>
    </main>
  );
}
