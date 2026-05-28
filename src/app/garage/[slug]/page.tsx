import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { getMockEquipmentBySlug, mockEquipments } from "@/shared/data/mock-garage";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return mockEquipments.map((equipment) => ({ slug: equipment.slug }));
}

export default function PublicEquipmentPage({ params }: { params: { slug: string } }) {
  const equipment = getMockEquipmentBySlug(params.slug);
  if (!equipment) notFound();

  return (
    <main className="container-shell space-y-10 py-6">
      <section className="space-y-5">
        <div className="h-72 rounded-[2rem] bg-gradient-to-br from-graphite via-zinc-700 to-zinc-300" />
        <div className="space-y-3">
          <Badge label={equipment.themeLabel} tone="lime" />
          <h1 className="text-4xl font-bold tracking-tight">{equipment.nickname}</h1>
          <p className="text-text-secondary">{equipment.year} {equipment.brand} {equipment.model}</p>
          <p className="max-w-2xl text-sm leading-6 text-text-secondary">{equipment.description}</p>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Card><b>{equipment.usageMetricValue.toLocaleString()}</b><p className="text-xs text-text-secondary">{equipment.usageMetricType}</p></Card>
        <Card><b>{equipment.logs.length}</b><p className="text-xs text-text-secondary">records</p></Card>
        <Card><b>{equipment.parts.length}</b><p className="text-xs text-text-secondary">parts</p></Card>
      </section>

      <section>
        <SectionHeader title="정비 타임라인" description="관리 이력을 신뢰감 있게 보여주는 핵심 영역입니다." />
        <div className="space-y-3">
          {equipment.logs.map((log) => (
            <Card key={log.id}>
              <p className="text-xs text-text-secondary">{log.performedAt} · {log.usageMetricValue.toLocaleString()} {equipment.usageMetricType}</p>
              <h2 className="mt-1 font-bold">{log.title}</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">{log.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="튜닝 부품" description="장착한 부품과 세팅을 정리합니다." />
        <div className="grid gap-3 md:grid-cols-3">
          {equipment.parts.map((part) => (
            <Card key={part.id}>
              <p className="text-xs text-text-secondary">{part.category}</p>
              <h2 className="font-bold">{part.brand}</h2>
              <p className="text-sm text-text-secondary">{part.name}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
