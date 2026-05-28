import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { HorizontalScroller } from "@/shared/components/ui/HorizontalScroller";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import Link from "next/link";

const featured = [{ name: "Triumph Street Triple", tag: "Roadster" }, { name: "Yamaha MT-09", tag: "Naked" }];

export default function HomePage() {
  return <main className="container-shell space-y-10 py-6">
    <header className="flex items-center justify-between"><h1 className="text-xl font-bold">Maniac Garage</h1><Link href="/garage/"><Button>내 차고 보기</Button></Link></header>
    <section className="space-y-4"><Badge label="Garage Portfolio" /><h2 className="text-3xl font-bold leading-tight">내 장비의 모든 기록을 가장 멋진 페이지로.</h2><p className="text-text-secondary">사진, 정비 이력, 튜닝 부품, 관리 주기를 한곳에 정리하고 공유하세요.</p><SearchBar /></section>
    <section><SectionHeader title="Featured Garage" description="장비 포트폴리오 미리보기" /><HorizontalScroller>{featured.map((item) => <Card key={item.name} className="min-w-64"><div className="h-32 rounded-xl bg-zinc-200" /><h3 className="mt-3 font-semibold">{item.name}</h3><p className="text-sm text-text-secondary">{item.tag}</p></Card>)}</HorizontalScroller></section>
    <section><SectionHeader title="Maintenance Timeline Preview" /><Card><p className="text-sm">엔진오일 교체 · 체인 점검 · 브레이크 패드 교체</p></Card></section>
    <section><SectionHeader title="Popular Categories" /><HorizontalScroller><Card className="min-w-44">바이크</Card><Card className="min-w-44">커스텀 PC</Card><Card className="min-w-44">카메라</Card></HorizontalScroller></section>
    <section><Card variant="dark"><h3 className="text-xl font-bold">지금 내 차고를 공개해보세요.</h3><p className="mt-2 text-sm text-zinc-300">정비 히스토리와 튜닝 기록을 신뢰도 높은 링크로 공유하세요.</p><Link href="/garage/"><Button className="mt-4">무료로 시작</Button></Link></Card></section>
    <footer className="py-8 text-center text-xs text-text-secondary">© Maniac Garage</footer>
  </main>;
}
