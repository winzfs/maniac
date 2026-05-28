import { z } from "zod";
import { MAINTENANCE_TYPES } from "../types";
const base = z.object({ equipmentId: z.string().min(1), type: z.enum(MAINTENANCE_TYPES), title: z.string().min(1).max(120), description: z.string().max(3000).optional(), performedAt: z.number().int(), usageMetricValue: z.number().int().min(0).optional(), cost: z.number().int().min(0).optional(), shopName: z.string().max(120).optional(), isPublic: z.boolean().default(true) });
export const createMaintenanceLogSchema = base;
export const updateMaintenanceLogSchema = base.partial().omit({ equipmentId: true });
export const maintenanceListFilterSchema = z.object({ equipmentId: z.string().optional(), type: z.enum(MAINTENANCE_TYPES).optional(), from: z.number().int().optional(), to: z.number().int().optional() });
