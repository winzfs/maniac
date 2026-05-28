import { z } from "zod";
export const permissionsBaseSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });
