export const EQUIPMENT_VISIBILITY = ["public", "unlisted", "private"] as const;
export const MODERATION_STATUS = ["normal", "flagged", "hidden"] as const;
export const USAGE_METRIC_TYPES = ["distance_km", "distance_mi", "hours", "cycles", "custom"] as const;
export type EquipmentVisibility = (typeof EQUIPMENT_VISIBILITY)[number];
export type ModerationStatus = (typeof MODERATION_STATUS)[number];
export type UsageMetricType = (typeof USAGE_METRIC_TYPES)[number];
export type Equipment = { id: string; userId: string; category: string; brand?: string; model?: string; nickname: string; year?: number; description?: string; usageMetricType: UsageMetricType; usageMetricValue: number; mainImageUrl?: string; coverPhotoId?: string; visibility: EquipmentVisibility; moderationStatus: ModerationStatus; };
