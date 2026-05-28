import { z } from "zod";
export const adminBaseSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });
