export type AuditInput = {
  adminUserId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  reason?: string;
  beforeValue?: unknown;
  afterValue?: unknown;
  ipAddress?: string;
  userAgent?: string;
};

export interface AuditLogAdapter {
  record(input: AuditInput): Promise<void>;
}

export class ConsoleAuditLogAdapter implements AuditLogAdapter {
  async record(input: AuditInput) {
    console.info("[admin-audit]", JSON.stringify(input));
  }
}

let adapter: AuditLogAdapter = new ConsoleAuditLogAdapter();

export function setAuditLogAdapter(nextAdapter: AuditLogAdapter) {
  adapter = nextAdapter;
}

export async function recordAdminAuditLog(input: AuditInput) {
  await adapter.record(input);
}
