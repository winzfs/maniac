import { CategoryPostScroller } from "@/features/home/CategoryPostScroller";
import { FeaturedGarageSection } from "@/features/home/components/FeaturedGarageSection";
import { HomeCtaSection, HomeUtilitySections } from "@/features/home/components/HomeUtilitySections";
import { HomeHeroSection } from "@/features/home/components/HomeHeroSection";
import { HomeNewsSection } from "@/features/home/components/HomeNewsSection";
import { HomePostFeedSection } from "@/features/home/components/HomePostFeedSection";
import { Card } from "@/shared/components/ui/Card";
import { MenuButton } from "@/shared/components/navigation/MenuButton";
import Link from "next/link";

export default function HomePage() {
  return <main className="container-shell max-w-full space-y-12 overflow-x-hidden py-5 sm:py-8 lg:space-y-16 lg:py-10">
    <header className="relative flex min-h-32 items-center justify-center sm:min-h-36 lg:min-h-40">
      <Link href="/" aria-label="홈으로 이동" className="inline-flex items-center justify-center">
        <img src="/img/logo.png" alt="GearDuck" className="h-28 w-auto sm:h-32 lg:h-36" />
      </Link>
      <div className="absolute right-0 top-[calc(50%-1.5rem)] sm:top-[calc(50%-1.75rem)]">
        <MenuButton />
      </div>
    </header>
    <HomeHeroSection />
    <Card className="min-w-0 overflow-hidden p-5 sm:p-6">
      <CategoryPostScroller />
    </Card>
    <HomePostFeedSection />
    <FeaturedGarageSection />
    <HomeNewsSection />
    <HomeUtilitySections />
    <HomeCtaSection />
    <footer className="py-8 text-center text-xs text-text-secondary">© GearDuck · 장비덕후들의 기록 차고</footer>
  </main>;
}
