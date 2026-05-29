import { getCurrentUser, type AuthEnv } from "./auth-session";
import { errorResponse } from "./http";

export async function requireCurrentUser(request: Request, env: AuthEnv) {
  const user = await getCurrentUser(request, env);
  if (!user) return { user: null, response: errorResponse("로그인이 필요합니다.", 401) };
  return { user, response: null };
}
