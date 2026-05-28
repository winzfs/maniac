import { equipmentCategories } from "@/shared/data/equipment-categories";
import Link from "next/link";

export function MenuButton({ label = "메뉴" }: { label?: string }) {
  return (
    <details className="group relative inline-block">
      <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-full bg-garage-orange px-5 py-3 text-sm font-black text-white shadow-sm transition hover:opacity-90 sm:px-6 sm:text-base">
        <span>{label}</span>
        <span aria-hidden="true" className="text-base transition group-open:rotate-180">⌄</span>
      </summary>
      <div className="absolute left-0 z-20 mt-2 w-72 overflow-hidden rounded-[1.5rem] border border-border bg-surface p-2 shadow-lg sm:w-80">
        <div className="grid gap-1 text-sm">
          <Link href="/" className="rounded-2xl px-3 py-2 font-semibold hover:bg-background">홈</Link>
          <Link href="/explore/" className="rounded-2xl px-3 py-2 font-semibold hover:bg-background">장비 둘러보기</Link>
          <Link href="/garage/" className="rounded-2xl px-3 py-2 font-semibold hover:bg-background">내 차고</Link>
          <Link href="/me/" className="rounded-2xl px-3 py-2 font-semibold hover:bg-background">내 정보</Link>
        </div>
        <div className="my-2 h-px bg-border" />
        <div className="grid max-h-72 gap-1 overflow-y-auto text-sm">
          {equipmentCategories.map((category) => (
            <Link key={category.slug} href={`/explore/${category.slug}/`} className="flex items-center justify-between rounded-2xl px-3 py-2 hover:bg-background">
              <span>{category.label}</span>
              <span className="text-xs text-text-secondary">{category.boards.length}</span>
            </Link>
          ))}
        </div>
      </div>
    </details>
  );
}
