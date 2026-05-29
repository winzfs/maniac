import { Suspense } from "react";
import { PublicEquipmentViewSection } from "@/features/equipment/components/PublicEquipmentViewSection";
import { Card } from "@/shared/components/ui/Card";

export default function GaragePublicViewPage() {
  return (
    <Suspense fallback={<main className="container-shell py-8"><Card className="p-6 text-sm text-text-secondary">공개 장비 페이지를 준비하는 중입니다...</Card></main>}>
      <PublicEquipmentViewSection />
    </Suspense>
  );
}
