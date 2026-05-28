import { z } from "zod";
import { PART_CATEGORIES } from "../types";
const base = z.object({ equipmentId: z.string().min(1), category: z.enum(PART_CATEGORIES), brand: z.string().max(120).optional(), name: z.string().min(1).max(120), price: z.number().int().min(0).optional(), installedAt: z.number().int().optional(), purchaseUrl: z.string().url().optional(), imageUrl: z.string().url().optional(), memo: z.string().max(2000).optional() });
export const createPartSchema = base;
export const updatePartSchema = base.partial().omit({ equipmentId: true });
export const partListFilterSchema = z.object({ equipmentId: z.string().optional(), category: z.enum(PART_CATEGORIES).optional(), q: z.string().optional() });
