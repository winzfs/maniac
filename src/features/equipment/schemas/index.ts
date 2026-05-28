import { z } from "zod";
export const equipmentBaseSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });
