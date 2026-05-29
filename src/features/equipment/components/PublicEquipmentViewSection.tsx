"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/shared/components/ui/Card";
import { PublicEquipmentDetailClient } from "./PublicEquipmentDetailClient";

export function PublicEquipmentViewSection() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug") ?? "";

  if (!slug) {
    return (
      <main className="container-shell py-8">
        <Card className="space-y-3 p-6">
          <h1 className="text-xl font-bold">장비 slug가 필요합니다.</h1>
          <p className="text-sm leading-6 text-text-secondary">예: /garage/view/?slug=ninja-400</p>
        </Card>
      </main>
    );
  }

  return <PublicEquipmentDetailClient slug={slug} />;
}
