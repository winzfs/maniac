import { AuthForm } from "@/features/auth/AuthForm";
import { PageHeader } from "@/shared/components/navigation/PageHeader";

export default function LoginPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "로그인" }]}
        title="로그인"
        description="Maniac Garage 계정으로 로그인합니다."
      />
      <AuthForm mode="login" />
    </main>
  );
}
