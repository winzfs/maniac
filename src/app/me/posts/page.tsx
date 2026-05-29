import { MyPostsClient } from "@/features/auth/MyPostsClient";
import { PageHeader } from "@/shared/components/navigation/PageHeader";

export default function MyPostsPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "내 정보", href: "/me/" }, { label: "내 작성글" }]}
        title="내 작성글 관리"
        description="현재 로그인한 계정으로 작성한 게시글을 모아봅니다."
      />
      <MyPostsClient />
    </main>
  );
}
