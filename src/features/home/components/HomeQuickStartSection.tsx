import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";

const quickActions = [
  {
    title: "내 장비 등록",
    description: "브랜드, 모델, 사용량, 공개 상태를 입력하고 내 차고를 시작합니다.",
    href: "/garage/new/",
    cta: "장비 등록",
  },
  {
    title: "게시판 둘러보기",
    description: "장비 자랑, 정비 기록, 부품 리뷰, 질문/상담 게시판을 탐색합니다.",
    href: "/explore/",
    cta: "둘러보기",
  },
  {
    title: "내 활동 관리",
    description: "내 작성글과 댓글, 장비 기록을 한곳에서 확인하고 관리합니다.",
    href: "/me/",
    cta: "내 정보",
  },
];

const featureCards = [
  { label: "장비 스펙", text: "브랜드, 모델, 연식, 사용량을 보기 좋게 정리" },
  { label: "정비 타임라인", text: "오일, 소모품, 점검 기록을 날짜순으로 누적" },
  { label: "부품/튜닝", text: "장착 부품, 가격, 구매 링크, 메모를 함께 보관" },
  { label: "공유 링크", text: "공개 장비 페이지로 세팅과 기록을 커뮤니티에 공유" },
];

export function HomeQuickStartSection() {
  return (
    <section className="space-y-5">
      <SectionHeader title="무엇을 할 수 있나요?" description="장비를 등록하고, 기록하고, 공개하고, 같은 취향의 사람들과 이야기하세요." />

      <div className="grid gap-4 lg:grid-cols-3">
        {quickActions.map((action) => (
          <Card key={action.title} className="flex h-full flex-col gap-4 p-5 sm:p-6">
            <div className="space-y-2">
              <h3 className="text-xl font-black tracking-tight">{action.title}</h3>
              <p className="text-sm leading-6 text-text-secondary">{action.description}</p>
            </div>
            <Link href={action.href} className="mt-auto">
              <Button className="w-full" variant={action.title === "내 장비 등록" ? "primary" : "secondary"}>{action.cta}</Button>
            </Link>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {featureCards.map((item) => (
          <Card key={item.label} className="space-y-2 p-4 sm:p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-garage-orange">{item.label}</p>
            <p className="text-sm leading-6 text-text-secondary">{item.text}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
