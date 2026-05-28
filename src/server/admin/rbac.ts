import { hasPermission } from "@/features/permissions";
import type { AdminPermission, AdminRole } from "@/features/permissions/types";
import { getCurrentUser } from "@/server/auth";

export type AdminAccessContext = { userId: string; role: AdminRole };

export async function requireAdminPermission(permission: AdminPermission): Promise<AdminAccessContext> {
  const user = await getCurrentUser();
  const role = user?.adminRole ?? null;
  if (!user || !role || !hasPermission(role, permission)) throw new Error("Forbidden");
  return { userId: user.id, role };
}
