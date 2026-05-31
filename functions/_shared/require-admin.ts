import { getCurrentUser, type AuthEnv } from "./auth-session";
import { errorResponse } from "./http";
import { isAdminUser } from "./admin";

export async function requireAdminUser(request: Request, env: AuthEnv) {
  const user = await getCurrentUser(request, env);
  if (!user) return { user: null, response: errorResponse("로그인이 필요합니다.", 401) };
  if (!isAdminUser(user)) return { user: null, response: errorResponse("관리자 권한이 필요합니다.", 403) };
  return { user, response: null };
}
