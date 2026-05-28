export type AuditInput = { adminUserId: string; action: string; resourceType: string; resourceId: string; reason?: string; beforeValueJson?: string; afterValueJson?: string; ipAddress?: string; userAgent?: string; };
export interface AdminAuditLogWriter { write(input: AuditInput): Promise<void>; }
export class ConsoleAuditLogWriter implements AdminAuditLogWriter { async write(input: AuditInput): Promise<void> { console.info("[audit]", JSON.stringify(input)); } }
let writer: AdminAuditLogWriter = new ConsoleAuditLogWriter();
export function setAuditLogWriter(next: AdminAuditLogWriter) { writer = next; }
export async function recordAdminAuditLog(input: AuditInput) { await writer.write(input); }
