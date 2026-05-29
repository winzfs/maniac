import { getCurrentUser, type AuthEnv } from "./auth-session";
import { isMockUserWriteBlocked, type MockUserEnv, MOCK_USER_PRODUCTION_ERROR } from "./dev-user";
import { errorResponse } from "./http";

export function requireWritableMockUser(env: MockUserEnv) {
  if (!isMockUserWriteBlocked(env)) return null;
  return errorResponse(MOCK_USER_PRODUCTION_ERROR, 401);
}

export async function requireCurrentUser(request: Request, env: AuthEnv) {
  const user = await getCurrentUser(request, env);
  if (!user) return { user: null, response: errorResponse("로그인이 필요합니다.", 401) };
  return { user, response: null };
}
