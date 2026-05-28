import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SearchBar } from "@/shared/components/ui/SearchBar";

export function HomeHeroSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
      <div className="space-y-5">
        <Badge label="Garage Portfolio" />
        <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">내 장비의 모든 기록을 가장 멋진 페이지로.</h2>
        <p className="max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">사진, 정비 이력, 튜닝 부품, 관리 주기를 한곳에 정리하고 공유하세요.</p>
        <SearchBar />
      </div>
      <Card variant="dark" className="min-h-72 overflow-hidden p-5 sm:p-6">
        <div className="h-44 rounded-[1.75rem] bg-gradient-to-br from-zinc-700 via-zinc-400 to-garage-orange/80" />
        <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-2xl bg-white/10 p-3"><b>18,230</b><p className="text-xs text-zinc-300">km</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><b>12</b><p className="text-xs text-zinc-300">records</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><b>8</b><p className="text-xs text-zinc-300">parts</p></div>
        </div>
      </Card>
    </section>
  );
}
