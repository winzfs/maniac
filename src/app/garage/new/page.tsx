import Link from "next/link";
import { EquipmentForm } from "@/features/equipment/components/EquipmentForm";
import { PageHeader } from "@/shared/components/navigation/PageHeader";
import { Button } from "@/shared/components/ui/Button";

const breadcrumbs = [
  { label: "홈", href: "/" },
  { label: "내 차고", href: "/garage/" },
  { label: "장비 추가" },
];

export default function NewEquipmentPage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-10">
      <PageHeader
        breadcrumbs={breadcrumbs}
        title="장비 추가"
        description="내 장비의 기본 정보와 공개 상태를 먼저 등록합니다. 정비 기록, 부품, 사진은 장비 생성 후 단계적으로 연결합니다."
        action={
          <Link href="/garage/">
            <Button variant="secondary">내 차고로 돌아가기</Button>
          </Link>
        }
      />

      <EquipmentForm />
    </main>
  );
}
