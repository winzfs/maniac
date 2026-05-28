import { z } from "zod";
export const boardPermissionSchema = z.enum(["read_public", "write_member", "write_admin", "comment_member"]);
export const postStatusSchema = z.enum(["draft", "published", "hidden", "archived"]);
const base = z.object({ boardId: z.string().min(1), title: z.string().min(1).max(120), body: z.string().min(1), status: postStatusSchema.default("draft") });
export const createPostSchema = base;
export const updatePostSchema = base.partial().omit({ boardId: true });
export const postListFilterSchema = z.object({ boardId: z.string().optional(), status: postStatusSchema.optional(), q: z.string().optional() });
