export type AdminRole = "owner" | "admin" | "moderator" | "support" | "viewer";
export type AdminPermission =
  | "user:read" | "user:suspend" | "equipment:read" | "equipment:moderate"
  | "report:read" | "report:resolve" | "setting:update" | "billing:read"
  | "billing:update" | "audit:read";
