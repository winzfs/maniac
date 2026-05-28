export const ADMIN_ACTIONS = ["hide_content", "restore_content", "suspend_user", "resolve_report"] as const;
export type AdminAction = (typeof ADMIN_ACTIONS)[number];
export type AdminAuditPayload = { action: AdminAction; resourceType: string; resourceId: string; beforeValueJson?: string; afterValueJson?: string; reason?: string; ipAddress?: string; userAgent?: string; };
