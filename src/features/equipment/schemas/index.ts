import { z } from "zod";
import { EQUIPMENT_VISIBILITY, MODERATION_STATUS, USAGE_METRIC_TYPES } from "../types";
export const equipmentVisibilitySchema = z.enum(EQUIPMENT_VISIBILITY);
export const moderationStatusSchema = z.enum(MODERATION_STATUS);
const base = z.object({ category: z.string().min(1), brand: z.string().optional(), model: z.string().optional(), nickname: z.string().min(1), year: z.number().int().min(1900).max(2100).optional(), description: z.string().max(3000).optional(), usageMetricType: z.enum(USAGE_METRIC_TYPES), usageMetricValue: z.number().int().min(0), mainImageUrl: z.string().url().optional(), coverPhotoId: z.string().optional(), visibility: equipmentVisibilitySchema.default("public") });
export const createEquipmentSchema = base;
export const updateEquipmentSchema = base.partial();
export const equipmentListFilterSchema = z.object({ userId: z.string().optional(), category: z.string().optional(), visibility: equipmentVisibilitySchema.optional(), moderationStatus: moderationStatusSchema.optional(), q: z.string().optional() });
