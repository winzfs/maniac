import { z } from "zod";
import { EQUIPMENT_CATEGORIES, MODERATION_STATUS_VALUES, USAGE_METRIC_TYPES, VISIBILITY_VALUES } from "../types";

export const equipmentCategorySchema = z.enum(EQUIPMENT_CATEGORIES);
export const usageMetricTypeSchema = z.enum(USAGE_METRIC_TYPES);
export const visibilitySchema = z.enum(VISIBILITY_VALUES);
export const moderationStatusSchema = z.enum(MODERATION_STATUS_VALUES);
export const equipmentSlugSchema = z.string().trim().min(2).max(80).regex(/^[a-z0-9-]+$/);

export const createEquipmentSchema = z.object({
  category: equipmentCategorySchema.default("motorcycle"),
  brand: z.string().trim().max(80).optional(),
  model: z.string().trim().max(120).optional(),
  nickname: z.string().trim().min(1).max(80),
  year: z.number().int().min(1900).max(2100).optional(),
  description: z.string().trim().max(1000).optional(),
  slug: equipmentSlugSchema.optional(),
  mainImageUrl: z.string().url().optional(),
  usageMetricType: usageMetricTypeSchema.default("km"),
  usageMetricValue: z.number().int().nonnegative().optional(),
  visibility: visibilitySchema.default("private"),
});

export const updateEquipmentSchema = createEquipmentSchema.partial().extend({
  id: z.string().min(1),
  moderationStatus: moderationStatusSchema.optional(),
});

export const equipmentListFilterSchema = z.object({
  userId: z.string().optional(),
  category: equipmentCategorySchema.optional(),
  visibility: visibilitySchema.optional(),
  query: z.string().trim().max(100).optional(),
});
