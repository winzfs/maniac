export const EQUIPMENT_CATEGORIES = ["motorcycle", "pc", "keyboard", "bicycle", "camera", "custom"] as const;
export const USAGE_METRIC_TYPES = ["km", "hours", "days", "custom"] as const;
export const VISIBILITY_VALUES = ["public", "private", "unlisted"] as const;
export const MODERATION_STATUS_VALUES = ["normal", "hidden", "removed", "pending_review"] as const;

export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number];
export type UsageMetricType = (typeof USAGE_METRIC_TYPES)[number];
export type Visibility = (typeof VISIBILITY_VALUES)[number];
export type ModerationStatus = (typeof MODERATION_STATUS_VALUES)[number];

export type Equipment = {
  id: string;
  userId: string;
  category: EquipmentCategory;
  brand?: string | null;
  model?: string | null;
  nickname: string;
  year?: number | null;
  description?: string | null;
  slug: string;
  mainImageUrl?: string | null;
  usageMetricType: UsageMetricType;
  usageMetricValue?: number | null;
  visibility: Visibility;
  moderationStatus: ModerationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type EquipmentListFilter = {
  userId?: string;
  category?: EquipmentCategory;
  visibility?: Visibility;
  query?: string;
};
