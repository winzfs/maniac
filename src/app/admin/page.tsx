import type { Metadata } from "next";
import { MenuButton } from "@/shared/components/navigation/MenuButton";
import { AdminDashboardClient } from "@/features/admin/components/AdminDashboardClient";

export const metadata: Metadata = {
  title: "관리 모드",
  description: "GearDuck 관리자 전용 모드입니다.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <main className="container-shell max-w-full space-y-8 overflow-x-hidden py-5 sm:py-8 lg:space-y-10 lg:py-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-orange-600">Admin Mode</p>
          <h1 className="text-3xl font-black tracking-[-0.05em] sm:text-5xl">관리 모드</h1>
          <p className="mt-2 text-sm leading-6 text-text-secondary">게시글, 댓글, 뉴스를 빠르게 확인하고 숨김/삭제 처리합니다.</p>
        </div>
        <MenuButton />
      </header>

      <AdminDashboardClient />
    </main>
  );
}
