import { Button } from "@/shared/components/ui/Button";
import { FeaturedGarageSection } from "@/features/home/components/FeaturedGarageSection";
import { HomeCtaSection, HomeUtilitySections } from "@/features/home/components/HomeUtilitySections";
import { HomeHeroSection } from "@/features/home/components/HomeHeroSection";
import Link from "next/link";

export default function HomePage() {
  return <main className="container-shell max-w-full space-y-12 overflow-x-hidden py-5 sm:py-8 lg:space-y-16 lg:py-10">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><h1 className="text-xl font-bold tracking-tight">Maniac Garage</h1><div className="flex gap-2"><Link href="/explore/"><Button variant="secondary">둘러보기</Button></Link><Link href="/garage/"><Button>내 차고 보기</Button></Link></div></header>
    <HomeHeroSection />
    <FeaturedGarageSection />
    <HomeUtilitySections />
    <HomeCtaSection />
    <footer className="py-8 text-center text-xs text-text-secondary">© Maniac Garage</footer>
  </main>;
}
