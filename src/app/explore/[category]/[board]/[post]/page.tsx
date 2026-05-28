import { Badge } from "@/shared/components/ui/Badge";
import { Card } from "@/shared/components/ui/Card";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { PostCommentSection } from "@/features/boards/components/PostCommentSection";
import { equipmentCategories, getEquipmentCategory } from "@/shared/data/equipment-categories";
import { getMockCommentsByPostId } from "@/shared/data/mock-comments";
import { mockBoardPosts } from "@/shared/data/mock-board-posts";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return equipmentCategories.flatMap((category) =>
    category.boards.flatMap((board) =>
      mockBoardPosts
        .filter((post) => post.boardSlug === board.slug)
        .map((post) => ({ category: category.slug, board: board.slug, post: post.id })),
    ),
  );
}

export default async function BoardPostDetailPage({ params }: { params: Promise<{ category: string; board: string; post: string }> }) {
  const { category: categorySlug, board: boardSlug, post: postId } = await params;
  const category = getEquipmentCategory(categorySlug);
  const board = category?.boards.find((item) => item.slug === boardSlug);
  const post = mockBoardPosts.find((item) => item.id === postId && item.boardSlug === boardSlug);

  if (!category || !board || !post) notFound();

  const comments = getMockCommentsByPostId(post.id);

  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "장비 둘러보기", href: "/explore/" }, { label: category.label, href: `/explore/${category.slug}/` }, { label: board.title, href: `/explore/${category.slug}/${board.slug}/` }, { label: "게시글" }]}
        menuLabel={category.label}
        title={post.title}
        description={post.excerpt}
      />

      <article className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <div className="min-w-0 space-y-5">
          <Card className="space-y-6 p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              <Badge label={board.title} tone={board.type === "trade" ? "orange" : "muted"} />
              <span>{post.authorName}</span>
              <span>·</span>
              <span>{post.createdAt}</span>
              <span>·</span>
              <span>{comments.length} comments</span>
              <span>·</span>
              <span>{post.likeCount} likes</span>
            </div>

            {post.hasImage ? <div className="aspect-[16/9] rounded-[1.75rem] bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-500" /> : null}

            <div className="space-y-4 text-sm leading-7 text-text-secondary sm:text-base sm:leading-8">
              <p>{post.excerpt}</p>
              <p>이 화면은 실제 게시글 상세 연결 전 레이아웃과 정보 구조를 확인하기 위한 mock 상세 페이지입니다.</p>
              <p>이후 DB 기반 게시글 본문, 댓글, 이미지, 작성자 프로필, 신고/숨김 상태를 이 구조에 연결합니다.</p>
            </div>
          </Card>

          <PostCommentSection comments={comments} />
        </div>

        <aside className="min-w-0 space-y-3">
          <Card variant="dark" className="p-5">
            <p className="text-sm text-zinc-300">게시판</p>
            <h2 className="mt-1 text-xl font-bold">{board.title}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{board.description}</p>
          </Card>
          <Card className="p-5">
            <p className="text-sm font-bold">상태</p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">현재는 정적 mock 상세입니다. 다음 단계에서 comments와 post body를 DB로 연결합니다.</p>
          </Card>
        </aside>
      </article>
    </main>
  );
}
