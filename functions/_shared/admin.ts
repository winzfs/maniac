import type { CurrentUser } from "./auth-session";

const adminEmails = new Set(["jazzhjm@gmail.com"]);

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(email && adminEmails.has(email.trim().toLowerCase()));
}

export function isAdminUser(user: CurrentUser | null | undefined) {
  return isAdminEmail(user?.email);
}
