import { AuthForm } from "@/features/auth/AuthForm";
import { PageHeader } from "@/shared/components/navigation/PageHeader";

export default function SignupPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader
        breadcrumbs={[{ label: "홈", href: "/" }, { label: "회원가입" }]}
        title="회원가입"
        description="Maniac Garage 계정을 만듭니다."
      />
      <AuthForm mode="signup" />
    </main>
  );
}
