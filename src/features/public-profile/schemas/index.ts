import { z } from "zod";
export const public_profileBaseSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });
