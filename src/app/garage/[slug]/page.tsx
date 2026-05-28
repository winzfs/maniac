import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { getMockEquipmentBySlug, mockEquipments } from "@/shared/data/mock-garage";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return mockEquipments.map((equipment) => ({ slug: equipment.slug }));
}

export default async function PublicEquipmentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const equipment = getMockEquipmentBySlug(slug);
  if (!equipment) notFound();

  return (
    <main className="container-shell space-y-10 py-5 sm:py-8 lg:space-y-14">
      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
        <div className="aspect-[16/11] rounded-[2rem] bg-gradient-to-br from-graphite via-zinc-700 to-zinc-300 sm:aspect-[16/9]" />
        <div className="space-y-4 lg:pb-2">
          <Badge label={equipment.themeLabel} tone="lime" />
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{equipment.nickname}</h1>
          <p className="text-sm text-text-secondary sm:text-base">{equipment.year} {equipment.brand} {equipment.model}</p>
          <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base sm:leading-7">{equipment.description}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="p-5"><b className="text-2xl">{equipment.usageMetricValue.toLocaleString()}</b><p className="text-xs text-text-secondary">{equipment.usageMetricType}</p></Card>
        <Card className="p-5"><b className="text-2xl">{equipment.logs.length}</b><p className="text-xs text-text-secondary">records</p></Card>
        <Card className="p-5"><b className="text-2xl">{equipment.parts.length}</b><p className="text-xs text-text-secondary">parts</p></Card>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div>
          <SectionHeader title="정비 타임라인" description="관리 이력을 신뢰감 있게 보여주는 핵심 영역입니다." />
          <div className="space-y-3">
            {equipment.logs.map((log) => (
              <Card key={log.id} className="p-5">
                <p className="text-xs text-text-secondary">{log.performedAt} · {log.usageMetricValue.toLocaleString()} {equipment.usageMetricType}</p>
                <h2 className="mt-2 text-lg font-bold">{log.title}</h2>
                <p className="mt-2 text-sm leading-6 text-text-secondary">{log.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <aside>
          <SectionHeader title="튜닝 부품" description="장착한 부품과 세팅을 정리합니다." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {equipment.parts.map((part) => (
              <Card key={part.id} className="p-5">
                <p className="text-xs text-text-secondary">{part.category}</p>
                <h2 className="mt-1 font-bold">{part.brand}</h2>
                <p className="text-sm text-text-secondary">{part.name}</p>
              </Card>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
