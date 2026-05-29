import { Suspense } from "react";
import Link from "next/link";
import { EquipmentEditPanel } from "@/features/equipment/components/EquipmentEditPanel";
import { MaintenanceLogPanel } from "@/features/equipment/components/MaintenanceLogPanel";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

const breadcrumbs = [
  { label: "홈", href: "/" },
  { label: "내 차고", href: "/garage/" },
  { label: "장비 수정" },
];

function MaintenanceLogSection({ searchParams }: { searchParams?: { id?: string } }) {
  const id = searchParams?.id ?? "";
  if (!id) return null;
  return <MaintenanceLogPanel equipmentId={id} />;
}

export default function EditEquipmentPage({ searchParams }: { searchParams?: { id?: string } }) {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-10">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="장비 수정"
        description="등록한 장비의 기본 정보, 공개 상태, 정비 기록을 관리합니다."
        action={
          <Link href="/garage/">
            <Button variant="secondary">내 차고로 돌아가기</Button>
          </Link>
        }
      />

      <Suspense fallback={<Card className="p-6 text-sm text-text-secondary">수정 화면을 불러오는 중입니다...</Card>}>
        <EquipmentEditPanel />
      </Suspense>

      <Suspense fallback={<Card className="p-6 text-sm text-text-secondary">정비 기록을 불러오는 중입니다...</Card>}>
        <MaintenanceLogSection searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
