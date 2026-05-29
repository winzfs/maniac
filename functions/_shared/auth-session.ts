import { randomToken, sha256Base64 } from "./auth-crypto";

export const sessionCookieName = "maniac_session";
const sessionMaxAgeSeconds = 60 * 60 * 24 * 30;
const sessionMaxAgeMs = sessionMaxAgeSeconds * 1000;

export type AuthEnv = {
  DB: D1Database;
  APP_ENV?: string;
};

export type CurrentUser = {
  id: string;
  email: string;
  nickname: string;
  profile_image_url: string | null;
  provider: string | null;
};

function isProduction(env: { APP_ENV?: string }) {
  return env.APP_ENV === "production";
}

function buildCookie(value: string, env: { APP_ENV?: string }, maxAge: number) {
  const expiresAt = new Date(Date.now() + maxAge * 1000);
  return [
    `${sessionCookieName}=${value}`,
    "Path=/",
    `Max-Age=${maxAge}`,
    `Expires=${expiresAt.toUTCString()}`,
    "HttpOnly",
    "SameSite=Lax",
    isProduction(env) ? "Secure" : "",
  ].filter(Boolean).join("; ");
}

export function getSessionToken(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const parts = cookie.split(";").map((part) => part.trim());
  const prefix = `${sessionCookieName}=`;
  const found = parts.find((part) => part.startsWith(prefix));
  return found ? decodeURIComponent(found.slice(prefix.length)) : "";
}

export function setSessionCookieHeader(token: string, env: { APP_ENV?: string }) {
  return buildCookie(encodeURIComponent(token), env, sessionMaxAgeSeconds);
}

export function clearSessionCookieHeader(env: { APP_ENV?: string }) {
  return buildCookie("", env, 0);
}

export async function createAuthSession(db: D1Database, userId: string) {
  const token = randomToken(48);
  const verifierHash = await sha256Base64(token);
  const now = Date.now();
  const expiresAt = now + sessionMaxAgeMs;
  const id = `sess_${crypto.randomUUID()}`;

  await db.prepare(
    `INSERT INTO auth_sessions (id, user_id, verifier_hash, expires_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).bind(id, userId, verifierHash, expiresAt, now, now).run();

  return { token, expiresAt };
}

export async function revokeAuthSession(db: D1Database, token: string) {
  if (!token) return;
  const verifierHash = await sha256Base64(token);
  const now = Date.now();

  await db.prepare(
    `UPDATE auth_sessions
     SET revoked_at = ?, updated_at = ?
     WHERE verifier_hash = ? AND revoked_at IS NULL`,
  ).bind(now, now, verifierHash).run();
}

export async function getCurrentUser(request: Request, env: AuthEnv) {
  const token = getSessionToken(request);
  if (!token) return null;

  const verifierHash = await sha256Base64(token);
  const now = Date.now();

  return env.DB.prepare(
    `SELECT users.id, users.email, users.nickname, users.profile_image_url, users.provider
     FROM auth_sessions
     INNER JOIN users ON users.id = auth_sessions.user_id
     WHERE auth_sessions.verifier_hash = ?
       AND auth_sessions.revoked_at IS NULL
       AND auth_sessions.expires_at > ?
       AND users.deleted_at IS NULL
     LIMIT 1`,
  ).bind(verifierHash, now).first<CurrentUser>();
}
