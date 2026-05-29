import { Badge } from "@/shared/components/ui/Badge";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { HomeHeroGarageCard } from "./HomeHeroGarageCard";

export function HomeHeroSection() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
      <div className="space-y-5">
        <Badge label="Garage Portfolio" />
        <h2 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">내 장비의 모든 기록을 가장 멋진 페이지로.</h2>
        <p className="max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">사진, 정비 이력, 튜닝 부품, 관리 주기를 한곳에 정리하고 공유하세요.</p>
        <SearchBar />
      </div>
      <HomeHeroGarageCard />
    </section>
  );
}
