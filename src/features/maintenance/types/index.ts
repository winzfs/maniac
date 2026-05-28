export const MAINTENANCE_TYPES = ["inspection", "repair", "replacement", "tuning", "cleaning", "other"] as const;
export type MaintenanceType = (typeof MAINTENANCE_TYPES)[number];
export type MaintenanceLog = { id: string; equipmentId: string; type: MaintenanceType; title: string; description?: string; performedAt: number; usageMetricValue?: number; cost?: number; shopName?: string; isPublic: boolean; };
