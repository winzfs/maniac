import { z } from "zod";
export const themesBaseSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });
