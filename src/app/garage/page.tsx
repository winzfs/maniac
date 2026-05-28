import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { mockEquipments } from "@/shared/data/mock-garage";
import Link from "next/link";

export default function GaragePage() {
  return (
    <main className="container-shell space-y-8 py-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-text-secondary">My Garage</p>
          <h1 className="text-3xl font-bold tracking-tight">내 차고</h1>
        </div>
        <Button>장비 추가</Button>
      </header>

      <section>
        <SectionHeader title="등록된 장비" description="현재는 정적 미리보기 데이터입니다." />
        <div className="grid gap-4 md:grid-cols-2">
          {mockEquipments.map((equipment) => (
            <Card key={equipment.id} className="space-y-4">
              <div className="h-44 rounded-2xl bg-gradient-to-br from-zinc-200 to-zinc-400" />
              <div className="space-y-1">
                <Badge label={equipment.themeLabel} tone="muted" />
                <h3 className="text-xl font-bold">{equipment.nickname}</h3>
                <p className="text-sm text-text-secondary">{equipment.brand} {equipment.model}</p>
                <p className="text-sm text-text-secondary">{equipment.usageMetricValue.toLocaleString()} {equipment.usageMetricType}</p>
              </div>
              <Link href={`/garage/${equipment.slug}/`}>
                <Button className="w-full">공개 페이지 보기</Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
