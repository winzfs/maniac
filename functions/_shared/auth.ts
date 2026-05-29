import { isMockUserWriteBlocked, type MockUserEnv, MOCK_USER_PRODUCTION_ERROR } from "./dev-user";
import { errorResponse } from "./http";

export function requireWritableMockUser(env: MockUserEnv) {
  if (!isMockUserWriteBlocked(env)) return null;
  return errorResponse(MOCK_USER_PRODUCTION_ERROR, 401);
}
