import { hasPermission } from "@/features/permissions";
import type { AdminPermission, AdminRole } from "@/features/permissions/types";
import type { CurrentUser } from "@/server/auth";

export type AdminSession = {
  user: CurrentUser;
  role: AdminRole;
};

export function assertAdminPermission(role: AdminRole | null, permission: AdminPermission) {
  if (!role || !hasPermission(role, permission)) throw new Error("Forbidden");
}

export async function requireAdminPermission(session: AdminSession | null, permission: AdminPermission) {
  if (!session) throw new Error("Unauthorized");
  assertAdminPermission(session.role, permission);
  return session;
}
