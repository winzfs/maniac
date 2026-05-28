import type { AdminRole } from "@/features/permissions/types";
export type AuthUser = { id: string; email: string; nickname: string; adminRole?: AdminRole | null };
export async function getCurrentUser(): Promise<AuthUser | null> { return null; }
