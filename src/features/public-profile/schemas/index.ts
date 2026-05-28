import { z } from "zod";
import { PROFILE_THEME } from "../types";
const base = z.object({ equipmentId: z.string().min(1), slug: z.string().min(2).max(60), headline: z.string().max(120).optional(), bio: z.string().max(2000).optional(), theme: z.enum(PROFILE_THEME).default("classic"), isPublished: z.boolean().default(false) });
export const createPublicProfileSchema = base;
export const updatePublicProfileSchema = base.partial().omit({ equipmentId: true });
export const publicProfileListFilterSchema = z.object({ equipmentId: z.string().optional(), isPublished: z.boolean().optional(), theme: z.enum(PROFILE_THEME).optional() });
