import { Badge } from "@/shared/components/ui/Badge";
import { SearchBar } from "@/shared/components/ui/SearchBar";
import { HomeHeroGarageCard } from "./HomeHeroGarageCard";

export function HomeHeroSection() {
  return (
    <section className="grid gap-4 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:gap-6">
      <div className="space-y-3 sm:space-y-5">
        <Badge label="GearDuck Community" />
        <h2 className="text-3xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">장비덕후들의 기록 차고, GearDuck.</h2>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-lg sm:leading-7">내 장비의 세팅·정비·부품 기록을 남기고, 다른 덕후들의 기어와 튜닝 이야기를 둘러보세요.</p>
        <SearchBar />
      </div>
      <HomeHeroGarageCard />
    </section>
  );
}
