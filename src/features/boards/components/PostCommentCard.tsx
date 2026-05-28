import { Card } from "@/shared/components/ui/Card";
import type { MockComment } from "@/shared/data/mock-comments";

export function PostCommentCard({ comment }: { comment: MockComment }) {
  return (
    <Card className="space-y-2 p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
        <span className="font-bold text-text-primary">{comment.authorName}</span>
        <span>·</span>
        <span>{comment.createdAt}</span>
      </div>
      <p className="text-sm leading-6 text-text-secondary">{comment.body}</p>
    </Card>
  );
}
