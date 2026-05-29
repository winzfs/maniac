"use client";

import { useSearchParams } from "next/navigation";
import { MaintenanceLogPanel } from "./MaintenanceLogPanel";
import { PartsPanel } from "./PartsPanel";

export function EquipmentMaintenanceSection() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  if (!id) return null;

  return (
    <div className="space-y-8 lg:space-y-10">
      <MaintenanceLogPanel equipmentId={id} />
      <PartsPanel equipmentId={id} />
    </div>
  );
}
