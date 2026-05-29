import { MyPostEditClient } from "@/features/auth/MyPostEditClient";
import { PageHeader } from "@/shared/components/navigation/PageHeader";

export default function MyPostEditPage() {
  return (
    <main className="container-shell max-w-full space-y-8 overflow-x-hidden py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "내 정보", href: "/me/" }, { label: "내 작성글", href: "/me/posts/" }, { label: "수정" }]}
        title="게시글 수정"
        description="내가 작성한 게시글을 수정하거나 삭제합니다."
      />
      <MyPostEditClient />
    </main>
  );
}
