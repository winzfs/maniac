import { Badge } from "@/shared/components/ui/Badge";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { SectionHeader } from "@/shared/components/ui/SectionHeader";
import { PageHeader } from "@/shared/components/navigation/PageHeader";

export default function MePage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader breadcrumbs={[{ label: "홈", href: "/" }, { label: "내 정보" }]} menuLabel="내 정보" />

      <section className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <Card variant="dark" className="space-y-5 p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-gradient-to-br from-garage-orange to-zinc-300" />
            <div>
              <Badge label="Mock Profile" tone="lime" />
              <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">garage_maker</h1>
              <p className="mt-1 text-sm text-zinc-300">아직 로그인 연결 전의 내 정보 미리보기입니다.</p>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-zinc-300">내 장비, 작성 글, 알림, 공개 프로필, 프리미엄 스킨 설정을 관리하는 페이지로 확장됩니다.</p>
        </Card>

        <Card className="space-y-3 p-5">
          <h2 className="font-bold">빠른 이동</h2>
          <Button className="w-full">내 차고 보기</Button>
          <Button variant="secondary" className="w-full">작성 글 관리 준비중</Button>
          <Button variant="secondary" className="w-full">프로필 설정 준비중</Button>
        </Card>
      </section>

      <section>
        <SectionHeader title="내 활동 요약" description="현재는 mock 데이터입니다. 이후 로그인/DB 연결 후 실제 활동으로 교체합니다." />
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-5"><b className="text-2xl">1</b><p className="text-xs text-text-secondary">registered equipment</p></Card>
          <Card className="p-5"><b className="text-2xl">0</b><p className="text-xs text-text-secondary">published posts</p></Card>
          <Card className="p-5"><b className="text-2xl">0</b><p className="text-xs text-text-secondary">saved reminders</p></Card>
        </div>
      </section>
    </main>
  );
}
