import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { CategoryPostScroller } from "../CategoryPostScroller";

const timelineItems = [
  { label: "01", title: "정비 기록", text: "오일 교체, 체인 점검, 브레이크 패드 교체처럼 반복되는 관리를 누적합니다." },
  { label: "02", title: "부품 변경", text: "튜닝 파츠와 소모품 정보를 가격, 링크, 메모와 함께 남깁니다." },
  { label: "03", title: "공개 공유", text: "장비 페이지를 공개하면 세팅과 관리 이력을 한 링크로 보여줄 수 있습니다." },
];

export function HomeUtilitySections() {
  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-[0.85fr_minmax(0,1.15fr)]">
      <Card className="space-y-5 p-5 sm:p-6">
        <SectionHeader title="정비 기록을 타임라인으로" description="장비의 상태 변화와 관리 이력을 시간순으로 쌓아갑니다." />
        <div className="space-y-3">
          {timelineItems.map((item) => (
            <div key={item.label} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 rounded-2xl bg-background p-4">
              <span className="flex size-10 items-center justify-center rounded-full bg-garage-orange text-xs font-black text-white">{item.label}</span>
              <div>
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-text-secondary">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="min-w-0 overflow-hidden p-5 sm:p-6">
        <CategoryPostScroller />
      </Card>
    </section>
  );
}

export function HomeCtaSection() {
  return (
    <section>
      <Card variant="dark" className="space-y-6 p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-lime-200">Start your garage</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">지금 내 차고를 공개해보세요.</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">정비 히스토리와 튜닝 기록을 신뢰도 높은 링크로 공유하고, 같은 장비를 쓰는 사람들과 경험을 나눠보세요.</p>
        </div>
        <div className="grid gap-2 sm:flex sm:shrink-0">
          <Link href="/garage/new/"><Button className="w-full sm:w-auto">장비 등록</Button></Link>
          <Link href="/explore/"><Button className="w-full sm:w-auto" variant="secondary">둘러보기</Button></Link>
        </div>
      </Card>
    </section>
  );
}
