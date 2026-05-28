import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import type { MockComment } from "@/shared/data/mock-comments";
import { PostCommentCard } from "./PostCommentCard";

export function PostCommentSection({ comments }: { comments: MockComment[] }) {
  return (
    <section className="space-y-4">
      <SectionHeader title={`댓글 ${comments.length}`} description="현재는 정적 mock 댓글입니다. 이후 DB comments와 연결합니다." />

      <Card className="space-y-3 p-4 sm:p-5">
        <label htmlFor="comment" className="text-sm font-bold">댓글 작성</label>
        <textarea
          id="comment"
          name="comment"
          className="min-h-28 w-full resize-y rounded-2xl border border-border bg-background p-4 text-base leading-6 outline-none focus:border-graphite sm:text-sm"
          placeholder="댓글을 입력하세요"
        />
        <div className="flex justify-end">
          <Button type="button">댓글 등록 준비중</Button>
        </div>
      </Card>

      <div className="space-y-3">
        {comments.length > 0 ? comments.map((comment) => <PostCommentCard key={comment.id} comment={comment} />) : (
          <Card className="p-5 text-sm leading-6 text-text-secondary">아직 댓글이 없습니다. 첫 댓글을 남겨보세요.</Card>
        )}
      </div>
    </section>
  );
}
