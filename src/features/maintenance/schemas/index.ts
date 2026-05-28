import { z } from "zod";
export const maintenanceBaseSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });
