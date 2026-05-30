import { Suspense } from "react";
import Link from "next/link";
import { EquipmentEditPanel } from "@/features/equipment/components/EquipmentEditPanel";
import { EquipmentMaintenanceSection } from "@/features/equipment/components/EquipmentMaintenanceSection";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";

const breadcrumbs = [
  { label: "홈", href: "/" },
  { label: "내 기어", href: "/garage/" },
  { label: "기어 수정" },
];

export default function EditEquipmentPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-10">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="기어 수정"
        description="등록한 기어의 기본 정보, 공개 상태, 관리 기록과 덕템 부품을 관리합니다."
        action={
          <Link href="/garage/">
            <Button variant="secondary">내 기어로 돌아가기</Button>
          </Link>
        }
      />

      <Suspense fallback={<Card className="p-6 text-sm text-text-secondary">수정 화면을 불러오는 중입니다...</Card>}>
        <EquipmentEditPanel />
      </Suspense>

      <Suspense fallback={<Card className="p-6 text-sm text-text-secondary">관리 기록을 불러오는 중입니다...</Card>}>
        <EquipmentMaintenanceSection />
      </Suspense>
    </main>
  );
}
