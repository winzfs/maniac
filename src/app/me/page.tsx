import { MeProfileClient } from "@/features/auth/MeProfileClient";
import { MeSummaryClient } from "@/features/auth/MeSummaryClient";
import { PageHeader } from "@/shared/components/navigation/PageHeader";

export default function MePage() {
  return (
    <main className="container-shell space-y-8 py-5 sm:py-8 lg:space-y-12">
      <PageHeader breadcrumbs={[{ label: "홈", href: "/" }, { label: "내 정보" }]} />

      <MeProfileClient />
      <MeSummaryClient />
    </main>
  );
}
