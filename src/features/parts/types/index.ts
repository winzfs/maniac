export const PART_VISIBILITY_VALUES = ["public", "private", "unlisted"] as const;
export const PART_MODERATION_STATUS_VALUES = ["normal", "hidden", "removed", "pending_review"] as const;

export type PartVisibility = (typeof PART_VISIBILITY_VALUES)[number];
export type PartModerationStatus = (typeof PART_MODERATION_STATUS_VALUES)[number];

export type Part = {
  id: string;
  equipmentId: string;
  category: string;
  brand?: string | null;
  name: string;
  price?: number | null;
  installedAt?: Date | null;
  purchaseUrl?: string | null;
  imageUrl?: string | null;
  memo?: string | null;
  visibility: PartVisibility;
  moderationStatus: PartModerationStatus;
  createdAt: Date;
  updatedAt: Date;
};

export type PartListFilter = {
  equipmentId?: string;
  category?: string;
  brand?: string;
  query?: string;
};
