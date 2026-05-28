import { hasPermission } from "@/features/permissions";
import type { AdminPermission, AdminRole } from "@/features/permissions/types";

export const requireAdminPermission = (role: AdminRole | null, permission: AdminPermission) => {
  if (!role || !hasPermission(role, permission)) throw new Error("Forbidden");
};
