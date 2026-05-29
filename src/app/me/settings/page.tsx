import { ProfileSettingsClient } from "@/features/auth/ProfileSettingsClient";
import { PageHeader } from "@/shared/components/navigation/PageHeader";

export default function MeSettingsPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-10">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "내 정보", href: "/me/" }, { label: "프로필 설정" }]}
        title="프로필 설정"
        description="닉네임과 소개글을 수정합니다. 프로필 이미지는 이미지 업로드 단계에서 연결합니다."
      />

      <ProfileSettingsClient />
    </main>
  );
}
