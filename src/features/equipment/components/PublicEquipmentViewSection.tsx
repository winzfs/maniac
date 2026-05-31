"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/shared/components/ui/Card";
import { PublicEquipmentDetailClient } from "./PublicEquipmentDetailClient";

export function PublicEquipmentViewSection() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const slug = searchParams.get("slug") ?? "";
  const identifier = id || slug;

  if (!identifier) {
    return (
      <main className="container-shell py-8">
        <Card className="space-y-3 p-6">
          <h1 className="text-xl font-bold">장비 id가 필요합니다.</h1>
          <p className="text-sm leading-6 text-text-secondary">예: /garage/view/?id=eq_xxx</p>
        </Card>
      </main>
    );
  }

  return <PublicEquipmentDetailClient identifier={identifier} />;
}
