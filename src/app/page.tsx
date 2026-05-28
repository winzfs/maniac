import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { HorizontalScroller } from "@/shared/components/ui/HorizontalScroller";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { CategoryPostScroller } from "@/features/home/CategoryPostScroller";
import Link from "next/link";

const featured = [{ name: "Triumph Street Triple", tag: "Roadster" }, { name: "Yamaha MT-09", tag: "Naked" }, { name: "Ninja 400", tag: "Garage Log" }];

export default function HomePage() {
  return <main className="container-shell max-w-full space-y-12 overflow-x-hidden py-5 sm:py-8 lg:space-y-16 lg:py-10">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><h1 className="text-xl font-bold tracking-tight">Maniac Garage</h1><div className="flex gap-2"><Link href="/explore/"><Button variant="secondary">둘러보기</Button></Link><Link href="/garage/"><Button>내 차고 보기</Button></Link></div></header>
    <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
      <div className="space-y-5"><Badge label="Garage Portfolio" /><h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">내 장비의 모든 기록을 가장 멋진 페이지로.</h2><p className="max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">사진, 정비 이력, 튜닝 부품, 관리 주기를 한곳에 정리하고 공유하세요.</p><SearchBar /></div>
      <Card variant="dark" className="min-h-72 overflow-hidden p-5 sm:p-6"><div className="h-44 rounded-[1.75rem] bg-gradient-to-br from-zinc-700 via-zinc-400 to-garage-orange/80" /><div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm"><div className="rounded-2xl bg-white/10 p-3"><b>18,230</b><p className="text-xs text-zinc-300">km</p></div><div className="rounded-2xl bg-white/10 p-3"><b>12</b><p className="text-xs text-zinc-300">records</p></div><div className="rounded-2xl bg-white/10 p-3"><b>8</b><p className="text-xs text-zinc-300">parts</p></div></div></Card>
    </section>
    <section><SectionHeader title="Featured Garage" description="장비 포트폴리오 미리보기" /><HorizontalScroller>{featured.map((item) => <Card key={item.name} className="min-w-64 sm:min-w-72"><div className="h-36 rounded-xl bg-zinc-200 sm:h-40" /><h3 className="mt-3 font-semibold">{item.name}</h3><p className="text-sm text-text-secondary">{item.tag}</p></Card>)}</HorizontalScroller></section>
    <section className="grid min-w-0 gap-4 md:grid-cols-[0.8fr_minmax(0,1.2fr)]"><Card><SectionHeader title="Maintenance Timeline Preview" /><p className="text-sm leading-6 text-text-secondary">엔진오일 교체 · 체인 점검 · 브레이크 패드 교체를 타임라인으로 정리합니다.</p></Card><Card className="min-w-0 overflow-hidden"><CategoryPostScroller /></Card></section>
    <section><Card variant="dark" className="p-6 sm:p-8 lg:flex lg:items-center lg:justify-between"><div><h3 className="text-2xl font-bold">지금 내 차고를 공개해보세요.</h3><p className="mt-2 max-w-xl text-sm leading-6 text-zinc-300">정비 히스토리와 튜닝 기록을 신뢰도 높은 링크로 공유하세요.</p></div><Link href="/garage/"><Button className="mt-5 w-full lg:mt-0 lg:w-auto">무료로 시작</Button></Link></Card></section>
    <footer className="py-8 text-center text-xs text-text-secondary">© Maniac Garage</footer>
  </main>;
}
