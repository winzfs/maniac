import { z } from "zod";
export const site_contentBaseSchema = z.object({ id: z.string().min(1), name: z.string().min(1) });
