import Link from "next/link";
import { GarageEquipmentList } from "@/features/equipment/components/GarageEquipmentList";
import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";

export default function GaragePage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-text-secondary">My Garage</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">내 차고</h1>
        </div>
        <Link href="/garage/new/" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">장비 추가</Button>
        </Link>
      </header>

      <Card variant="dark" className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_18rem] lg:items-center">
        <div>
          <Badge label="D1 Preview" tone="lime" />
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">장비 기록을 한눈에 관리하세요.</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">정비 이력, 튜닝 부품, 갤러리, 공개 페이지를 이곳에서 관리하는 구조로 확장됩니다.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm lg:grid-cols-1">
          <div className="rounded-2xl bg-white/10 p-3"><b>DB</b><p className="text-xs text-zinc-300">equipment</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><b>Next</b><p className="text-xs text-zinc-300">records</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><b>R2</b><p className="text-xs text-zinc-300">photos</p></div>
        </div>
      </Card>

      <section>
        <SectionHeader title="등록된 장비" description="D1에 저장된 장비 목록입니다." />
        <GarageEquipmentList />
      </section>
    </main>
  );
}
