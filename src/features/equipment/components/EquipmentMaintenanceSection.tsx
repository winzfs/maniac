"use client";

import { useSearchParams } from "next/navigation";
import { MaintenanceLogPanel } from "./MaintenanceLogPanel";

export function EquipmentMaintenanceSection() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  if (!id) return null;
  return <MaintenanceLogPanel equipmentId={id} />;
}
