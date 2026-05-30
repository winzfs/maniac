import { FeaturedGarageSection } from "@/features/home/components/FeaturedGarageSection";
import { HomeCtaSection, HomeUtilitySections } from "@/features/home/components/HomeUtilitySections";
import { HomeHeroSection } from "@/features/home/components/HomeHeroSection";
import { HomeNewsSection } from "@/features/home/components/HomeNewsSection";
import { HomePostFeedSection } from "@/features/home/components/HomePostFeedSection";
import { MenuButton } from "@/shared/components/navigation/MenuButton";
import { Button } from "@/shared/components/ui/Button";
import Link from "next/link";

export default function HomePage() {
  return <main className="container-shell max-w-full space-y-12 overflow-x-hidden py-5 sm:py-8 lg:space-y-16 lg:py-10">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><h1 className="text-xl font-bold tracking-tight">Maniac Garage</h1><div className="flex flex-wrap items-center gap-2"><MenuButton /><Link href="/garage/"><Button>내 차고 보기</Button></Link></div></header>
    <HomeHeroSection />
    <HomeNewsSection />
    <HomePostFeedSection />
    <FeaturedGarageSection />
    <HomeUtilitySections />
    <HomeCtaSection />
    <footer className="py-8 text-center text-xs text-text-secondary">© Maniac Garage</footer>
  </main>;
}
