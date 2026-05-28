import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { mockEquipments } from "@/shared/data/mock-garage";
import Link from "next/link";

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
          <Badge label="Static Preview" tone="lime" />
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">장비 기록을 한눈에 관리하세요.</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-300">정비 이력, 튜닝 부품, 갤러리, 공개 페이지를 이곳에서 관리하는 구조로 확장됩니다.</p>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm lg:grid-cols-1">
          <div className="rounded-2xl bg-white/10 p-3"><b>{mockEquipments.length}</b><p className="text-xs text-zinc-300">equipment</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><b>{mockEquipments[0]?.logs.length ?? 0}</b><p className="text-xs text-zinc-300">records</p></div>
          <div className="rounded-2xl bg-white/10 p-3"><b>{mockEquipments[0]?.parts.length ?? 0}</b><p className="text-xs text-zinc-300">parts</p></div>
        </div>
      </Card>

      <section>
        <SectionHeader title="등록된 장비" description="현재는 정적 미리보기 데이터입니다." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mockEquipments.map((equipment) => (
            <Card key={equipment.id} className="flex flex-col gap-4 p-4 sm:p-5">
              <div className="aspect-[16/10] rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-400" />
              <div className="space-y-1">
                <Badge label={equipment.themeLabel} tone="muted" />
                <h3 className="text-xl font-bold">{equipment.nickname}</h3>
                <p className="text-sm text-text-secondary">{equipment.brand} {equipment.model}</p>
                <p className="text-sm text-text-secondary">{equipment.usageMetricValue.toLocaleString()} {equipment.usageMetricType}</p>
              </div>
              <Link href={`/garage/${equipment.slug}/`} className="mt-auto">
                <Button className="w-full">공개 페이지 보기</Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
