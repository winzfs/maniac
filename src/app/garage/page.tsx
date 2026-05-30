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
          <p className="text-sm text-text-secondary">My Gear</p>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">내 기어</h1>
        </div>
        <Link href="/garage/new/" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto">내 기어 등록</Button>
        </Link>
      </header>

      <Card variant="dark" className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_18rem] lg:items-center">
        <div>
          <Badge label="GearDuck" tone="lime" />
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">내 장비덕질 기록을 한눈에 관리하세요.</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">세팅, 관리 이력, 덕템 부품, 공개 자랑 페이지를 이곳에서 관리합니다.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm lg:grid-cols-1">
          <div className="rounded-2xl bg-white/10 p-3"><b>Gear</b><p className="text-xs text-zinc-300">profile</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><b>Log</b><p className="text-xs text-zinc-300">records</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><b>Ducks</b><p className="text-xs text-zinc-300">community</p></div>
        </div>
      </Card>

      <section>
        <SectionHeader title="등록된 기어" description="내가 등록한 장비와 덕질 기록 목록입니다." />
        <GarageEquipmentList />
      </section>
    </main>
  );
}
