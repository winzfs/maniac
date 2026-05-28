export const PROFILE_THEME = ["classic", "mono", "garage"] as const;
export type ProfileTheme = (typeof PROFILE_THEME)[number];
export type PublicProfile = { equipmentId: string; slug: string; headline?: string; bio?: string; theme: ProfileTheme; isPublished: boolean; };
