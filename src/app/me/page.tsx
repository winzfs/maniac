import { MeProfileClient } from "@/features/auth/MeProfileClient";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { Card } from "@/shared/components/ui/Card";

export default function MePage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader breadcrumbs={[{ label: "홈", href: "/" }, { label: "내 정보" }]} />

      <MeProfileClient />

      <section>
        <SectionHeader title="내 활동 요약" description="로그인/DB 연결 후 실제 활동 요약으로 확장합니다." />
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-5"><b className="text-2xl">-</b><p className="text-xs text-text-secondary">registered equipment</p></Card>
          <Card className="p-5"><b className="text-2xl">-</b><p className="text-xs text-text-secondary">published posts</p></Card>
          <Card className="p-5"><b className="text-2xl">-</b><p className="text-xs text-text-secondary">saved reminders</p></Card>
        </div>
      </section>
    </main>
  );
}
