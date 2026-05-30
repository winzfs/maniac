import Link from "next/link";
import { EquipmentForm } from "@/features/equipment/components/EquipmentForm";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { Button } from "@/shared/components/ui/Button";

const breadcrumbs = [
  { label: "홈", href: "/" },
  { label: "내 기어", href: "/garage/" },
  { label: "기어 등록" },
];

export default function NewEquipmentPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-10">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="내 기어 등록"
        description="덕질 중인 장비의 기본 정보와 공개 상태를 먼저 등록합니다. 관리 기록, 덕템 부품, 사진은 등록 후 이어서 채워 넣을 수 있습니다."
        action={
          <Link href="/garage/">
            <Button variant="secondary">내 기어로 돌아가기</Button>
          </Link>
        }
      />

      <EquipmentForm />
    </main>
  );
}
