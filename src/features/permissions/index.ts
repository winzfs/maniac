import type { AdminPermission, AdminRole } from "./types";

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  owner: ["user:read","user:suspend","equipment:read","equipment:moderate","report:read","report:resolve","setting:update","billing:read","billing:update","audit:read"],
  admin: ["user:read","equipment:read","equipment:moderate","report:read","report:resolve","setting:update","billing:read","audit:read"],
  moderator: ["equipment:read","equipment:moderate","report:read","report:resolve"],
  support: ["user:read","equipment:read","billing:read"],
  viewer: ["equipment:read","report:read"]
};
export const hasPermission = (role: AdminRole, permission: AdminPermission) => ROLE_PERMISSIONS[role].includes(permission);
