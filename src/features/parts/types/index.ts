export const PART_CATEGORIES = ["engine", "body", "electrical", "safety", "comfort", "other"] as const;
export type PartCategory = (typeof PART_CATEGORIES)[number];
export type Part = { id: string; equipmentId: string; category: PartCategory; brand?: string; name: string; price?: number; installedAt?: number; purchaseUrl?: string; imageUrl?: string; memo?: string; };
