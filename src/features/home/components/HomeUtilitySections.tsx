import Link from "next/link";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { CategoryPostScroller } from "../CategoryPostScroller";

export function HomeUtilitySections() {
  return (
    <section className="grid min-w-0 gap-4 md:grid-cols-[0.8fr_minmax(0,1.2fr)]">
      <Card>
        <SectionHeader title="Maintenance Timeline Preview" />
        <p className="text-sm leading-6 text-text-secondary">엔진오일 교체 · 체인 점검 · 브레이크 패드 교체를 타임라인으로 정리합니다.</p>
      </Card>
      <Card className="min-w-0 overflow-hidden">
        <CategoryPostScroller />
      </Card>
    </section>
  );
}

export function HomeCtaSection() {
  return (
    <section>
      <Card variant="dark" className="p-6 sm:p-8 lg:flex lg:items-center lg:justify-between">
        <div>
          <h3 className="text-2xl font-bold">지금 내 차고를 공개해보세요.</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">정비 히스토리와 튜닝 기록을 신뢰도 높은 링크로 공유하세요.</p>
        </div>
        <Link href="/garage/">
          <Button className="mt-5 w-full lg:mt-0 lg:w-auto">무료로 시작</Button>
        </Link>
      </Card>
    </section>
  );
}
