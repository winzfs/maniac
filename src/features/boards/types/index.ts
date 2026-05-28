export type PostStatus = "draft" | "published" | "hidden" | "archived";
export type BoardPermission = "read_public" | "write_member" | "write_admin" | "comment_member";
export type Board = { id: string; slug: string; title: string; description?: string; permissions: BoardPermission[]; isVisible: boolean; };
export type Post = { id: string; boardId: string; title: string; body: string; status: PostStatus; visibility: "public" | "private"; moderationStatus: "normal" | "flagged" | "hidden"; };
export type Comment = { id: string; postId: string; body: string; status: PostStatus; };
