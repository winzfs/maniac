import { z } from "zod";
import { PART_MODERATION_STATUS_VALUES, PART_VISIBILITY_VALUES } from "../types";

export const partVisibilitySchema = z.enum(PART_VISIBILITY_VALUES);
export const partModerationStatusSchema = z.enum(PART_MODERATION_STATUS_VALUES);

export const createPartSchema = z.object({
  equipmentId: z.string().min(1),
  category: z.string().trim().min(1).max(80),
  brand: z.string().trim().max(80).optional(),
  name: z.string().trim().min(1).max(120),
  price: z.number().int().nonnegative().optional(),
  installedAt: z.date().optional(),
  purchaseUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  memo: z.string().trim().max(1000).optional(),
  visibility: partVisibilitySchema.default("public"),
});

export const updatePartSchema = createPartSchema.partial().extend({
  id: z.string().min(1),
  moderationStatus: partModerationStatusSchema.optional(),
});

export const partListFilterSchema = z.object({
  equipmentId: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  query: z.string().trim().max(100).optional(),
});
