import { z } from "zod";
export const siteSectionTypeSchema = z.enum(["hero", "featured_garage", "maintenance_preview", "popular_categories", "cta"]);
const base = z.object({ pageId: z.string().min(1), type: siteSectionTypeSchema, title: z.string().min(1), body: z.string().optional(), image: z.string().url().optional(), cta: z.string().optional(), sortOrder: z.number().int().default(0), isVisible: z.boolean().default(true) });
export const createSiteSectionSchema = base;
export const updateSiteSectionSchema = base.partial().omit({ pageId: true });
export const siteSectionListFilterSchema = z.object({ pageId: z.string().optional(), type: siteSectionTypeSchema.optional(), isVisible: z.boolean().optional() });
