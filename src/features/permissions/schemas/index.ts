import { z } from "zod";
import { ROLE_PERMISSIONS } from "..";
export const adminRoleSchema = z.enum(Object.keys(ROLE_PERMISSIONS) as [keyof typeof ROLE_PERMISSIONS, ...(keyof typeof ROLE_PERMISSIONS)[]]);
export const adminPermissionSchema = z.enum(["user:read","user:suspend","equipment:read","equipment:moderate","report:read","report:resolve","setting:update","billing:read","billing:update","audit:read"]);
export const rolePermissionFilterSchema = z.object({ role: adminRoleSchema.optional(), permission: adminPermissionSchema.optional() });
