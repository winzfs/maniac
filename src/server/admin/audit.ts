export type AuditInput = { adminUserId: string; action: string; resourceType: string; resourceId: string; reason?: string; beforeValue?: unknown; afterValue?: unknown; ipAddress?: string; userAgent?: string; };
export async function recordAdminAuditLog(input: AuditInput) {
  console.info("[audit]", JSON.stringify(input));
}
