export type CurrentUser = {
  id: string;
  email?: string | null;
  nickname?: string | null;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  // TODO: replace this stub with the real auth provider integration.
  return null;
}

export async function requireCurrentUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
