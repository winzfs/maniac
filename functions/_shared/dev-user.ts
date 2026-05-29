export const MOCK_USER_ID = "dev_user_maniac";
export const MOCK_USER_PRODUCTION_ERROR = "Login is required in production.";

export type MockUserEnv = {
  APP_ENV?: string;
};

export function isMockUserWriteBlocked(env: MockUserEnv) {
  return env.APP_ENV === "production";
}
